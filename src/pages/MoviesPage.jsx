import { useState } from 'react';
import useTMDB from '../hooks/useTMDB';
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlaying,
  getUpcoming,
} from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const TABS = [
  { id: 'popular',   label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'now_playing', label: 'Now Playing' },
  { id: 'upcoming',  label: 'Upcoming' },
];

function useMovieFetch(activeTab) {
  const fetchers = {
    popular:     () => getPopularMovies().then(r => r.results),
    top_rated:   () => getTopRatedMovies().then(r => r.results),
    now_playing: () => getNowPlaying().then(r => r.results),
    upcoming:    () => getUpcoming().then(r => r.results),
  };
  return useTMDB(fetchers[activeTab], [activeTab]);
}

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState('popular');
  const { data: movies, loading, error } = useMovieFetch(activeTab);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Movies</span>
        </h1>
        <p className="page-subtitle">Explore the world of cinema — from blockbusters to hidden gems.</p>
      </div>

      {/* Tab Bar */}
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

      {/* Grid */}
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
          : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
      </div>
    </div>
  );
}
