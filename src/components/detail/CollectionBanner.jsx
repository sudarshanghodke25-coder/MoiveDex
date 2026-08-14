import { Link } from 'react-router-dom';
import { backdropUrl, posterUrl } from '../../services/tmdb';

export default function CollectionBanner({ collection, loading = false }) {
  if (loading) {
    return <div className="skeleton" style={{ height: '140px', borderRadius: '16px', marginTop: '2.5rem' }} />;
  }

  if (!collection?.id) return null;

  const backdrop = collection.backdropPath ? backdropUrl(collection.backdropPath, 'md') : null;
  const poster = collection.posterPath ? posterUrl(collection.posterPath, 'md') : null;

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <Link
        to={`/collection/${collection.id}`}
        style={{
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          background: backdrop
            ? `linear-gradient(135deg, rgba(6,6,13,0.92), rgba(6,6,13,0.75)), url(${backdrop}) center/cover`
            : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          textDecoration: 'none',
          transition: 'border-color 0.2s ease, transform 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = ''; }}
      >
        {poster && (
          <img src={poster} alt="" style={{ width: '64px', borderRadius: '8px', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} />
        )}
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-accent)' }}>
            Part of Collection
          </span>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
            {collection.name}
          </p>
          {collection.parts?.length > 0 && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {collection.parts.length} title{collection.parts.length !== 1 ? 's' : ''} in this collection →
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
