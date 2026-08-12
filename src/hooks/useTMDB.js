/**
 * hooks/useTMDB.js  —  Phase 4 fixed
 *
 * Uses a `cancelled` flag instead of AbortController to avoid
 * React Strict Mode double-invocation AbortErrors.
 * Supports: retry/refetch, loading/error states, stable behaviour.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param {Function}  fetcher       Async function returning data.
 * @param {Array}     deps          Re-fetch when these change.
 * @param {Object}    [options]
 * @param {boolean}   [options.skip=false]     Skip fetching.
 *
 * @returns {{ data, loading, error, refetch, retry }}
 */
export default function useTMDB(fetcher, deps = [], options = {}) {
  const { skip = false } = options;

  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0); // increment to force re-fetch

  // Stable fetcher ref — avoids stale closure issues
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  useEffect(() => {
    if (skip) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef.current()
      .then(result => {
        if (cancelled) return;
        setData(Array.isArray(result) ? result : (result?.results ?? result ?? []));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.warn('[useTMDB] fetch error:', err?.message ?? err);
        setError(err?.message || 'Failed to load content. Please try again.');
        setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, tick, ...deps]);

  const refetch = useCallback(() => setTick(t => t + 1), []);
  const retry   = refetch;

  return { data, loading, error, refetch, retry };
}
