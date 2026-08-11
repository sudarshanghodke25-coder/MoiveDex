/**
 * services/tmdb.js
 * Centralized TMDB API service — Phase 3 full version.
 */

const API_KEY  = import.meta.env.VITE_TMDB_API_KEY || 'bb6b566f15405bd7df69eefd0eec52b7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

/** Build a full poster URL from a TMDB poster_path */
export function posterUrl(path, size = 'w342') {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

/** Build a full backdrop URL */
export function backdropUrl(path, size = 'w1280') {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

/** Generic GET with error mapping */
async function get(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const code = res.status;
    if (code === 401) throw new Error('TMDB authentication error — check API key');
    if (code === 404) throw new Error('Not found');
    if (code === 429) throw new Error('Rate limited — slow down requests');
    throw new Error(`TMDB error ${code}`);
  }
  return res.json();
}

/** Normalise a raw TMDB item into a consistent shape */
export function normalise(item) {
  return {
    id:          item.id,
    title:       item.title || item.name || 'Unknown',
    posterPath:  item.poster_path   || null,
    backdropPath:item.backdrop_path || null,
    overview:    item.overview      || '',
    rating:      item.vote_average  ?? null,
    voteCount:   item.vote_count    ?? 0,
    releaseDate: item.release_date  || item.first_air_date || null,
    mediaType:   item.media_type    || 'movie',
    genres:      item.genre_ids     || item.genres?.map(g => g.id) || [],
    genreNames:  item.genres        || [],
    runtime:     item.runtime       || null,
    seasons:     item.number_of_seasons || null,
    tagline:     item.tagline       || '',
    status:      item.status        || '',
    originalLanguage: item.original_language || '',
    credits:     item.credits       || null,
    videos:      item.videos        || null,
    similar:     item.similar       || null,
    recommendations: item.recommendations || null,
  };
}

// ── Public API ────────────────────────────────────────────────────

/** Trending this week (mixed movies + TV) */
export async function getTrending(timeWindow = 'week') {
  const data = await get(`/trending/all/${timeWindow}`);
  return data.results.map(normalise);
}

/** Trending today */
export async function getTrendingToday() {
  const data = await get('/trending/all/day');
  return data.results.map(normalise);
}

/** Popular movies */
export async function getPopularMovies(page = 1) {
  const data = await get('/movie/popular', { page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'movie' })), totalPages: data.total_pages };
}

/** Popular TV shows */
export async function getPopularTV(page = 1) {
  const data = await get('/tv/popular', { page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'tv' })), totalPages: data.total_pages };
}

/** Now playing movies */
export async function getNowPlaying(page = 1) {
  const data = await get('/movie/now_playing', { page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'movie' })), totalPages: data.total_pages };
}

/** Upcoming movies */
export async function getUpcoming(page = 1) {
  const data = await get('/movie/upcoming', { page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'movie' })), totalPages: data.total_pages };
}

/** Top-rated movies */
export async function getTopRatedMovies(page = 1) {
  const data = await get('/movie/top_rated', { page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'movie' })), totalPages: data.total_pages };
}

/** Top-rated TV */
export async function getTopRatedTV(page = 1) {
  const data = await get('/tv/top_rated', { page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'tv' })), totalPages: data.total_pages };
}

/** Anime — Japanese animated shows */
export async function getAnime(page = 1) {
  const data = await get('/discover/tv', {
    with_genres: '16',
    with_origin_country: 'JP',
    sort_by: 'popularity.desc',
    'vote_count.gte': '100',
    page,
  });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'tv' })), totalPages: data.total_pages };
}

/** Top-rated Anime */
export async function getTopRatedAnime() {
  const data = await get('/discover/tv', {
    with_genres: '16',
    with_origin_country: 'JP',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '300',
  });
  return data.results.map(item => normalise({ ...item, media_type: 'tv' }));
}

/** Search multi (movies + tv) */
export async function searchMulti(query, page = 1) {
  if (!query) return { results: [], totalPages: 0 };
  const data = await get('/search/multi', { query, page });
  return {
    results: data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(normalise),
    totalPages: data.total_pages,
  };
}

/** Get movie details by ID */
export async function getMovieDetails(id) {
  const data = await get(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' });
  return normalise({ ...data, media_type: 'movie' });
}

/** Get TV details by ID */
export async function getTVDetails(id) {
  const data = await get(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' });
  return normalise({ ...data, media_type: 'tv' });
}

/** Get movie/TV videos (trailers) */
export async function getVideos(id, type = 'movie') {
  const data = await get(`/${type}/${id}/videos`);
  return data.results;
}

/** Get movie genres */
export async function getMovieGenres() {
  const data = await get('/genre/movie/list');
  return data.genres;
}

/** Get TV genres */
export async function getTVGenres() {
  const data = await get('/genre/tv/list');
  return data.genres;
}

/** Discover movies by genre */
export async function discoverMoviesByGenre(genreId, page = 1) {
  const data = await get('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc', page });
  return { results: data.results.map(item => normalise({ ...item, media_type: 'movie' })), totalPages: data.total_pages };
}
