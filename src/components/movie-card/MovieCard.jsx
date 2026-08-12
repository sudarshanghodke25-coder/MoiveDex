import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posterUrl, posterSrcSet } from '../../services/tmdb';
import { useWatchlist } from '../../contexts/WatchlistContext';

function PosterPlaceholder({ title }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      textAlign: 'center',
      gap: '0.625rem',
      color: 'var(--text-muted)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
    }}>
      <div style={{
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a5b4fc',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {title || 'No Poster'}
      </span>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(148, 163, 184, 0.7)' }}>
        MovieDex
      </span>
    </div>
  );
}

export default function MovieCard({ movie, size = 'md', ...directProps }) {
  const [imgState, setImgState] = useState('loading');
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Normalize movie object or fallback to direct props
  const item = movie || {
    id: directProps.id,
    title: directProps.title,
    posterPath: directProps.posterPath,
    backdropPath: directProps.backdropPath,
    rating: directProps.rating,
    releaseDate: directProps.year || directProps.releaseDate,
    mediaType: directProps.mediaType,
  };

  if (!item || (!item.title && !item.id)) return null;

  const inWatchlist = isInWatchlist(item.id, item.mediaType || 'movie');

  // Compute image paths safely
  const rawPosterPath = item.posterPath || item.poster_path || null;
  const posterSrc = rawPosterPath
    ? (rawPosterPath.startsWith('http') ? rawPosterPath : posterUrl(rawPosterPath, size === 'lg' ? 'lg' : 'md'))
    : null;
  const posterSrcset = rawPosterPath && !rawPosterPath.startsWith('http') ? posterSrcSet(rawPosterPath) : '';

  const rawDate = item.releaseDate || item.release_date || item.first_air_date || null;
  const year = rawDate ? new Date(rawDate).getFullYear() : (directProps.year || '');
  
  const ratingVal = typeof item.rating === 'number' && item.rating > 0
    ? item.rating
    : (typeof item.vote_average === 'number' && item.vote_average > 0 ? item.vote_average : null);
  const rating = ratingVal ? ratingVal.toFixed(1) : null;
  
  const type = item.mediaType === 'tv' ? 'TV' : 'Film';
  const genres = item.genreNames?.slice(0, 2) || [];

  function handleClick() {
    navigate(item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  }

  function handleBookmarkClick(e) {
    e.stopPropagation();
    toggleWatchlist(item);
  }

  return (
    <article
      className={`movie-card movie-card--${size}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.title}${year ? ` (${year})` : ''}`}
    >
      <div className="card-poster" style={{ position: 'relative' }}>
        {/* Skeleton while image loads */}
        {imgState === 'loading' && (
          <div className="skeleton" style={{ position: 'absolute', inset: 0 }} aria-hidden />
        )}

        {/* Poster image or fallback */}
        {posterSrc && imgState !== 'error' ? (
          <img
            src={posterSrc}
            srcSet={posterSrcset || undefined}
            sizes="(max-width: 640px) 154px, (max-width: 1024px) 342px, 500px"
            alt={item.title || 'Poster'}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgState('loaded')}
            onError={() => setImgState('error')}
            style={{ opacity: imgState === 'loaded' ? 1 : 0, transition: 'opacity 0.35s ease' }}
          />
        ) : (
          <PosterPlaceholder title={item.title} />
        )}

        {/* Hover overlay */}
        <div className="card-overlay">
          {/* Quick Bookmark / Watchlist toggle button */}
          <button
            type="button"
            className="card-bookmark-btn"
            onClick={handleBookmarkClick}
            aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              zIndex: 10,
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              background: inWatchlist ? 'var(--brand-primary)' : 'rgba(5, 5, 16, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={inWatchlist ? '#fff' : 'none'} stroke="currentColor" strokeWidth="2.2">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
            </svg>
          </button>

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
        <p className="card-title" title={item.title}>{item.title}</p>
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
