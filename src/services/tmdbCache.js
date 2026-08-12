/**
 * services/tmdbCache.js
 * Two-level cache: in-memory (fast, gone on refresh) + sessionStorage (persists tab session).
 *
 * Strategy:
 *   - Memory cache: unlimited, zero serialisation cost, evicted on page reload
 *   - Session cache: survives soft navigations, bounded by MAX_SESSION_ENTRIES
 *   - Both layers use per-entry TTL (default 5 minutes)
 *
 * Usage:
 *   import cache from './tmdbCache';
 *   cache.get(key)          // → data | null
 *   cache.set(key, data)    // stores in both layers
 *   cache.has(key)          // boolean
 *   cache.invalidate(key)   // delete from both
 *   cache.clear()           // purge all
 */

const MEMORY_TTL_MS       = 5  * 60 * 1000;  // 5 min
const SESSION_TTL_MS      = 10 * 60 * 1000;  // 10 min
const MAX_SESSION_ENTRIES = 80;               // cap sessionStorage usage
const SESSION_PREFIX      = 'tmdb_cache_v1_';

// ── In-memory store ───────────────────────────────────────────────
const mem = new Map(); // key → { data, expiresAt }

// ── Helpers ───────────────────────────────────────────────────────
function memGet(key) {
  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { mem.delete(key); return null; }
  return entry.data;
}

function memSet(key, data, ttl = MEMORY_TTL_MS) {
  mem.set(key, { data, expiresAt: Date.now() + ttl });
}

function sessionGet(key) {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) { sessionStorage.removeItem(SESSION_PREFIX + key); return null; }
    return entry.data;
  } catch {
    return null;
  }
}

function sessionSet(key, data, ttl = SESSION_TTL_MS) {
  try {
    // Evict oldest entries when cap is reached
    const allKeys = Object.keys(sessionStorage)
      .filter(k => k.startsWith(SESSION_PREFIX));
    if (allKeys.length >= MAX_SESSION_ENTRIES) {
      // Remove the first (oldest-inserted) entry
      sessionStorage.removeItem(allKeys[0]);
    }
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify({ data, expiresAt: Date.now() + ttl }));
  } catch {
    // sessionStorage quota exceeded — silently skip
  }
}

// ── Public API ────────────────────────────────────────────────────
const cache = {
  get(key) {
    return memGet(key) ?? sessionGet(key);
  },

  set(key, data) {
    memSet(key, data);
    sessionSet(key, data);
  },

  has(key) {
    return cache.get(key) !== null;
  },

  invalidate(key) {
    mem.delete(key);
    try { sessionStorage.removeItem(SESSION_PREFIX + key); } catch {}
  },

  clear() {
    mem.clear();
    try {
      Object.keys(sessionStorage)
        .filter(k => k.startsWith(SESSION_PREFIX))
        .forEach(k => sessionStorage.removeItem(k));
    } catch {}
  },

  /** Return stale value (if any) while ignoring TTL — for stale-while-revalidate */
  getStale(key) {
    const entry = mem.get(key);
    if (entry) return entry.data;
    try {
      const raw = sessionStorage.getItem(SESSION_PREFIX + key);
      if (raw) return JSON.parse(raw).data;
    } catch {}
    return null;
  },
};

export default cache;
