import { useState } from 'react';
import { Link } from 'react-router-dom';
import useTMDB from '../hooks/useTMDB';
import { getMovieGenres, getTVGenres } from '../services/tmdb';

const GENRE_COLORS = [
  '#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

export default function GenresPage() {
  const [mediaType, setMediaType] = useState('movie');

  const { data: movieGenres, loading: loadingMovies, error: movieError, retry: retryMovies } =
    useTMDB(getMovieGenres, []);
  const { data: tvGenres, loading: loadingTV, error: tvError, retry: retryTV } =
    useTMDB(getTVGenres, []);

  const genres = mediaType === 'movie' ? (movieGenres || []) : (tvGenres || []);
  const loading = mediaType === 'movie' ? loadingMovies : loadingTV;
  const error = mediaType === 'movie' ? movieError : tvError;
  const retry = mediaType === 'movie' ? retryMovies : retryTV;
  const basePath = mediaType === 'movie' ? '/movies' : '/tv';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title">
          <span className="gradient-text">Genres</span>
        </h1>
        <p className="page-subtitle">Browse movies and TV shows by genre.</p>
      </div>

      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn ${mediaType === 'movie' ? 'active' : ''}`}
          onClick={() => setMediaType('movie')}
        >
          Movies
        </button>
        <button
          type="button"
          className={`tab-btn ${mediaType === 'tv' ? 'active' : ''}`}
          onClick={() => setMediaType('tv')}
        >
          TV Shows
        </button>
      </div>

      {error && (
        <div className="row-error-state" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
          <button type="button" className="btn-ghost" onClick={retry}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {genres.map((g, i) => (
            <Link
              key={g.id}
              to={`${basePath}?genre=${g.id}`}
              style={{
                padding: '1.25rem 1rem',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${GENRE_COLORS[i % GENRE_COLORS.length]}33, rgba(15,23,42,0.9))`,
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
                color: '#f8fafc',
                fontWeight: 800,
                fontSize: '0.95rem',
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
