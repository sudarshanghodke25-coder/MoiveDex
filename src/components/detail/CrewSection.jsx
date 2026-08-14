import { useState } from 'react';
import { Link } from 'react-router-dom';
import { profileUrl } from '../../services/tmdb';

/**
 * CrewSection — dedicated crew display prioritising the important departments.
 * Each card links to the person's /person/:id page.
 */

const DEPT_PRIORITY = [
  'Directing',
  'Writing',
  'Production',
  'Camera',
  'Editing',
  'Sound',
  'Art',
  'Costume & Make-Up',
  'Visual Effects',
];

const INITIAL_DEPT_LIMIT = 6;
const INITIAL_PEOPLE_PER_DEPT = 3;

/** Group crew by department, ordered by importance. */
function groupCrew(crew = [], { showAll = false } = {}) {
  const groups = new Map();
  crew.forEach(person => {
    const dept = person.department || 'Other';
    if (!groups.has(dept)) groups.set(dept, []);
    groups.get(dept).push(person);
  });

  const ordered = [...groups.entries()].sort(([a], [b]) => {
    const ia = DEPT_PRIORITY.indexOf(a);
    const ib = DEPT_PRIORITY.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const limited = showAll ? ordered : ordered.slice(0, INITIAL_DEPT_LIMIT);

  return limited.map(([dept, people]) => ({
    dept,
    people: showAll ? people : people.slice(0, INITIAL_PEOPLE_PER_DEPT),
    total: people.length,
  }));
}

function Avatar({ path, name }) {
  const img = profileUrl(path, 'md');
  return (
    <div
      style={{
        width: '2.75rem', height: '2.75rem', borderRadius: '50%', overflow: 'hidden',
        flexShrink: 0, background: 'rgba(15,23,42,0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)',
      }}
    >
      {img ? (
        <img src={img} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : '👤'}
    </div>
  );
}

export default function CrewSection({ crew = [] }) {
  const [showAll, setShowAll] = useState(false);
  if (!crew || crew.length === 0) return null;

  const grouped = groupCrew(crew, { showAll });
  if (grouped.length === 0) return null;

  const fullGrouped = groupCrew(crew, { showAll: true });
  const hasMore = !showAll && (
    fullGrouped.length > INITIAL_DEPT_LIMIT
    || fullGrouped.some(g => g.total > INITIAL_PEOPLE_PER_DEPT)
  );

  return (
    <div className="detail-section" style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
          <h2 className="text-section" style={{ margin: 0 }}>Crew</h2>
        </div>
        {hasMore && (
          <button type="button" className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show Less' : `View Full Crew (${crew.length})`}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))', gap: '1rem' }}>
        {grouped.map(({ dept, people }) => (
          <div
            key={dept}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '1rem 1.1rem',
            }}
          >
            <p style={{
              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--brand-accent)',
              marginBottom: '0.75rem',
            }}>
              {dept}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {people.map(person => (
                <Link
                  key={person.credit_id || person.id}
                  to={`/person/${person.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    textDecoration: 'none', color: 'inherit',
                    padding: '0.25rem', borderRadius: '10px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Avatar path={person.profile_path} name={person.name} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc',
                      lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {person.name}
                    </p>
                    <p style={{
                      fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {person.job}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
