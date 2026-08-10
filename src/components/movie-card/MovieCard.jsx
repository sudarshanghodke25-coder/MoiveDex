import { useState } from 'react';
import { posterUrl } from '../../services/tmdb';

/**
 * MovieCard — Cinema-grade card with real TMDB poster images.
 * Hover reveals: overlay gradient, rating badge, title + meta, action buttons.
 * 3D tilt effect on mousemove.
 */
export default function MovieCard({
  title     = 'Unknown Title',
  posterPath = null,
  rating     = null,
  year       = null,
  mediaType  = 'movie',
  onClick,
}) {
  const [imgError, setImgError] = useState(false);
  const [tilt, setTilt]         = useState({ x: 0, y: 0 });
  const [hovered, setHovered]   = useState(false);

  const imgSrc = !imgError && posterPath ? posterUrl(posterPath, 'w342') : null;

  const typeMap = { tv: 'TV', anime: 'Anime', movie: 'Movie' };
  const typeLabel = typeMap[mediaType] || 'Movie';

  const typeColor = {
    tv:    'rgba(59,130,246,0.9)',
    anime: 'rgba(168,85,247,0.9)',
    movie: 'rgba(99,102,241,0.9)',
  }[mediaType] || 'rgba(99,102,241,0.9)';

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    setTilt({ x: cy * -8, y: cx * 8 }); // subtle 3D tilt
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const ratingColor = rating >= 8 ? '#10b981' : rating >= 6 ? '#f59e0b' : '#94a3b8';

  return (
    <article
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${title}${year ? `, ${year}` : ''}`}
      onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={{
        width: 'clamp(160px, 18vw, 220px)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        background: '#111128',
        flexShrink: 0,
        border: hovered ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
        transform: hovered
          ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)`
          : 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.15s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.25)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: hovered ? 3 : 1,
        position: 'relative',
        willChange: 'transform',
      }}
    >
      {/* Poster area */}
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${title} poster`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
          />
        ) : (
          /* Gradient placeholder */
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(160deg, #1e1b4b 0%, #0f0a1e 50%, #1a1a35 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" />
              <path d="m7 2 .01 20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" />
            </svg>
            <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.4)', textAlign: 'center', padding: '0 0.5rem' }}>
              {title}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(5,5,16,0.98) 0%, rgba(5,5,16,0.5) 50%, transparent 100%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0.875rem',
          gap: '0.5rem',
        }}>
          {/* Rating */}
          {rating !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={ratingColor} aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: ratingColor }}>{rating.toFixed(1)}</span>
            </div>
          )}
          {/* Details button */}
          <button
            aria-label={`View ${title}`}
            style={{
              padding: '0.4rem 0', width: '100%',
              background: 'rgba(99,102,241,0.85)', color: '#fff',
              border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.85)'; }}
          >
            View Details
          </button>
        </div>

        {/* Type badge — always visible */}
        <div style={{
          position: 'absolute', top: '0.5rem', left: '0.5rem',
          background: typeColor, backdropFilter: 'blur(6px)',
          color: '#fff', fontSize: '0.65rem', fontWeight: 700,
          padding: '0.2rem 0.5rem', borderRadius: '4px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {typeLabel}
        </div>

        {/* Rating badge (top right, always visible) */}
        {rating !== null && (
          <div style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            color: ratingColor, fontSize: '0.72rem', fontWeight: 800,
            padding: '0.2rem 0.45rem', borderRadius: '5px',
            display: 'flex', alignItems: 'center', gap: '0.2rem',
          }}>
            ★ {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info strip */}
      <div style={{ padding: '0.6rem 0.625rem 0.75rem' }}>
        <p style={{
          fontSize: '0.83rem', fontWeight: 600, color: '#f8fafc',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '0.2rem', lineHeight: 1.3,
        }} title={title}>
          {title}
        </p>
        {year && (
          <p style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.6)', fontWeight: 500 }}>
            {year}
          </p>
        )}
      </div>
    </article>
  );
}
