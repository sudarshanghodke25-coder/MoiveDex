/**
 * services/tmdbErrors.js
 * Typed error hierarchy for TMDB API failures.
 * Consumers can `instanceof`-check to handle specific cases.
 */

export class TMDBError extends Error {
  constructor(message, statusCode = null, endpoint = null) {
    super(message);
    this.name        = 'TMDBError';
    this.statusCode  = statusCode;
    this.endpoint    = endpoint;
  }
}

export class TMDBAuthError extends TMDBError {
  constructor(endpoint) {
    super('TMDB API key is invalid or missing. Check VITE_TMDB_API_KEY.', 401, endpoint);
    this.name = 'TMDBAuthError';
  }
}

export class TMDBNotFoundError extends TMDBError {
  constructor(endpoint) {
    super(`Resource not found: ${endpoint}`, 404, endpoint);
    this.name = 'TMDBNotFoundError';
  }
}

export class TMDBRateLimitError extends TMDBError {
  constructor(retryAfter = 1) {
    super('TMDB rate limit reached. Retrying automatically…', 429);
    this.name       = 'TMDBRateLimitError';
    this.retryAfter = retryAfter; // seconds
  }
}

export class TMDBNetworkError extends TMDBError {
  constructor(originalError) {
    super(`Network error: ${originalError.message}`, null);
    this.name          = 'TMDBNetworkError';
    this.originalError = originalError;
  }
}

/**
 * Map a raw fetch response to the correct typed error.
 * @param {Response} res
 * @param {string}   endpoint
 */
export function mapResponseError(res, endpoint) {
  switch (res.status) {
    case 401: return new TMDBAuthError(endpoint);
    case 404: return new TMDBNotFoundError(endpoint);
    case 429: {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
      return new TMDBRateLimitError(retryAfter);
    }
    default:
      return new TMDBError(`Unexpected HTTP ${res.status} from TMDB`, res.status, endpoint);
  }
}
