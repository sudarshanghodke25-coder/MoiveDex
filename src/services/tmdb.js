/**
 * services/tmdb.js
 * Centralized TMDB API service — Phase 1 minimal version.
 * Provides real movie/TV data for landing page display.
 * Full service layer will be expanded in Phase 3.
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
function normalise(item) {
  return {
    id:          item.id,
    title:       item.title || item.name || 'Unknown',
    posterPath:  item.poster_path   || null,
    backdropPath:item.backdrop_path || null,
    overview:    item.overview      || '',
    rating:      item.vote_average  ?? null,
    releaseDate: item.release_date  || item.first_air_date || null,
    mediaType:   item.media_type    || 'movie',
    genres:      item.genre_ids     || [],
  };
}

// ── Public API ────────────────────────────────────────────────────

/** Trending this week (mixed movies + TV) */
export async function getTrending(timeWindow = 'week') {
  const data = await get(`/trending/all/${timeWindow}`);
  return data.results.map(normalise);
}

/** Popular movies */
export async function getPopularMovies() {
  const data = await get('/movie/popular');
  return data.results.map(item => normalise({ ...item, media_type: 'movie' }));
}

/** Popular TV shows */
export async function getPopularTV() {
  const data = await get('/tv/popular');
  return data.results.map(item => normalise({ ...item, media_type: 'tv' }));
}

/** Anime — fetched as TV animation genre from Japan */
export async function getAnime() {
  const data = await get('/discover/tv', {
    with_genres: '16',
    with_origin_country: 'JP',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
  });
  return data.results.map(item => normalise({ ...item, media_type: 'anime' }));
}

/** Top-rated movies */
export async function getTopRatedMovies() {
  const data = await get('/movie/top_rated');
  return data.results.map(item => normalise({ ...item, media_type: 'movie' }));
}
