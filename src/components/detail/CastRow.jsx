import { profileUrl } from '../../services/tmdb';

export default function CastRow({ cast = [] }) {
  if (!cast || cast.length === 0) return null;

  const topCast = cast.slice(0, 12);

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
        <h2 className="text-section" style={{ margin: 0 }}>Cast & Crew</h2>
      </div>

      <div className="cast-row" style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        scrollbarWidth: 'thin',
      }}>
        {topCast.map(person => {
          const img = profileUrl(person.profile_path, 'md');
          return (
            <div
              key={person.id || person.credit_id}
              className="cast-card"
              style={{
                width: '120px',
                flexShrink: 0,
                textAlign: 'center',
              }}
            >
              <div
                className="cast-avatar"
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 0.625rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={person.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', color: 'rgba(255,255,255,0.3)'
                  }}>
                    👤
                  </div>
                )}
              </div>
              <p className="cast-name" style={{
                fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc',
                lineHeight: 1.2, marginBottom: '0.2rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {person.name}
              </p>
              {person.character && (
                <p className="cast-character" style={{
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {person.character}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
