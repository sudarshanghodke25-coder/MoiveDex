import { useParams, useNavigate } from 'react-router-dom';
import useTMDB from '../hooks/useTMDB';
import { getCollectionDetails, backdropUrl, posterUrl } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: collection, loading, error } = useTMDB(() => getCollectionDetails(id), [id]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="skeleton" style={{ height: '240px', borderRadius: '16px', marginBottom: '2rem' }} />
        <div className="media-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="movie-card movie-card--md"><div className="card-poster skeleton" /></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <span style={{ fontSize: '3rem' }}>📦</span>
        <h2>Collection unavailable</h2>
        <p>{error || 'This collection could not be loaded.'}</p>
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const backdrop = collection.backdropPath ? backdropUrl(collection.backdropPath, 'lg') : null;
  const poster = collection.posterPath ? posterUrl(collection.posterPath, 'lg') : null;

  return (
    <div className="page-content">
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '2.5rem',
        minHeight: '220px',
        background: 'var(--bg-elevated)',
      }}>
        {backdrop && (
          <img src={backdrop} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
        )}
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-end',
          padding: '2rem',
          background: 'linear-gradient(to top, rgba(6,6,13,0.95), transparent)',
          flexWrap: 'wrap',
        }}>
          {poster && (
            <img src={poster} alt={collection.name} style={{ width: '120px', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }} />
          )}
          <div>
            <span className="pill">Collection</span>
            <h1 className="text-hero" style={{ margin: '0.75rem 0 0.5rem' }}>{collection.name}</h1>
            {collection.overview && (
              <p style={{ maxWidth: '640px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {collection.overview}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="media-grid">
        {collection.parts.map(m => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
