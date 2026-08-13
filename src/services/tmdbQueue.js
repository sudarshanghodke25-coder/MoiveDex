/**
 * services/tmdbQueue.js
 * Rate-limit-aware request queue with exponential backoff.
 *
 * TMDB allows ~40 requests / 10 seconds per API key.
 * This queue:
 *   1. Deduplicates concurrent identical requests (inflight map)
 *   2. On 429: waits `Retry-After` seconds then retries (up to MAX_RETRIES)
 *   3. Uses exponential backoff for other transient errors (5xx)
 *   4. Supports AbortSignal passthrough
 */

import { mapResponseError, TMDBRateLimitError } from './tmdbErrors';

const MAX_RETRIES   = 3;
const BASE_DELAY_MS = 500; // first back-off delay

// In-flight map: cacheKey → Promise<json>
const inflight = new Map();

/**
 * Execute a TMDB fetch with retry + deduplication.
 *
 * @param {string}      url        Full URL string
 * @param {string}      cacheKey   Deduplication key (same as cache key)
 * @param {AbortSignal} signal     Optional AbortSignal
 * @returns {Promise<any>}
 */
export async function queuedFetch(url, cacheKey, signal = null) {
  // Deduplicate concurrent identical requests
  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey);
  }

  const promise = executeWithRetry(url, signal, 0);
  inflight.set(cacheKey, promise);
  promise.finally(() => inflight.delete(cacheKey));
  return promise;
}

async function executeWithRetry(url, signal, attempt) {
  const endpoint = new URL(url).pathname;

  try {
    const res = await fetch(url, { signal });

    if (res.ok) return res.json();

    const err = mapResponseError(res, endpoint);

    if (err instanceof TMDBRateLimitError && attempt < MAX_RETRIES) {
      const delay = err.retryAfter * 1000;
      console.warn(`[TMDB] Rate limited. Retrying in ${err.retryAfter}s… (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return executeWithRetry(url, signal, attempt + 1);
    }

    // 5xx transient error — exponential backoff
    if (res.status >= 500 && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`[TMDB] Server error ${res.status}. Retrying in ${delay}ms… (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return executeWithRetry(url, signal, attempt + 1);
    }

    throw err;
  } catch (err) {
    if (err.name === 'AbortError') throw err; // don't retry aborts

    // Network-level failure — retry with backoff
    if (!err.statusCode && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`[TMDB] Network error. Retrying in ${delay}ms… (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return executeWithRetry(url, signal, attempt + 1);
    }

    throw err;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
