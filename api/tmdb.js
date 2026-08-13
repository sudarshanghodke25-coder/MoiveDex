/**
 * api/tmdb.js — TMDB API-key proxy (Vercel Serverless Function)
 *
 * Hides the TMDB API key from the browser bundle.
 *
 *   GET /api/tmdb?path=/movie/popular&page=1
 *     →  https://api.themoviedb.org/3/movie/popular?api_key=***&page=1
 *
 * The client can only request a *path* — it can never supply, see, or override
 * the API key, and it can never redirect the proxy to another host.
 *
 * Server-side env var (never VITE_-prefixed, never in the bundle):
 *   TMDB_API_KEY   Set in Vercel → Project → Settings → Environment Variables
 */

const TMDB_BASE = 'https://api.themoviedb.org/3';

/** TMDB path segments are alphanumeric slugs / numeric IDs — nothing else. */
const SEGMENT_RE = /^[A-Za-z0-9._-]+$/;

export default async function handler(req, res) {
  // 1. GET only — this proxy is read-only.
  if (req.method !== 'GET') {
    res.status(405).json({ status_message: 'Method Not Allowed' });
    return;
  }

  // 2. Server-side key — never exposed to the client.
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ status_message: 'TMDB_API_KEY is not configured on the server.' });
    return;
  }

  // 3. Validate the requested TMDB path (rejects traversal, backslashes, //, …).
  const endpoint = req.query.path;
  if (
    typeof endpoint !== 'string' ||
    !endpoint.startsWith('/') ||
    endpoint.includes('..') ||
    endpoint.includes('//') ||
    endpoint.includes('\\')
  ) {
    res.status(400).json({ status_message: 'Invalid TMDB path.' });
    return;
  }

  const segments = endpoint.split('/').filter(Boolean);
  if (segments.length === 0 || !segments.every((seg) => SEGMENT_RE.test(seg))) {
    res.status(400).json({ status_message: 'Invalid TMDB path.' });
    return;
  }

  // 4. Build the upstream URL — host is fixed, so no SSRF / open redirect is possible.
  let url;
  try {
    url = new URL(`${TMDB_BASE}${endpoint}`);
  } catch {
    res.status(400).json({ status_message: 'Invalid TMDB path.' });
    return;
  }
  url.searchParams.set('api_key', apiKey);

  // Forward remaining query params, but never let the client inject its own
  // api_key (or the path param itself).
  const BLOCKED = new Set(['api_key', 'path']);
  for (const [key, value] of Object.entries(req.query)) {
    if (BLOCKED.has(key)) continue;
    url.searchParams.set(key, Array.isArray(value) ? String(value[0]) : String(value));
  }

  // 5. Forward to TMDB.
  try {
    const upstream = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    const contentType = upstream.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await upstream.json()
      : await upstream.text();

    // Forward Retry-After so the client's rate-limit backoff (tmdbQueue) still works.
    const retryAfter = upstream.headers.get('retry-after');
    if (retryAfter) res.setHeader('Retry-After', retryAfter);

    // Short shared-cache so repeated loads don't burn TMDB quota.
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

    res.status(upstream.status).json(body);
  } catch (err) {
    console.error('[TMDB proxy] Upstream request failed:', err?.message);
    res.status(502).json({ status_message: 'Upstream TMDB request failed.' });
  }
}
