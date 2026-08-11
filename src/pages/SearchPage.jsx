import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query,    setQuery]   = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [results,  setResults] = useState([]);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page,     setPage]    = useState(1);

  const runSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true); setError(null);
    try {
      const data = await searchMulti(q, p);
      setResults(p === 1 ? data.results : prev => [...prev, ...data.results]);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on initial load if URL has query
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const q = inputVal.trim();
    setQuery(q);
    setPage(1);
    setSearchParams(q ? { q } : {});
    runSearch(q, 1);
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    runSearch(query, nextPage);
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Search</span>
        </h1>
        <p className="page-subtitle">Find movies, TV shows, and anime from millions of titles.</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="search-input-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search for movies, TV shows, anime..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button type="submit" className="btn-primary search-submit-btn">Search</button>
        </div>
      </form>

      {/* Results */}
      {query && !loading && results.length === 0 && !error && (
        <div className="empty-state">
          <span style={{ fontSize: '4rem' }}>🔍</span>
          <h3>No results found for "{query}"</h3>
          <p>Try a different search term or check the spelling.</p>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {results.length > 0 && (
        <div>
          <p className="results-count">
            Showing results for <strong>"{query}"</strong>
          </p>
          <div className="media-grid">
            {results.map(m => <MovieCard key={`${m.mediaType}-${m.id}`} movie={m} />)}
            {loading && [...Array(8)].map((_, i) => (
              <div key={`sk-${i}`} className="movie-card movie-card--md">
                <div className="card-poster skeleton" />
                <div className="card-info">
                  <div className="skeleton" style={{ height: '0.875rem', width: '80%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '50%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
          {page < totalPages && !loading && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="btn-ghost" onClick={loadMore}>Load More</button>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="empty-state">
          <span style={{ fontSize: '4rem' }}>🎬</span>
          <h3>What are you looking for?</h3>
          <p>Search for your favorite movies or TV shows above.</p>
        </div>
      )}
    </div>
  );
}
