import { useState, useMemo } from 'react';
import usePaginatedTMDB from '../hooks/usePaginatedTMDB';
import usePageTitle from '../hooks/usePageTitle';
import { getAnime, getTopRatedAnime, getAiringAnime } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'popular',   label: 'Popular',   fetch: (page) => getAnime(page) },
  { id: 'top_rated', label: 'Top Rated', fetch: () => getTopRatedAnime().then(r => ({ results: r, totalPages: 1 })) },
  { id: 'airing',    label: 'Airing Now', fetch: () => getAiringAnime().then(r => ({ results: r, totalPages: 1 })) },
];

export default function AnimePage() {
  usePageTitle('Anime | MovieDex');

  const [activeTab, setActiveTab] = useState('popular');
  const tab = TABS.find(t => t.id === activeTab) || TABS[0];

  const fetchPage = useMemo(() => tab.fetch, [tab]);

  const { items: animeList, loading, loadingMore, error, hasMore, loadMore, retry } =
    usePaginatedTMDB(fetchPage, [activeTab]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Anime</span>
        </h1>
        <p className="page-subtitle">From shonen epics to slice-of-life masterpieces — explore the world of anime.</p>
      </div>

      <div className="tab-bar">
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
          : animeList.length === 0 && !error
            ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '3rem' }}>⚡</span>
                <h3>No anime found</h3>
                <p>Try a different tab or check back later.</p>
              </div>
            )
            : animeList.map(a => <MovieCard key={a.id} movie={a} />)
        }
        {loadingMore && [...Array(8)].map((_, i) => (
          <div key={`more-${i}`} className="movie-card movie-card--md"><div className="card-poster skeleton" /></div>
        ))}
      </div>

      {hasMore && !loading && activeTab === 'popular' && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button type="button" className="btn-ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
