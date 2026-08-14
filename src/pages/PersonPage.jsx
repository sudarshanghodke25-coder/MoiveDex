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
          <div className="skeleton" style={{ height: '8rem', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
}

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bioExpanded, setBioExpanded] = useState(false);
  const [filmTab, setFilmTab] = useState('known');
  const [mediaFilter, setMediaFilter] = useState('all');

  const { data, loading, error } = useTMDB(() => getPersonDetails(id), [id]);

  if (loading) return <PersonSkeleton />;

  if (error || !data) {
    return (
      <div className="empty-state" style={{ minHeight: '70vh' }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h2>Unable to Load Profile</h2>
        <p>{error || 'This person profile is unavailable.'}</p>
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const person = data;
  const profileImg = person.profilePath ? profileUrl(person.profilePath, 'lg') : null;
  const isLongBio = person.biography.length > BIO_EXPAND_LENGTH;
  const shownBio = isLongBio && !bioExpanded ? person.biography.slice(0, BIO_EXPAND_LENGTH) + '…' : person.biography;

  let filmography = filmTab === 'cast' ? person.castCredits : filmTab === 'crew' ? person.crewCredits : person.credits;
  if (mediaFilter === 'movie') filmography = filmography.filter(c => c.mediaType === 'movie');
  if (mediaFilter === 'tv') filmography = filmography.filter(c => c.mediaType === 'tv');

  return (
    <div className="page-content" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ width: 'min(220px, 100%)', flexShrink: 0, borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '2/3', background: 'var(--bg-elevated)' }}>
          {profileImg ? (
            <img src={profileImg} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>👤</div>
          )}
        </div>

        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <div className="detail-badges" style={{ marginBottom: '0.75rem' }}>
            {person.knownForDepartment && <span className="pill">{person.knownForDepartment}</span>}
            {person.popularity > 0 && <span className="pill">🔥 {Math.round(person.popularity).toLocaleString()}</span>}
          </div>
          <h1 className="detail-title" style={{ marginBottom: '0.75rem' }}>{person.name}</h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', marginBottom: '1.5rem' }}>
            {person.birthday && (
              <div>
                <span className="quick-fact-label">Born</span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{person.birthday}</p>
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
          </div>

          {(person.homepage || person.imdbId) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {person.homepage && (
                <a href={person.homepage} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ borderRadius: '999px', fontSize: '0.85rem', textDecoration: 'none' }}>🌐 Official Site</a>
              )}
              {person.imdbId && (
                <a href={`https://www.imdb.com/name/${person.imdbId}/`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ borderRadius: '999px', fontSize: '0.85rem', textDecoration: 'none' }}>🎬 IMDb</a>
              )}
            </div>
          )}

          {person.biography && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-accent)', display: 'block', marginBottom: '0.625rem' }}>Biography</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{shownBio}</p>
              {isLongBio && (
                <button type="button" className="btn-ghost" style={{ marginTop: '0.875rem', fontSize: '0.8rem' }} onClick={() => setBioExpanded(b => !b)}>
                  {bioExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {filmography.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="text-section" style={{ margin: 0 }}>Filmography</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'known', label: 'Known For' },
                { id: 'cast', label: 'Acting' },
                { id: 'crew', label: 'Crew' },
              ].map(t => (
                <button key={t.id} type="button" className={`tab-btn ${filmTab === t.id ? 'active' : ''}`} onClick={() => setFilmTab(t.id)}>{t.label}</button>
              ))}
              {[
                { id: 'all', label: 'All' },
                { id: 'movie', label: 'Movies' },
                { id: 'tv', label: 'TV' },
              ].map(t => (
                <button key={t.id} type="button" className={`tab-btn ${mediaFilter === t.id ? 'active' : ''}`} onClick={() => setMediaFilter(t.id)}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="media-grid">
            {filmography.map(c => (
              <MovieCard key={`${c.mediaType}-${c.id}-${c.character || c.job}`} movie={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
