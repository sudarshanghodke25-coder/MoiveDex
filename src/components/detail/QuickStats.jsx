/**
 * QuickStats — compact cinematic stat strip shown right under the hero.
 * Renders only the stats that actually exist (never empty cards).
 */

function formatRuntime(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPopularity(v) {
  if (!v) return null;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return Math.round(v).toLocaleString();
}

export default function QuickStats({ detail, isTV = false }) {
  if (!detail) return null;

  const stats = [
    {
      icon: '⭐',
      label: 'Rating',
      value: detail.rating > 0 ? detail.rating.toFixed(1) : null,
      sub: detail.voteCount > 0 ? `${detail.voteCount.toLocaleString()} votes` : null,
    },
    {
      icon: '🔥',
      label: 'Popularity',
      value: formatPopularity(detail.popularity),
      sub: 'Popularity score',
    },
    {
      icon: '⏱️',
      label: 'Runtime',
      value: detail.runtime ? formatRuntime(detail.runtime) : (isTV && detail.episodes ? `${detail.episodes} eps` : null),
      sub: isTV && detail.runtime ? 'per episode' : null,
    },
    {
      icon: '📅',
      label: 'Release',
      value: detail.releaseDate || detail.firstAirDate || null,
      sub: detail.lastAirDate && detail.lastAirDate !== detail.firstAirDate ? `ended ${detail.lastAirDate}` : null,
    },
    {
      icon: '📊',
      label: 'Status',
      value: detail.status || null,
      sub: isTV && detail.numberOfSeasons ? `${detail.numberOfSeasons} season${detail.numberOfSeasons !== 1 ? 's' : ''}` : null,
    },
  ].filter(s => s.value);

  if (stats.length === 0) return null;

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <div
        className="stat-strip"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
          gap: '0.875rem',
        }}
      >
        {stats.map(stat => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '1rem 1.15rem',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.06)';
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span aria-hidden style={{ fontSize: '0.95rem' }}>{stat.icon}</span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-muted)',
              }}>
                {stat.label}
              </span>
            </div>
            <strong style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
              {stat.value}
            </strong>
            {stat.sub && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.sub}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
