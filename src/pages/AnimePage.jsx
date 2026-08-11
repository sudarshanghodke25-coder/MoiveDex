import { useState } from 'react';
import useTMDB from '../hooks/useTMDB';
import { getAnime, getTopRatedAnime } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'popular',   label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
];

function useAnimeFetch(activeTab) {
  const fetchers = {
    popular:   () => getAnime().then(r => r.results),
    top_rated: () => getTopRatedAnime(),
  };
  return useTMDB(fetchers[activeTab], [activeTab]);
}

export default function AnimePage() {
  const [activeTab, setActiveTab] = useState('popular');
  const { data: animeList, loading, error } = useAnimeFetch(activeTab);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Anime</span>
        </h1>
        <p className="page-subtitle">From shonen epics to slice-of-life masterpieces — explore the world of anime.</p>
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
          : animeList.map(a => <MovieCard key={a.id} movie={a} />)
        }
      </div>
    </div>
  );
}
