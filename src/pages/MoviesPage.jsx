import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useTMDB from '../hooks/useTMDB';
import usePaginatedTMDB from '../hooks/usePaginatedTMDB';
import usePageTitle from '../hooks/usePageTitle';
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlaying,
  getUpcoming,
  discoverMovies,
  getMovieGenres,
} from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'popular',    label: 'Popular' },
  { id: 'top_rated',  label: 'Top Rated' },
  { id: 'now_playing', label: 'Now Playing' },
  { id: 'upcoming',   label: 'Upcoming' },
];

const FALLBACK_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
];

const SORTS = [
  { id: 'popularity.desc',          label: 'Most Popular' },
  { id: 'vote_average.desc',        label: 'Top Rated' },
  { id: 'primary_release_date.desc', label: 'Newest' },
  { id: 'revenue.desc',             label: 'Biggest Grossing' },
];

export default function MoviesPage() {
  usePageTitle('Movies | MovieDex');

  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre');
  const genreId = genreParam ? Number(genreParam) : null;

  const [activeTab, setActiveTab] = useState('popular');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState('');

  const { data: apiGenres } = useTMDB(getMovieGenres, []);
  const GENRES = apiGenres?.length ? apiGenres : FALLBACK_GENRES;

  const inDiscover = genreId !== null || sortBy !== 'popularity.desc' || year !== '' || minRating !== '';

  const fetchPage = useMemo(() => {
    if (inDiscover) {
      return (page) => discoverMovies({
        genreId,
        year: year ? Number(year) : null,
        sortBy,
        minRating: minRating ? Number(minRating) : null,
        page,
      });
    }
    const fetchers = {
      popular:     (page) => getPopularMovies(page),
      top_rated:   (page) => getTopRatedMovies(page),
      now_playing: (page) => getNowPlaying(page),
      upcoming:    (page) => getUpcoming(page),
    };
    return fetchers[activeTab];
  }, [inDiscover, genreId, sortBy, year, minRating, activeTab]);

  const { items: movies, loading, loadingMore, error, hasMore, loadMore, retry } =
    usePaginatedTMDB(fetchPage, [activeTab, genreId, sortBy, year, minRating]);

  const activeGenre = GENRES.find(g => g.id === genreId) || null;

  function selectGenre(id) {
    setSearchParams(id ? { genre: String(id) } : {});
  }

  function selectTab(id) {
    setActiveTab(id);
    setSortBy('popularity.desc');
    setYear('');
    setMinRating('');
    setSearchParams({});
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Movies</span>
        </h1>
        <p className="page-subtitle">
          {activeGenre
            ? `Discover the best ${activeGenre.name} movies.`
            : 'Explore the world of cinema — from blockbusters to hidden gems.'}
        </p>
      </div>

      <div className="page-genre-pills">
        <button
          type="button"
          onClick={() => selectGenre(null)}
          className="tab-btn"
          style={{
            background: !activeGenre && !inDiscover ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.06)',
            color: !activeGenre && !inDiscover ? '#fff' : 'var(--text-secondary)',
          }}
        >
          All
        </button>
        {GENRES.map(g => (
          <button
            key={g.id}
            type="button"
            onClick={() => selectGenre(g.id)}
            className="tab-btn"
            style={{
              background: activeGenre?.id === g.id ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.06)',
              color: activeGenre?.id === g.id ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="page-toolbar">
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${!inDiscover && activeTab === tab.id ? 'active' : ''}`}
              onClick={() => selectTab(tab.id)}
              disabled={inDiscover}
              style={inDiscover ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Year:
          <input type="number" min="1900" max="2030" placeholder="Any" value={year}
            onChange={e => setYear(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '999px', width: '90px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', fontSize: '0.85rem' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Min rating:
          <input type="number" min="0" max="10" step="0.5" placeholder="Any" value={minRating}
            onChange={e => setMinRating(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '999px', width: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', fontSize: '0.85rem' }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Sort:
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', outline: 'none', backdropFilter: 'blur(8px)',
            }}
          >
            {SORTS.map(s => <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#fff' }}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {error && (
        <div className="row-error-state" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
          <button type="button" className="btn-ghost" onClick={retry}>Retry</button>
        </div>
      )}

      <div className="media-grid">
        {loading
          ? [...Array(20)].map((_, i) => (
              <div key={i} className="movie-card movie-card--md">
                <div className="card-poster skeleton" />
                <div className="card-info">
                  <div className="skeleton" style={{ height: '0.875rem', width: '80%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '50%', borderRadius: '4px' }} />
                </div>
              </div>
            ))
          : movies.length === 0 && !error
            ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '3rem' }}>🎬</span>
                <h3>No movies found</h3>
                <p>Try a different genre or sort option.</p>
              </div>
            )
            : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
        {loadingMore && [...Array(8)].map((_, i) => (
          <div key={`more-${i}`} className="movie-card movie-card--md">
            <div className="card-poster skeleton" />
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button type="button" className="btn-ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
