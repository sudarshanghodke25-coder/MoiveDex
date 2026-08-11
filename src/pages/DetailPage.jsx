import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMovieDetails, getTVDetails, getVideos, backdropUrl, posterUrl } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

export default function DetailPage({ mediaType = 'movie' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail]   = useState(null);
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    setError(null);
    const fetcher = mediaType === 'tv' ? getTVDetails : getMovieDetails;
    fetcher(id)
      .then(data => { setDetail(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });

    getVideos(id, mediaType)
      .then(vids => setVideos(vids.filter(v => v.site === 'YouTube' && v.type === 'Trailer')))
      .catch(() => setVideos([]));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, mediaType]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
        <div className="detail-info-skeleton">
          <div className="skeleton" style={{ height: '3rem', width: '60%', borderRadius: '8px', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '4px', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '6rem', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  if (error) return <div className="error-msg" style={{ padding: '4rem 2rem' }}>{error}</div>;
  if (!detail) return null;

  const backdrop = detail.backdropPath ? backdropUrl(detail.backdropPath, 'original') : null;
  const poster   = detail.posterPath   ? posterUrl(detail.posterPath, 'w500')         : null;
  const year     = detail.releaseDate  ? new Date(detail.releaseDate).getFullYear()   : '';
  const trailer  = videos[0];

  const cast = detail.credits?.cast?.slice(0, 10) || [];
  const similar = detail.similar?.results?.slice(0, 12)
    .map(item => ({
      id: item.id,
      title: item.title || item.name,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      rating: item.vote_average,
      releaseDate: item.release_date || item.first_air_date,
      mediaType,
      overview: item.overview,
    })) || [];

  return (
    <div className="detail-page">
      {/* Backdrop */}
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt={detail.title} className="detail-backdrop-img" />}
        <div className="detail-backdrop-overlay" />
      </div>

      {/* Back Button */}
      <button className="detail-back-btn" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* Main info */}
      <div className="detail-main">
        {/* Poster */}
        <div className="detail-poster">
          {poster ? (
            <img src={poster} alt={detail.title} />
          ) : (
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <div className="detail-badges">
            <span className="pill">{mediaType === 'tv' ? '📺 TV Show' : '🎬 Movie'}</span>
            {year && <span className="pill">{year}</span>}
            {detail.status && <span className="pill">{detail.status}</span>}
          </div>

          <h1 className="detail-title">{detail.title}</h1>

          {detail.tagline && <p className="detail-tagline">"{detail.tagline}"</p>}

          <div className="detail-stats">
            {detail.rating > 0 && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <strong>{detail.rating.toFixed(1)}</strong>
                <span>/ 10</span>
                {detail.voteCount > 0 && <span className="detail-stat-sub">({detail.voteCount.toLocaleString()} votes)</span>}
              </div>
            )}
            {detail.runtime && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m</span>
              </div>
            )}
            {detail.seasons && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                </svg>
                <span>{detail.seasons} Seasons</span>
              </div>
            )}
          </div>

          {detail.genreNames?.length > 0 && (
            <div className="detail-genres">
              {detail.genreNames.map(g => (
                <span key={g.id} className="pill">{g.name}</span>
              ))}
            </div>
          )}

          {detail.overview && (
            <div className="detail-overview">
              <h3>Overview</h3>
              <p>{detail.overview}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="detail-actions">
            {trailer ? (
              <button className="btn-primary" onClick={() => setShowTrailer(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Watch Trailer
              </button>
            ) : (
              <button className="btn-primary" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                No Trailer Available
              </button>
            )}
            <button className="btn-ghost">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              Add to List
            </button>
          </div>
        </div>
      </div>

      {/* Cast */}
      {cast.length > 0 && (
        <div className="detail-section">
          <h2 className="text-section">Cast</h2>
          <div className="cast-row">
            {cast.map(person => (
              <div key={person.id} className="cast-card">
                <div className="cast-avatar">
                  {person.profile_path
                    ? <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} />
                    : <div className="skeleton" style={{ width: '100%', height: '100%' }} />
                  }
                </div>
                <p className="cast-name">{person.name}</p>
                <p className="cast-character">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <div className="detail-section">
          <h2 className="text-section">More Like This</h2>
          <div className="media-grid">
            {similar.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-inner" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
