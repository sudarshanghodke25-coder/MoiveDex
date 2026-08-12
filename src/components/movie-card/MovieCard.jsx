/**
 * components/movie-card/MovieCard.jsx  —  Phase 4
 *
 * Improvements over Phase 3:
 *   - srcSet for responsive poster images (w154, w342, w500)
 *   - Progressive fade-in on image load
 *   - Genre pills shown on hover overlay
 *   - Accessible keyboard interaction
 *   - Compact SVG placeholder (no base64 blob)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posterUrl, posterSrcSet } from '../../services/tmdb';

// Inline SVG placeholder — no network round-trip, no base64 size cost
function PosterPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'var(--bg-elevated)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      color: 'var(--text-muted)',
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        No Image
      </span>
    </div>
  );
}

export default function MovieCard({ movie, size = 'md' }) {
  const [imgState, setImgState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const navigate = useNavigate();

  if (!movie) return null;

  // Compute responsive image sources
  const posterSrc    = movie.posterPath ? posterUrl(movie.posterPath, size === 'lg' ? 'lg' : 'md') : null;
  const posterSrcset = movie.posterPath ? posterSrcSet(movie.posterPath) : '';

  const year   = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
  const rating = typeof movie.rating === 'number' && movie.rating > 0
    ? movie.rating.toFixed(1)
    : null;
  const type   = movie.mediaType === 'tv' ? 'TV' : 'Film';

  // Show up to 2 genre names in overlay
  const genres = movie.genreNames?.slice(0, 2) || [];

  function handleClick() {
    navigate(movie.mediaType === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  }

  return (
    <article
      className={`movie-card movie-card--${size}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}${year ? ` (${year})` : ''}`}
    >
      <div className="card-poster">
        {/* Skeleton while image loads */}
        {imgState === 'loading' && (
          <div className="skeleton" style={{ position: 'absolute', inset: 0 }} aria-hidden />
        )}

        {/* Poster image (or fallback) */}
        {posterSrc && imgState !== 'error' ? (
          <img
            src={posterSrc}
            srcSet={posterSrcset}
            sizes="(max-width: 640px) 154px, (max-width: 1024px) 342px, 500px"
            alt={movie.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgState('loaded')}
            onError={() => setImgState('error')}
            style={{ opacity: imgState === 'loaded' ? 1 : 0, transition: 'opacity 0.35s ease' }}
          />
        ) : (
          imgState === 'error' || !posterSrc ? <PosterPlaceholder /> : null
        )}

        {/* Hover overlay */}
        <div className="card-overlay">
          <div className="card-play-btn" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>

          {/* Genre tags in overlay */}
          {genres.length > 0 && (
            <div className="card-genres">
              {genres.map(g => (
                <span key={g} className="card-genre-tag">{g}</span>
              ))}
            </div>
          )}

          {rating && (
            <div className="card-rating" aria-label={`Rating: ${rating} out of 10`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {rating}
            </div>
          )}
        </div>

        {/* Media type badge */}
        <span className="card-type-badge" aria-label={type}>{type}</span>
      </div>

      <div className="card-info">
        <p className="card-title" title={movie.title}>{movie.title}</p>
        <div className="card-meta">
          {year && <span>{year}</span>}
          {year && rating && <span aria-hidden>·</span>}
          {rating && (
            <span className="card-meta-rating">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {rating}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
