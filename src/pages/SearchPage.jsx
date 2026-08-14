import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchMulti, searchPeople, searchMovies, searchTV, profileUrl } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const DEBOUNCE_MS = 400;
const RECENT_KEY = 'moviedex_recent_searches';
const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'TV' },
  { id: 'people', label: 'People' },
];

function loadRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(q) {
  const recent = loadRecentSearches().filter(r => r !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [peopleTotalPages, setPeopleTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [peoplePage, setPeoplePage] = useState(1);
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);

  const runSearch = useCallback(async (q, p = 1, filter = typeFilter, peopleP = 1, append = false) => {
    if (!q.trim()) { setResults([]); setPeople([]); return; }
    setLoading(true);
    setError(null);
    try {
      const mediaFetcher = filter === 'movie'
        ? () => searchMovies(q, p)
        : filter === 'tv'
          ? () => searchTV(q, p)
          : () => searchMulti(q, p);

      const promises = [mediaFetcher()];
      if (filter === 'all' || filter === 'people') {
        promises.push(searchPeople(q, peopleP));
      }

      const [data, peopleData] = await Promise.all(promises);

      if (filter !== 'people') {
        setResults(prev => append && p > 1 ? [...prev, ...data.results] : data.results);
        setTotalPages(data.totalPages);
        setPage(p);
      } else {
        setResults([]);
        setTotalPages(0);
      }

      if (filter === 'all' || filter === 'people') {
        const pResults = peopleData?.results || [];
        setPeople(prev => peopleP > 1 && append ? [...prev, ...pResults] : pResults);
        setPeopleTotalPages(peopleData?.totalPages || 0);
        setPeoplePage(peopleP);
      } else {
        setPeople([]);
      }

      saveRecentSearch(q.trim());
      setRecentSearches(loadRecentSearches());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setPeopleLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    const trimmed = inputVal.trim();
    const t = setTimeout(() => {
      setPage(1);
      setPeoplePage(1);
      setQuery(trimmed);
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
      if (trimmed) {
        setPeopleLoading(typeFilter === 'all' || typeFilter === 'people');
        runSearch(trimmed, 1, typeFilter, 1, false);
      } else {
        setResults([]);
        setPeople([]);
        setPeopleLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [inputVal, typeFilter, runSearch, setSearchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = inputVal.trim();
    setPage(1);
    setPeoplePage(1);
    setQuery(q);
    setSearchParams(q ? { q } : {});
    if (q) {
      setPeopleLoading(typeFilter === 'all' || typeFilter === 'people');
      runSearch(q, 1, typeFilter, 1, false);
    }
  }

  function loadMoreMedia() {
    runSearch(query, page + 1, typeFilter, peoplePage, true);
  }

  function loadMorePeople() {
    runSearch(query, page, typeFilter, peoplePage + 1, true);
  }

  const movieCount = results.filter(r => r.mediaType === 'movie').length;
  const tvCount = results.filter(r => r.mediaType === 'tv' || r.mediaType === 'anime').length;
  const showMedia = typeFilter !== 'people';
  const showPeople = typeFilter === 'all' || typeFilter === 'people';
  const initialLoading = loading && results.length === 0 && people.length === 0 && query;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Search</span>
        </h1>
        <p className="page-subtitle">Find movies, TV shows, anime, and the people behind them.</p>
      </div>

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

      {query && (
        <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
          {TYPE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${typeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="row-error-state" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
          <button type="button" className="btn-ghost" onClick={() => runSearch(query, 1, typeFilter, 1, false)}>Retry</button>
        </div>
      )}

      {initialLoading && (
        <div className="media-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="movie-card movie-card--md">
              <div className="card-poster skeleton" />
              <div className="card-info">
                <div className="skeleton" style={{ height: '0.875rem', width: '80%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                <div className="skeleton" style={{ height: '0.75rem', width: '50%', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && people.length === 0 && !error && (
        <div className="empty-state">
          <span style={{ fontSize: '4rem' }}>🔍</span>
          <h3>No results found for &quot;{query}&quot;</h3>
          <p>Try a different search term or check the spelling.</p>
        </div>
      )}

      {query && !initialLoading && (results.length > 0 || people.length > 0) && (
        <div>
          <p className="results-count">
            Showing results for <strong>&quot;{query}&quot;</strong>
            {showMedia && (movieCount > 0 || tvCount > 0) && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                🎬 {movieCount} movie{movieCount !== 1 ? 's' : ''} · 📺 {tvCount} show{tvCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>

          {showPeople && (peopleLoading && people.length === 0 ? (
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
                    <Link key={person.id} to={`/person/${person.id}`}
                      style={{ flexShrink: 0, width: '110px', textAlign: 'center', textDecoration: 'none', transition: 'transform 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
                      <div style={{
                        width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
                        margin: '0 auto 0.625rem', background: 'rgba(15,23,42,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', color: 'rgba(255,255,255,0.3)',
                      }}>
                        {img ? <img src={img} alt={person.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                      </div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {person.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
              {peoplePage < peopleTotalPages && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="button" className="btn-ghost" onClick={loadMorePeople} disabled={loading}>Load More People</button>
                </div>
              )}
            </div>
          ) : null)}

          {showMedia && results.length > 0 && (
            <div className="media-grid">
              {results.map(m => <MovieCard key={`${m.mediaType}-${m.id}`} movie={m} />)}
              {loading && [...Array(8)].map((_, i) => (
                <div key={`sk-${i}`} className="movie-card movie-card--md">
                  <div className="card-poster skeleton" />
                </div>
              ))}
            </div>
          )}
          {showMedia && page < totalPages && !loading && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button type="button" className="btn-ghost" onClick={loadMoreMedia}>Load More</button>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="empty-state">
          <span style={{ fontSize: '4rem' }}>🎬</span>
          <h3>What are you looking for?</h3>
          <p>Search for your favorite movies, shows, or actors above.</p>
          {recentSearches.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Recent searches</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {recentSearches.map(term => (
                  <button key={term} type="button" className="pill" onClick={() => setInputVal(term)}>{term}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
