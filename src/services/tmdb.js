/**
 * services/tmdb.js  —  Phase 4: Production TMDB Service
 *
 * Architecture:
 *   1. All requests go through `get()` → tmdbQueue (dedup + backoff) → tmdbCache
 *   2. Every response is normalised into a consistent MediaItem shape
 *   3. Images are returned as path-only; use posterUrl/backdropUrl helpers for URLs
 *   4. Anime strategy: /discover/tv with genre=16 + origin_country=JP (broader than /search)
 */

import { TMDB_CONFIG, POSTER_SIZES, BACKDROP_SIZES, PROFILE_SIZES, GENRE_MAP, ANIME_CONFIG } from './tmdbConfig';
import { queuedFetch } from './tmdbQueue';
import cache from './tmdbCache';
import { TMDBNetworkError } from './tmdbErrors';

const { API_KEY, BASE_URL, IMG_BASE, LANGUAGE } = TMDB_CONFIG;

// ── Image URL builders ─────────────────────────────────────────────────────

/**
 * Build a responsive poster URL.
 * @param {string|null} path  — TMDB poster_path value
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'original'} size
 */
export function posterUrl(path, size = 'md') {
  if (!path) return null;
  const sizeCode = POSTER_SIZES[size] ?? size; // accept raw size codes too
  return `${IMG_BASE}/${sizeCode}${path}`;
}

/**
 * Build a responsive backdrop URL.
 * @param {string|null} path  — TMDB backdrop_path value
 * @param {'sm'|'md'|'lg'|'original'} size
 */
export function backdropUrl(path, size = 'lg') {
  if (!path) return null;
  const sizeCode = BACKDROP_SIZES[size] ?? size;
  return `${IMG_BASE}/${sizeCode}${path}`;
}

/**
 * Build a cast profile image URL.
 */
export function profileUrl(path, size = 'md') {
  if (!path) return null;
  const sizeCode = PROFILE_SIZES[size] ?? size;
  return `${IMG_BASE}/${sizeCode}${path}`;
}

/**
 * Build a srcSet string for a poster image (for responsive <img> or <picture>).
 * Returns a comma-separated list of `url widthDescriptor` pairs.
 */
export function posterSrcSet(path) {
  if (!path) return '';
  return [
    `${IMG_BASE}/${POSTER_SIZES.sm}${path} 154w`,
    `${IMG_BASE}/${POSTER_SIZES.md}${path} 342w`,
    `${IMG_BASE}/${POSTER_SIZES.lg}${path} 500w`,
    `${IMG_BASE}/${POSTER_SIZES.xl}${path} 780w`,
  ].join(', ');
}

/**
 * Build a srcSet string for a backdrop image.
 */
export function backdropSrcSet(path) {
  if (!path) return '';
  return [
    `${IMG_BASE}/${BACKDROP_SIZES.sm}${path} 300w`,
    `${IMG_BASE}/${BACKDROP_SIZES.md}${path} 780w`,
    `${IMG_BASE}/${BACKDROP_SIZES.lg}${path} 1280w`,
    `${IMG_BASE}/${BACKDROP_SIZES.original}${path} 1920w`,
  ].join(', ');
}

// ── Core fetch ────────────────────────────────────────────────────────────

/**
 * Build a cache/dedup key from endpoint + params.
 */
function buildCacheKey(endpoint, params) {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${endpoint}?${sorted}`;
}

/**
 * Core GET — cache → queue → normalise.
 * @param {string}       endpoint   e.g. '/movie/popular'
 * @param {Object}       params     Extra query params
 * @param {AbortSignal}  signal     Optional cancellation
 */
async function get(endpoint, params = {}, signal = null) {
  const cacheKey = buildCacheKey(endpoint, params);

  // 1. Serve from cache if fresh
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // 2. Build URL
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', LANGUAGE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  // 3. Fetch (with dedup + retry)
  let data;
  try {
    data = await queuedFetch(url.toString(), cacheKey, signal);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    // Wrap raw TypeError (network down) into our error class
    if (err instanceof TypeError) throw new TMDBNetworkError(err);
    throw err;
  }

  // 4. Store in cache
  cache.set(cacheKey, data);
  return data;
}

// ── Normaliser ────────────────────────────────────────────────────────────

/**
 * Normalise a raw TMDB item into a consistent MediaItem shape.
 * All consumers use this shape; never access raw TMDB fields directly.
 *
 * @typedef {Object} MediaItem
 * @property {number}      id
 * @property {string}      title
 * @property {string|null} posterPath       — raw TMDB path, use posterUrl() to build URLs
 * @property {string|null} backdropPath     — raw TMDB path
 * @property {string}      overview
 * @property {number|null} rating           — vote_average
 * @property {number}      voteCount
 * @property {string|null} releaseDate      — ISO date string
 * @property {'movie'|'tv'|string} mediaType
 * @property {number[]}    genreIds
 * @property {string[]}    genreNames       — resolved from GENRE_MAP
 * @property {Object[]|null} genreObjects   — [{id, name}] when present on detail responses
 * @property {number|null} runtime          — minutes (movies)
 * @property {number|null} seasons          — (TV shows)
 * @property {number|null} episodes         — (TV shows)
 * @property {string}      tagline
 * @property {string}      status
 * @property {string}      originalLanguage
 * @property {string}      originalTitle
 * @property {Object|null} credits
 * @property {Object|null} videos
 * @property {Object|null} similar
 * @property {Object|null} recommendations
 */
export function normalise(item, overrideMediaType = null) {
  const mediaType = overrideMediaType || item.media_type || (item.title ? 'movie' : 'tv');

  // Resolve genre IDs → names from static map
  const genreIds    = item.genre_ids || item.genres?.map(g => g.id) || [];
  const genreObjects = item.genres   || null;
  const genreNames  = genreIds.map(id => GENRE_MAP[id]).filter(Boolean);

  return {
    id:              item.id,
    title:           item.title || item.name || 'Unknown',
    originalTitle:   item.original_title || item.original_name || '',
    posterPath:      item.poster_path     || null,
    backdropPath:    item.backdrop_path   || null,
    overview:        item.overview        || '',
    rating:          typeof item.vote_average === 'number' ? item.vote_average : null,
    voteCount:       item.vote_count      ?? 0,
    popularity:      item.popularity      ?? 0,
    releaseDate:     item.release_date    || item.first_air_date || null,
    firstAirDate:    item.first_air_date  || null,
    lastAirDate:     item.last_air_date   || null,
    mediaType,
    genreIds,
    genreNames,
    genreObjects,
    runtime:         item.runtime                  || null,
    seasons:         item.number_of_seasons        || null,
    episodes:        item.number_of_episodes       || null,
    numberOfSeasons: item.number_of_seasons        || null,
    numberOfEpisodes: item.number_of_episodes      || null,
    tagline:         item.tagline                  || '',
    status:          item.status                   || '',
    originalLanguage: item.original_language       || '',
    spokenLanguages: item.spoken_languages?.map(l => l.english_name || l.name) || [],
    productionCountries: item.production_countries?.map(c => c.name) || [],
    adult:           item.adult                    || false,
    // Appended responses (only present on detail calls)
    credits:         item.credits          || null,
    videos:          item.videos           || null,
    similar:         item.similar          || null,
    recommendations: item.recommendations  || null,
    providers:       item['watch/providers']?.results || null,
    // Network info (TV)
    networks:        item.networks         || null,
    // TV season summary list — array of {id, name, poster_path, season_number, episode_count, air_date}
    // Preserved so the detail page can build a real season dropdown with actual names
    seasonsList:     item.seasons          || null,
    // Production (movies)
    productionCompanies: item.production_companies || null,
    budget:          item.budget           || null,
    revenue:         item.revenue          || null,
  };
}

// ── Pagination helper ─────────────────────────────────────────────────────

/** Wrap a paginated TMDB response consistently. */
function paginated(data, mediaType) {
  return {
    results:    data.results.map(item => normalise(item, mediaType)),
    page:       data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

// ── Public API ────────────────────────────────────────────────────────────

// --- Trending ---

/** Trending this week — mixed movies + TV (used for Hero Banner) */
export async function getTrending(timeWindow = 'week', signal = null) {
  const data = await get(`/trending/all/${timeWindow}`, {}, signal);
  return data.results.map(item => normalise(item));
}

/** Trending today */
export async function getTrendingToday(signal = null) {
  const data = await get('/trending/all/day', {}, signal);
  return data.results.map(item => normalise(item));
}

/** Trending movies only */
export async function getTrendingMovies(timeWindow = 'week', signal = null) {
  const data = await get(`/trending/movie/${timeWindow}`, {}, signal);
  return data.results.map(item => normalise(item, 'movie'));
}

/** Trending TV only */
export async function getTrendingTV(timeWindow = 'week', signal = null) {
  const data = await get(`/trending/tv/${timeWindow}`, {}, signal);
  return data.results.map(item => normalise(item, 'tv'));
}

// --- Movies ---

/** Popular movies (paginated) */
export async function getPopularMovies(page = 1, signal = null) {
  const data = await get('/movie/popular', { page }, signal);
  return paginated(data, 'movie');
}

/** Top-rated movies (paginated) */
export async function getTopRatedMovies(page = 1, signal = null) {
  const data = await get('/movie/top_rated', { page }, signal);
  return paginated(data, 'movie');
}

/** Now playing in cinemas (paginated) */
export async function getNowPlaying(page = 1, signal = null) {
  const data = await get('/movie/now_playing', { page }, signal);
  return paginated(data, 'movie');
}

/** Upcoming movies (paginated) */
export async function getUpcoming(page = 1, signal = null) {
  const data = await get('/movie/upcoming', { page }, signal);
  return paginated(data, 'movie');
}

/** Movie details + appended responses */
export async function getMovieDetails(id, signal = null) {
  const data = await get(`/movie/${id}`, {
    append_to_response: 'credits,videos,similar,recommendations,keywords,watch/providers',
  }, signal);
  return normalise(data, 'movie');
}

export async function getMovieCredits(id, signal = null) {
  const data = await get(`/movie/${id}/credits`, {}, signal);
  return data;
}

export async function getMovieVideos(id, signal = null) {
  const data = await get(`/movie/${id}/videos`, {}, signal);
  return data.results || [];
}

export async function getMovieRecommendations(id, page = 1, signal = null) {
  const data = await get(`/movie/${id}/recommendations`, { page }, signal);
  return paginated(data, 'movie');
}

export async function getMovieSimilar(id, page = 1, signal = null) {
  const data = await get(`/movie/${id}/similar`, { page }, signal);
  return paginated(data, 'movie');
}

export async function getMovieProviders(id, signal = null) {
  const data = await get(`/movie/${id}/watch/providers`, {}, signal);
  return data.results || {};
}

/** Discover movies by genre */
export async function discoverMoviesByGenre(genreId, page = 1, signal = null) {
  const data = await get('/discover/movie', {
    with_genres:  genreId,
    sort_by:      'popularity.desc',
    page,
  }, signal);
  return paginated(data, 'movie');
}

// --- TV Shows ---

/** Popular TV shows (paginated) */
export async function getPopularTV(page = 1, signal = null) {
  const data = await get('/tv/popular', { page }, signal);
  return paginated(data, 'tv');
}

/** Top-rated TV shows (paginated) */
export async function getTopRatedTV(page = 1, signal = null) {
  const data = await get('/tv/top_rated', { page }, signal);
  return paginated(data, 'tv');
}

/** TV show details + appended responses */
export async function getTVDetails(id, signal = null) {
  const data = await get(`/tv/${id}`, {
    append_to_response: 'credits,videos,similar,recommendations,keywords,watch/providers',
  }, signal);
  return normalise(data, 'tv');
}

export async function getTVCredits(id, signal = null) {
  const data = await get(`/tv/${id}/credits`, {}, signal);
  return data;
}

export async function getTVVideos(id, signal = null) {
  const data = await get(`/tv/${id}/videos`, {}, signal);
  return data.results || [];
}

export async function getTVRecommendations(id, page = 1, signal = null) {
  const data = await get(`/tv/${id}/recommendations`, { page }, signal);
  return paginated(data, 'tv');
}

export async function getTVSimilar(id, page = 1, signal = null) {
  const data = await get(`/tv/${id}/similar`, { page }, signal);
  return paginated(data, 'tv');
}

export async function getTVProviders(id, signal = null) {
  const data = await get(`/tv/${id}/watch/providers`, {}, signal);
  return data.results || {};
}

/** TV season details with episode list */
export async function getTVSeasonDetails(tvId, seasonNumber = 1, signal = null) {
  const data = await get(`/tv/${tvId}/season/${seasonNumber}`, {}, signal);
  return normaliseSeason(data, tvId);
}

/** TV episode details */
export async function getTVEpisodeDetails(tvId, seasonNumber = 1, episodeNumber = 1, signal = null) {
  const data = await get(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {}, signal);
  return normaliseEpisode(data, tvId, seasonNumber);
}

/** Watch providers (legal streaming links/providers) */
export async function getWatchProviders(id, mediaType = 'movie', signal = null) {
  const data = await get(`/${mediaType}/${id}/watch/providers`, {}, signal);
  return data.results || {};
}

/** Normalise TV episode */
export function normaliseEpisode(ep, tvId = null, seasonNumber = 1) {
  return {
    id: ep.id,
    tvId,
    episodeNumber: ep.episode_number,
    seasonNumber: ep.season_number ?? seasonNumber,
    name: ep.name || `Episode ${ep.episode_number}`,
    overview: ep.overview || '',
    stillPath: ep.still_path || null,
    airDate: ep.air_date || null,
    voteAverage: ep.vote_average ?? null,
    voteCount: ep.vote_count ?? 0,
    runtime: ep.runtime || null,
    episodeCode: `S${String(ep.season_number ?? seasonNumber).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`,
  };
}

/** Normalise TV season */
export function normaliseSeason(seasonData, tvId = null) {
  return {
    id: seasonData.id,
    tvId,
    seasonNumber: seasonData.season_number,
    name: seasonData.name || `Season ${seasonData.season_number}`,
    overview: seasonData.overview || '',
    posterPath: seasonData.poster_path || null,
    airDate: seasonData.air_date || null,
    episodes: (seasonData.episodes || []).map(ep => normaliseEpisode(ep, tvId, seasonData.season_number)),
  };
}

// --- Anime ---

/**
 * Anime discovery strategy:
 *   TMDB does not have an "anime" category — we use /discover/tv with:
 *     - with_genres=16 (Animation)
 *     - with_origin_country=JP (Japanese origin)
 *     - vote_count.gte=50 (filter out obscure titles)
 *     - sort_by=popularity.desc (most-watched first)
 *
 * This is the most reliable approach — /search/keyword "anime" returns
 * inconsistent results and /discover/movie misses most anime titles.
 */
export async function getAnime(page = 1, signal = null) {
  const data = await get('/discover/tv', {
    with_genres:          ANIME_CONFIG.genre_id,
    with_origin_country:  ANIME_CONFIG.origin_country,
    sort_by:              'popularity.desc',
    'vote_count.gte':     ANIME_CONFIG.min_vote_count,
    page,
  }, signal);
  return paginated(data, 'tv');
}

/** Top-rated anime — higher vote threshold for quality filtering */
export async function getTopRatedAnime(signal = null) {
  const data = await get('/discover/tv', {
    with_genres:          ANIME_CONFIG.genre_id,
    with_origin_country:  ANIME_CONFIG.origin_country,
    sort_by:              'vote_average.desc',
    'vote_count.gte':     300, // stricter threshold for "top rated"
  }, signal);
  return data.results.map(item => normalise(item, 'tv'));
}

/** Upcoming / airing-soon anime */
export async function getAiringAnime(signal = null) {
  const data = await get('/discover/tv', {
    with_genres:          ANIME_CONFIG.genre_id,
    with_origin_country:  ANIME_CONFIG.origin_country,
    sort_by:              'first_air_date.desc',
    'vote_count.gte':     10,
  }, signal);
  return data.results.map(item => normalise(item, 'tv'));
}

// --- Search ---

/**
 * Multi-search: movies + TV shows (excludes people).
 * Returns a paginated result object.
 */
export async function searchMulti(query, page = 1, signal = null) {
  if (!query?.trim()) return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  const data = await get('/search/multi', { query: query.trim(), page }, signal);
  return {
    results: data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => normalise(item)),
    page:         data.page,
    totalPages:   data.total_pages,
    totalResults: data.total_results,
  };
}

/** Search movies only */
export async function searchMovies(query, page = 1, signal = null) {
  if (!query?.trim()) return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  const data = await get('/search/movie', { query: query.trim(), page }, signal);
  return paginated(data, 'movie');
}

/** Search TV shows only */
export async function searchTV(query, page = 1, signal = null) {
  if (!query?.trim()) return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  const data = await get('/search/tv', { query: query.trim(), page }, signal);
  return paginated(data, 'tv');
}

// --- Videos ---

/** Fetch trailers + clips for a movie or TV show */
export async function getVideos(id, type = 'movie', signal = null) {
  const data = await get(`/${type}/${id}/videos`, {}, signal);
  return data.results || [];
}

/** Get the best YouTube trailer key, or null */
export function pickTrailer(videos = []) {
  const yt = videos.filter(v => v.site === 'YouTube');
  return (
    yt.find(v => v.type === 'Trailer' && v.official) ||
    yt.find(v => v.type === 'Trailer') ||
    yt.find(v => v.type === 'Teaser')  ||
    null
  );
}

// --- Genres ---

/** All movie genres from TMDB */
export async function getMovieGenres(signal = null) {
  const data = await get('/genre/movie/list', {}, signal);
  return data.genres;
}

/** All TV genres from TMDB */
export async function getTVGenres(signal = null) {
  const data = await get('/genre/tv/list', {}, signal);
  return data.genres;
}

// --- Images ---

/**
 * Preload an image by creating an off-screen Image object.
 * Returns a promise that resolves when loaded (or rejects on error).
 */
export function preloadImage(url) {
  if (!url) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = resolve;
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Preload a list of poster/backdrop URLs in the background.
 * Failures are swallowed — this is best-effort.
 */
export function preloadImages(urls = []) {
  urls.forEach(url => preloadImage(url).catch(() => {}));
}
