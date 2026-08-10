import { useState, useEffect } from 'react';

/**
 * useTMDB — generic data-fetching hook for TMDB service functions.
 *
 * @param {Function} fetcher  — async function from services/tmdb.js
 * @param {Array}    deps     — dependency array (like useEffect)
 * @returns {{ data, loading, error }}
 */
export default function useTMDB(fetcher, deps = []) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Failed to load');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
