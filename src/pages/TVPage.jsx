import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useTMDB from '../hooks/useTMDB';
import { getPopularTV, getTopRatedTV, discoverTV } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'popular',   label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
];

const GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10768, name: 'War & Politics' },
];

const SORTS = [
  { id: 'popularity.desc',    label: 'Most Popular' },
  { id: 'vote_average.desc',  label: 'Top Rated' },
  { id: 'first_air_date.desc', label: 'Newest' },
  { id: 'vote_count.desc',    label: 'Most Voted' },
];

export default function TVPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre');
  const genreId = genreParam ? Number(genreParam) : null;

  const [activeTab, setActiveTab] = useState('popular');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const inDiscover = genreId !== null || sortBy !== 'popularity.desc';

  // Discover mode (genre + sort) OR curated tab lists
  const fetcher = inDiscover
    ? () => discoverTV({ genreId, sortBy }).then(r => r.results)
    : (() => {
        const fetchers = {
          popular:   () => getPopularTV().then(r => r.results),
          top_rated: () => getTopRatedTV().then(r => r.results),
        };
        return fetchers[activeTab];
      })();

  const { data: shows, loading, error } = useTMDB(fetcher, [activeTab, genreId, sortBy]);

  const activeGenre = GENRES.find(g => g.id === genreId) || null;

  function selectGenre(id) {
    setSearchParams(id ? { genre: String(id) } : {});
  }

  function selectTab(id) {
    setActiveTab(id);
    setSortBy('popularity.desc');
    setSearchParams({});
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">TV Shows</span>
        </h1>
        <p className="page-subtitle">
          {activeGenre
            ? `Discover the best ${activeGenre.name} shows.`
            : 'Binge-worthy series from every genre, from drama to sci-fi.'}
        </p>
      </div>

      {/* Genre filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
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

      {/* Sort + tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
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

      {error && <p className="error-msg">{error}</p>}
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
          : shows.map(s => <MovieCard key={s.id} movie={s} />)
        }
      </div>
    </div>
  );
}
