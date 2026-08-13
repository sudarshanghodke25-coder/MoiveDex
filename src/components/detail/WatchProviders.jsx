import { TMDB_CONFIG } from '../../services/tmdbConfig';
import { pickWatchRegion, buildProviderWatchUrl } from '../../services/tmdb';

function ProviderChip({ provider, mediaType, id, countryCode, style = {}, imgSize = 22 }) {
  const href = buildProviderWatchUrl({ mediaType, id, countryCode, providerId: provider.provider_id });
  return (
    <a
      key={provider.provider_id}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Watch on ${provider.provider_name}`}
      aria-label={`Watch on ${provider.provider_name}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.4rem 0.85rem', borderRadius: '999px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(245,158,11,0.3)',
        color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600,
        textDecoration: 'none',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.7)';
        e.currentTarget.style.boxShadow = '0 0 18px rgba(245,158,11,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {provider.logo_path && (
        <img
          src={`${TMDB_CONFIG.IMG_BASE}/w92${provider.logo_path}`}
          alt={provider.provider_name}
          loading="lazy"
          style={{ width: `${imgSize}px`, height: `${imgSize}px`, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
        />
      )}
      <span>{provider.provider_name}</span>
    </a>
  );
}

export default function WatchProviders({ providers = {}, mediaType = 'movie', id = null }) {
  const { countryCode, region } = pickWatchRegion(providers);

  if (!region) {
    return (
      <div className="detail-section" style={{ marginTop: '2.5rem' }}>
        <SectionHeader title="Where to Watch" />
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
      </div>
    );
  }

  const flatrate = region.flatrate || [];
  const rent     = region.rent     || [];
  const buy      = region.buy      || [];

  // Merge rent + buy, dedupe by provider id
  const rentBuy = [...rent, ...buy].reduce((acc, curr) => {
    if (!acc.some(item => item.provider_id === curr.provider_id)) acc.push(curr);
    return acc;
  }, []);

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <SectionHeader title="Where to Watch" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Streaming (Flatrate) */}
        {flatrate.length > 0 && (
          <div>
            <SectionLabel>Stream</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {flatrate.map(p => (
                <ProviderChip key={p.provider_id} provider={p} mediaType={mediaType} id={id} countryCode={countryCode} />
              ))}
            </div>
          </div>
        )}

        {/* Rent / Buy */}
        {rentBuy.length > 0 && (
          <div>
            <SectionLabel>Rent / Buy</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {rentBuy.slice(0, 8).map(p => (
                <ProviderChip
                  key={p.provider_id}
                  provider={p}
                  mediaType={mediaType}
                  id={id}
                  countryCode={countryCode}
                  imgSize={18}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
      <h2 className="text-section" style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <span style={{
      display: 'block', fontSize: '0.78rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      color: 'var(--text-secondary)', marginBottom: '0.625rem',
    }}>
      {children}
    </span>
  );
}
