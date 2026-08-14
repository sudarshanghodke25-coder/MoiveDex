/**
 * ExternalLinks — IMDb / official homepage / TMDB links.
 * Opens safely in a new tab. Only renders links that actually exist.
 */

function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function LinkButton({ href, icon, label }) {
  if (!href || !isSafeUrl(href)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ext-link-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 1.25rem', borderRadius: '999px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
        color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700,
        textDecoration: 'none', transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)';
        e.currentTarget.style.color = '#f8fafc';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.transform = '';
      }}
    >
      <span aria-hidden style={{ fontSize: '1rem' }}>{icon}</span>
      {label}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <path d="M7 17 17 7M7 7h10v10"/>
      </svg>
    </a>
  );
}

export default function ExternalLinks({ detail, mediaType = 'movie' }) {
  if (!detail) return null;

  const tmdbType = mediaType === 'movie' ? 'movie' : 'tv';
  const ext = detail.externalIds || {};

  const links = [
    detail.imdbId && {
      href: `https://www.imdb.com/title/${detail.imdbId}/`,
      icon: '🎬',
      label: 'IMDb',
    },
    detail.homepage && isSafeUrl(detail.homepage) && {
      href: detail.homepage,
      icon: '🌐',
      label: 'Official Website',
    },
    detail.id && {
      href: `https://www.themoviedb.org/${tmdbType}/${detail.id}`,
      icon: '🍿',
      label: 'TMDB',
    },
    ext.facebook_id && {
      href: `https://www.facebook.com/${ext.facebook_id}`,
      icon: '📘',
      label: 'Facebook',
    },
    ext.instagram_id && {
      href: `https://www.instagram.com/${ext.instagram_id}`,
      icon: '📸',
      label: 'Instagram',
    },
    ext.twitter_id && {
      href: `https://x.com/${ext.twitter_id}`,
      icon: '🐦',
      label: 'X / Twitter',
    },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
        <h2 className="text-section" style={{ margin: 0 }}>External Links</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {links.map(l => <LinkButton key={l.label} {...l} />)}
      </div>
    </div>
  );
}
