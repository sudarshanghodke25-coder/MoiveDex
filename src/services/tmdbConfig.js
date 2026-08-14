/**
 * services/tmdbConfig.js
 * Single source of truth for all TMDB API configuration.
 */

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.error(
    '[TMDB] Missing VITE_TMDB_API_KEY. Copy .env.example to .env and add your TMDB API key — see https://www.themoviedb.org/settings/api'
  );
}

export const TMDB_CONFIG = {
  API_KEY,
  BASE_URL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  IMG_BASE: import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p',
  LANGUAGE: import.meta.env.VITE_TMDB_LANGUAGE || 'en-US',
  REGION:   import.meta.env.VITE_TMDB_REGION || 'IN',
};

/**
 * TMDB API-key proxy — hides the API key from the browser bundle.
 *
 * When ENABLED, all TMDB data requests go through the serverless function in
 * `api/tmdb.js` (deployed on Vercel), which adds the key server-side. The
 * browser never sees or sends the key.
 *
 * Set VITE_USE_TMDB_PROXY=true in production. Keep it false for local dev
 * (Vite dev server does not serve serverless functions).
 */
export const TMDB_PROXY = {
  ENABLED:  import.meta.env.VITE_USE_TMDB_PROXY === 'true',
  BASE_URL: import.meta.env.VITE_TMDB_PROXY_URL || '/api/tmdb',
};

/** Supported TMDB image sizes for posters */
export const POSTER_SIZES = {
  xs:     'w92',
  sm:     'w154',
  md:     'w342',
  lg:     'w500',
  xl:     'w780',
  original: 'original',
};

/** Supported TMDB image sizes for backdrops */
export const BACKDROP_SIZES = {
  sm:     'w300',
  md:     'w780',
  lg:     'w1280',
  original: 'original',
};

/** Supported TMDB image sizes for cast profiles */
export const PROFILE_SIZES = {
  sm:  'w45',
  md:  'w185',
  lg:  'h632',
  original: 'original',
};

/** Logo sizes for provider/company logos */
export const LOGO_SIZES = {
  sm: 'w45',
  md: 'w92',
  lg: 'w154',
  original: 'original',
};

/** Episode still image sizes */
export const STILL_SIZES = {
  sm: 'w185',
  md: 'w300',
  lg: 'w780',
  original: 'original',
};

/** Genre ID → name map (static, avoids an extra API call) */
export const GENRE_MAP = {
  // Movie & TV shared
  28:    'Action',
  12:    'Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  14:    'Fantasy',
  36:    'History',
  27:    'Horror',
  10402: 'Music',
  9648:  'Mystery',
  10749: 'Romance',
  878:   'Sci-Fi',
  10770: 'TV Movie',
  53:    'Thriller',
  10752: 'War',
  37:    'Western',
  // TV-specific
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

/** Anime: TMDB genre IDs and country codes used in discover queries */
export const ANIME_CONFIG = {
  genre_id:      16,    // Animation
  origin_country: 'JP',
  min_vote_count: 50,
};
