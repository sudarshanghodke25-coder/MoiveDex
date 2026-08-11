import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backdropUrl } from '../../services/tmdb';

export default function HeroBanner({ items = [], loading = false }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % Math.min(items.length, 5));
    }, 7000);
    return () => clearInterval(timer);
  }, [items]);

  if (loading) {
    return (
      <div className="hero-banner skeleton" style={{ minHeight: '520px', borderRadius: 'var(--radius-xl)' }} />
    );
  }

  if (!items.length) return null;

  const movie = items[Math.min(activeIdx, items.length - 1)];
  const backdrop = movie?.backdropPath ? backdropUrl(movie.backdropPath, 'original') : null;
  const year = movie?.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

  function handlePlay() {
    const path = movie.mediaType === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;
    navigate(path);
  }

  return (
    <div className="hero-banner">
      {/* Background */}
      <div className="hero-bg" key={movie.id}>
        {backdrop && (
          <img
            src={backdrop}
            alt={movie.title}
            className="hero-bg-img"
          />
        )}
        <div className="hero-gradient-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-meta">
          <span className="pill" style={{ fontWeight: 700 }}>
            {movie.mediaType === 'tv' ? '📺 TV Show' : '🎬 Movie'}
          </span>
          {year && <span className="hero-year">{year}</span>}
          {movie.rating && (
            <span className="hero-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {movie.rating.toFixed(1)}
            </span>
          )}
        </div>

        <h1 className="hero-title">{movie.title}</h1>

        {movie.overview && (
          <p className="hero-overview">{movie.overview.slice(0, 200)}{movie.overview.length > 200 ? '…' : ''}</p>
        )}

        <div className="hero-actions">
          <button className="btn-primary hero-play-btn" onClick={handlePlay}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Play
          </button>
          <button className="btn-ghost" onClick={handlePlay}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            More Info
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="hero-dots">
          {items.slice(0, 5).map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
