import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Paginated TMDB fetch hook for browse pages.
 * @param {Function} fetchPage - async (page) => { results, totalPages }
 * @param {Array} deps - refetch when these change
 */
export default function usePaginatedTMDB(fetchPage, deps = []) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetchPage);
  useEffect(() => { fetcherRef.current = fetchPage; }, [fetchPage]);

  const loadPage = useCallback(async (pageNum, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const data = await fetcherRef.current(pageNum);
      const results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      setItems(prev => append ? [...prev, ...results] : results);
      setTotalPages(data?.totalPages ?? 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.message || 'Failed to load content.');
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || page >= totalPages) return;
    loadPage(page + 1, true);
  }, [loadingMore, loading, page, totalPages, loadPage]);

  const retry = useCallback(() => loadPage(1, false), [loadPage]);

  return {
    items,
    loading,
    loadingMore,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    loadMore,
    retry,
  };
}
