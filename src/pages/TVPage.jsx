import { useState } from 'react';
import useTMDB from '../hooks/useTMDB';
import { getPopularTV, getTopRatedTV } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'popular',   label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
];

function useTVFetch(activeTab) {
  const fetchers = {
    popular:   () => getPopularTV().then(r => r.results),
    top_rated: () => getTopRatedTV().then(r => r.results),
  };
  return useTMDB(fetchers[activeTab], [activeTab]);
}

export default function TVPage() {
  const [activeTab, setActiveTab] = useState('popular');
  const { data: shows, loading, error } = useTVFetch(activeTab);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">TV Shows</span>
        </h1>
        <p className="page-subtitle">Binge-worthy series from every genre, from drama to sci-fi.</p>
      </div>

      <div className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
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
