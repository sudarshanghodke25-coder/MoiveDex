import { TMDB_CONFIG } from '../../services/tmdbConfig';

export default function WatchProviders({ providers = {} }) {
  // Try to find regional availability (US, IN, GB, or first available country code)
  const countryCode = Object.keys(providers).find(c => ['US', 'IN', 'GB', 'CA', 'AU'].includes(c)) || Object.keys(providers)[0];
  const region = countryCode ? providers[countryCode] : null;

  const flatrate = region?.flatrate || [];
  const rent     = region?.rent     || [];
  const buy      = region?.buy      || [];

  const hasProviders = flatrate.length > 0 || rent.length > 0 || buy.length > 0;

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
        <h2 className="text-section" style={{ margin: 0 }}>Where to Watch</h2>
      </div>

      {!hasProviders ? (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📺</span>
          <span>No streaming availability found.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Streaming (Flatrate) */}
          {flatrate.length > 0 && (
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                Stream
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {flatrate.map(p => (
                  <div
                    key={p.provider_id}
                    title={p.provider_name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.4rem 0.85rem', borderRadius: '999px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600,
                    }}
                  >
                    {p.logo_path && (
                      <img
                        src={`${TMDB_CONFIG.IMG_BASE}/w92${p.logo_path}`}
                        alt={p.provider_name}
                        style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                    )}
                    <span>{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rent or Buy */}
          {(rent.length > 0 || buy.length > 0) && (
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                Rent / Buy
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {[...rent, ...buy].reduce((acc, curr) => {
                  if (!acc.some(item => item.provider_id === curr.provider_id)) acc.push(curr);
                  return acc;
                }, []).slice(0, 8).map(p => (
                  <div
                    key={p.provider_id}
                    title={p.provider_name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.35rem 0.75rem', borderRadius: '999px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500,
                    }}
                  >
                    {p.logo_path && (
                      <img
                        src={`${TMDB_CONFIG.IMG_BASE}/w92${p.logo_path}`}
                        alt={p.provider_name}
                        style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                    )}
                    <span>{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
