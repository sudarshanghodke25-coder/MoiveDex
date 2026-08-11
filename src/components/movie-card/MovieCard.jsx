import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posterUrl } from '../../services/tmdb';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxYTFhMzUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzQ0NDQ2NiIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

export default function MovieCard({ movie, size = 'md' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  if (!movie) return null;

  const poster = movie.posterPath ? posterUrl(movie.posterPath, size === 'lg' ? 'w500' : 'w342') : null;
  const year   = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
  const rating = movie.rating ? movie.rating.toFixed(1) : null;
  const type   = movie.mediaType === 'tv' ? 'TV' : 'Movie';

  function handleClick() {
    const path = movie.mediaType === 'tv'
      ? `/tv/${movie.id}`
      : `/movie/${movie.id}`;
    navigate(path);
  }

  return (
    <article
      className={`movie-card movie-card--${size}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`View details for ${movie.title}`}
    >
      <div className="card-poster">
        {!imgLoaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
        <img
          src={imgError ? PLACEHOLDER : (poster || PLACEHOLDER)}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        <div className="card-overlay">
          <div className="card-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          {rating && (
            <div className="card-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {rating}
            </div>
          )}
        </div>
        <span className="card-type-badge">{type}</span>
      </div>
      <div className="card-info">
        <p className="card-title">{movie.title}</p>
        <div className="card-meta">
          {year && <span>{year}</span>}
          {year && rating && <span>·</span>}
          {rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
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
