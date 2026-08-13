import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonDetails, profileUrl } from '../services/tmdb';
import useTMDB from '../hooks/useTMDB';
import MovieCard from '../components/movie-card/MovieCard';

const BIO_EXPAND_LENGTH = 420;

function PersonSkeleton() {
  return (
    <div className="page-content" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="skeleton" style={{ width: '220px', height: '330px', borderRadius: '16px', flexShrink: 0 }} />
        <div style={{ flex: '1 1 300px' }}>
          <div className="skeleton" style={{ height: '2.75rem', width: '55%', borderRadius: '8px', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '35%', borderRadius: '4px', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '8rem', borderRadius: '8px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: '14rem', borderRadius: '16px', marginTop: '2rem' }} />
    </div>
  );
}

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bioExpanded, setBioExpanded] = useState(false);

  const { data, loading, error } = useTMDB(() => getPersonDetails(id), [id]);

  if (loading) return <PersonSkeleton />;

  if (error || !data) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h2 className="text-title" style={{ color: 'var(--danger)' }}>Unable to Load Profile</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}>{error || 'This person profile is unavailable.'}</p>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ borderRadius: '999px', marginTop: '0.5rem' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const person = data;
  const profileImg = person.profilePath ? profileUrl(person.profilePath, 'lg') : null;
  const isLongBio = person.biography.length > BIO_EXPAND_LENGTH;
  const shownBio = isLongBio && !bioExpanded ? person.biography.slice(0, BIO_EXPAND_LENGTH) + '…' : person.biography;
  const age = person.birthday
    ? (() => {
        const b = new Date(person.birthday);
        const now = new Date();
        let a = now.getFullYear() - b.getFullYear();
        const m = now.getMonth() - b.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a -= 1;
        return a;
      })()
    : null;

  const knownFor = person.credits.slice(0, 12);

  return (
    <div className="page-content" style={{ paddingBottom: '4rem' }}>
      {/* ── Header: profile + bio ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Profile image */}
        <div
          style={{
            width: 'min(220px, 100%)', flexShrink: 0,
            borderRadius: '20px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            background: 'var(--bg-elevated)',
            aspectRatio: '2/3',
          }}
        >
          {profileImg ? (
            <img src={profileImg} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'rgba(255,255,255,0.25)' }}>
              👤
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <div className="detail-badges" style={{ marginBottom: '0.75rem' }}>
            {person.knownForDepartment && <span className="pill">{person.knownForDepartment}</span>}
            {person.popularity > 0 && <span className="pill">🔥 {Math.round(person.popularity).toLocaleString()}</span>}
          </div>

          <h1 className="detail-title" style={{ marginBottom: '0.75rem' }}>{person.name}</h1>

          {/* Quick facts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', marginBottom: '1.5rem' }}>
            {person.birthday && (
              <div>
                <span className="quick-fact-label">Born</span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {person.birthday}{age !== null ? ` (${age})` : ''}
                </p>
              </div>
            )}
            {person.placeOfBirth && (
              <div>
                <span className="quick-fact-label">Place of Birth</span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{person.placeOfBirth}</p>
              </div>
            )}
            {person.deathday && (
              <div>
                <span className="quick-fact-label">Died</span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{person.deathday}</p>
              </div>
            )}
            {person.credits.length > 0 && (
              <div>
                <span className="quick-fact-label">Known For</span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {person.credits.length} title{person.credits.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Also known as */}
          {person.alsoKnownAs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {person.alsoKnownAs.slice(0, 6).map(name => (
                <span key={name} style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* External links */}
          {(person.homepage || person.imdbId) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {person.homepage && (
                <a href={person.homepage} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                  🌐 Official Site
                </a>
              )}
              {person.imdbId && (
                <a href={`https://www.imdb.com/name/${person.imdbId}/`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                  🎬 IMDb
                </a>
              )}
            </div>
          )}

          {/* Biography */}
          {person.biography && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '1.25rem 1.5rem',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-accent)', display: 'block', marginBottom: '0.625rem' }}>
                Biography
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>
                {shownBio || 'No biography is available for this person.'}
              </p>
              {isLongBio && (
                <button
                  onClick={() => setBioExpanded(b => !b)}
                  className="btn-ghost"
                  style={{ borderRadius: '999px', marginTop: '0.875rem', padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  {bioExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Known For / Filmography ────────────────────────────────── */}
      {knownFor.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
            <h2 className="text-section" style={{ margin: 0 }}>Known For</h2>
          </div>
          <div className="media-grid">
            {knownFor.map(c => (
              <MovieCard
                key={`${c.mediaType}-${c.id}`}
                movie={{
                  id: c.id,
                  title: c.title,
                  posterPath: c.posterPath,
                  rating: c.rating,
                  releaseDate: c.releaseDate,
                  mediaType: c.mediaType,
                  genreNames: [],
                  overview: '',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
