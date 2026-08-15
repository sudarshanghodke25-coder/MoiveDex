import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePaginatedTMDB from '../hooks/usePaginatedTMDB';
import usePageTitle from '../hooks/usePageTitle';
import {
  getTrending,
  getTrendingToday,
  getTrendingMovies,
  getTrendingTV,
  getTrendingPeople,
  profileUrl,
} from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'all_week', label: 'All · This Week', type: 'media', fetch: () => getTrending('week').then(r => ({ results: r, totalPages: 1 })) },
  { id: 'all_day', label: 'All · Today', type: 'media', fetch: () => getTrendingToday().then(r => ({ results: r, totalPages: 1 })) },
  { id: 'movies_week', label: 'Movies', type: 'media', fetch: () => getTrendingMovies('week').then(r => ({ results: r, totalPages: 1 })) },
  { id: 'tv_week', label: 'TV Shows', type: 'media', fetch: () => getTrendingTV('week').then(r => ({ results: r, totalPages: 1 })) },
  { id: 'people_week', label: 'People', type: 'people', fetch: () => getTrendingPeople('week').then(r => ({ results: r, totalPages: 1 })) },
];

export default function TrendingPage() {
  usePageTitle('Trending | MovieDex');

  const [activeTab, setActiveTab] = useState('all_week');
  const tab = TABS.find(t => t.id === activeTab) || TABS[0];

  const { items, loading, error, retry } = usePaginatedTMDB(
    () => tab.fetch(1),
    [activeTab]
  );

  const isPeople = tab.type === 'people';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Trending</span>
        </h1>
        <p className="page-subtitle">See what&apos;s hot right now across movies, TV, anime, and people.</p>
      </div>

      <div className="tab-bar" style={{ flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} type="button" className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="row-error-state" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
          <button type="button" className="btn-ghost" onClick={retry}>Retry</button>
        </div>
      )}

      {isPeople ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.25rem' }}>
          {loading
            ? [...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />)
            : items.map(person => {
                const img = profileUrl(person.profilePath, 'md');
                return (
                  <Link key={person.id} to={`/person/${person.id}`} style={{ textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', marginBottom: '0.625rem', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {img ? <img src={img} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem' }}>👤</span>}
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>{person.name}</p>
                    {person.knownForDepartment && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{person.knownForDepartment}</p>}
                  </Link>
                );
              })
          }
        </div>
      ) : (
        <div className="media-grid">
          {loading
            ? [...Array(20)].map((_, i) => (
                <div key={i} className="movie-card movie-card--md">
                  <div className="card-poster skeleton" />
                </div>
              ))
            : items.length === 0 && !error
              ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '3rem' }}>🔥</span>
                  <h3>No trending titles found</h3>
                </div>
              )
              : items.map(m => <MovieCard key={`${m.mediaType}-${m.id}`} movie={m} />)
          }
        </div>
      )}
    </div>
  );
}
