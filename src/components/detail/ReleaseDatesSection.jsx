import { getTMDBRegion } from '../../services/tmdb';

const RELEASE_TYPE_LABELS = {
  1: 'Premiere',
  2: 'Theatrical (limited)',
  3: 'Theatrical',
  4: 'Digital',
  5: 'Physical',
  6: 'TV',
};

export default function ReleaseDatesSection({ releaseDates = [], contentRatings = [], preferredRegion = null }) {
  const region = preferredRegion || getTMDBRegion();

  if (releaseDates.length > 0) {
    const prioritized = [
      ...releaseDates.filter(r => r.countryCode === region),
      ...releaseDates.filter(r => r.countryCode !== region),
    ].slice(0, 8);

    return (
      <div className="detail-section" style={{ marginTop: '2.5rem' }}>
        <SectionHeader title="Release Information" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '0.625rem 0.75rem' }}>Country</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Date</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Cert</th>
                <th style={{ padding: '0.625rem 0.75rem' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {prioritized.flatMap(country =>
                country.releases.slice(0, 3).map((rel, i) => (
                  <tr key={`${country.countryCode}-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontWeight: 700, color: country.countryCode === region ? 'var(--brand-accent)' : '#f8fafc' }}>
                      {country.countryCode}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {rel.releaseDate ? new Date(rel.releaseDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{rel.certification || '—'}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {RELEASE_TYPE_LABELS[rel.type] || rel.type}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (contentRatings.length > 0) {
    const prioritized = [
      ...contentRatings.filter(r => r.countryCode === region),
      ...contentRatings.filter(r => r.countryCode !== region),
    ].slice(0, 12);

    return (
      <div className="detail-section" style={{ marginTop: '2.5rem' }}>
        <SectionHeader title="Content Ratings" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {prioritized.map(r => (
            <span key={r.countryCode} className="pill" title={r.countryCode}>
              {r.countryCode}: {r.rating}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
      <h2 className="text-section" style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}
