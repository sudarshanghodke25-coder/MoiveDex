import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchMulti, searchPeople, profileUrl } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const DEBOUNCE_MS = 400;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query,        setQuery]   = useState(initialQuery);
  const [inputVal,     setInputVal] = useState(initialQuery);
  const [results,      setResults] = useState([]);
  const [people,       setPeople]  = useState([]);
  const [loading,      setLoading] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [error,        setError]   = useState(null);
  const [totalPages,   setTotalPages] = useState(0);
  const [page,         setPage]    = useState(1);

  const runSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) { setResults([]); setPeople([]); return; }
    setLoading(true); setError(null);
    try {
      const [data, peopleData] = await Promise.all([
        searchMulti(q, p),
        p === 1 ? searchPeople(q) : Promise.resolve({ results: [] }),
      ]);
      setResults(p === 1 ? data.results : prev => [...prev, ...data.results]);
      setTotalPages(data.totalPages);
      if (p === 1) {
        setPeople(peopleData.results || []);
        setPeopleLoading(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search as the user types (also covers the initial URL query)
  useEffect(() => {
    const trimmed = inputVal.trim();
    const t = setTimeout(() => {
      setPage(1);
      setQuery(trimmed);
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
      if (trimmed) {
        setPeopleLoading(true);
        runSearch(trimmed, 1);
      } else {
        setResults([]);
        setPeople([]);
        setPeopleLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [inputVal, runSearch, setSearchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = inputVal.trim();
    setPage(1);
    setQuery(q);
    setSearchParams(q ? { q } : {});
    if (q) {
      setPeopleLoading(true);
      runSearch(q, 1);
    }
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    runSearch(query, nextPage);
  }

  const movieCount = results.filter(r => r.mediaType === 'movie').length;
  const tvCount    = results.filter(r => r.mediaType === 'tv').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Search</span>
        </h1>
        <p className="page-subtitle">Find movies, TV shows, anime, and the people behind them.</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="search-input-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search for movies, TV shows, anime, people..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button type="submit" className="btn-primary search-submit-btn">Search</button>
        </div>
      </form>

      {/* Results header with type counts */}
      {query && !loading && results.length === 0 && people.length === 0 && !error && (
        <div className="empty-state">
          <span style={{ fontSize: '4rem' }}>🔍</span>
          <h3>No results found for "{query}"</h3>
          <p>Try a different search term or check the spelling.</p>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {query && (results.length > 0 || people.length > 0) && (
        <div>
          <p className="results-count">
            Showing results for <strong>"{query}"</strong>
            {(movieCount > 0 || tvCount > 0) && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                🎬 {movieCount} movie{movieCount !== 1 ? 's' : ''} · 📺 {tvCount} show{tvCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>

          {/* ── People results ─────────────────────────────────── */}
          {peopleLoading ? (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ width: '110px', flexShrink: 0 }}>
                  <div className="skeleton" style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 0.625rem' }} />
                  <div className="skeleton" style={{ height: '0.8rem', width: '80%', margin: '0 auto', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : people.length > 0 ? (
            <div style={{ marginBottom: '2.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ width: '0.3rem', height: '1.4rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
                <h2 className="text-section" style={{ margin: 0, fontSize: '1.05rem' }}>👤 People</h2>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
                {people.map(person => {
                  const img = profileUrl(person.profilePath, 'md');
                  return (
                    <Link
                      key={person.id}
                      to={`/person/${person.id}`}
                      style={{
                        flexShrink: 0, width: '110px', textAlign: 'center',
                        textDecoration: 'none', transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                    >
                      <div style={{
                        width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
                        margin: '0 auto 0.625rem', background: 'rgba(15,23,42,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', color: 'rgba(255,255,255,0.3)',
                      }}>
                        {img ? (
                          <img src={img} alt={person.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : '👤'}
                      </div>
                      <p style={{
                        fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2,
                        marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {person.name}
                      </p>
                      {person.knownForDepartment && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                          {person.knownForDepartment}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ── Movies & TV results ─────────────────────────────── */}
          {results.length > 0 && (
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
          )}
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
          <p>Search for your favorite movies, shows, or actors above.</p>
        </div>
      )}
    </div>
  );
}
