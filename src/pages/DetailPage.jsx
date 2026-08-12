import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTVDetails, getTVSeasonDetails, getVideos, backdropUrl, posterUrl } from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useAuth } from '../contexts/AuthContext';
import { getPlaybackSource } from '../services/playback';
import { saveWatchProgress, getWatchProgress, getContentId } from '../services/history';
import VideoPlayer from '../components/player/VideoPlayer';

export default function DetailPage({ mediaType = 'movie' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [detail, setDetail] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // TV / Anime Season & Episode states
  const [selectedSeasonNum, setSelectedSeasonNum] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  // Playback state
  const [activePlayback, setActivePlayback] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(null);

  const saveTimerRef = useRef(null);

  const inList = detail ? isInWatchlist(detail.id, mediaType) : false;

  // 1. Fetch main detail
  useEffect(() => {
    setLoading(true);
    setDetail(null);
    setError(null);
    setSeasonData(null);
    setSelectedSeasonNum(1);

    const fetcher = (mediaType === 'tv' || mediaType === 'anime') ? getTVDetails : getMovieDetails;
    fetcher(id)
      .then(data => {
        setDetail(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });

    getVideos(id, mediaType === 'anime' ? 'tv' : mediaType)
      .then(vids => setVideos(vids.filter(v => v.site === 'YouTube' && v.type === 'Trailer')))
      .catch(() => setVideos([]));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, mediaType]);

  // 2. Fetch Season details for TV/Anime
  useEffect(() => {
    if (!detail || (mediaType !== 'tv' && mediaType !== 'anime')) return;

    setSeasonLoading(true);
    getTVSeasonDetails(id, selectedSeasonNum)
      .then(data => {
        setSeasonData(data);
        setSeasonLoading(false);
      })
      .catch(err => {
        console.error('Failed to load season details:', err);
        setSeasonData(null);
        setSeasonLoading(false);
      });
  }, [detail, id, mediaType, selectedSeasonNum]);

  // 3. Launch Video Player for movie or episode
  const handleStartPlayback = async (ep = null) => {
    if (!detail) return;
    const seasonNum = ep ? ep.seasonNumber : 1;
    const epNum = ep ? ep.episodeNumber : 1;

    try {
      const playback = await getPlaybackSource({
        contentId: detail.id,
        mediaType,
        seasonNumber: seasonNum,
        episodeNumber: epNum,
        title: ep ? `${detail.title}: ${ep.name}` : detail.title,
        posterPath: ep?.stillPath || detail.posterPath,
      });

      if (playback.playable) {
        // Check saved progress
        const contentId = getContentId(detail.id, mediaType, seasonNum, epNum);
        const history = await getWatchProgress(currentUser?.uid, contentId);

        setResumeTime(history?.progressSeconds || 0);
        setActiveEpisode(ep);
        setActivePlayback(playback);
      } else {
        alert(playback.reason || 'Playback is currently unavailable.');
      }
    } catch (e) {
      console.error('Playback error:', e);
      alert('Could not start playback. Please try again.');
    }
  };

  // Debounced Watch Progress Saver
  const handlePlayerProgress = useCallback((currentTime, duration) => {
    if (!detail) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const seasonNum = activeEpisode ? activeEpisode.seasonNumber : 1;
      const epNum = activeEpisode ? activeEpisode.episodeNumber : 1;

      saveWatchProgress(currentUser?.uid, {
        tmdbId: detail.id,
        mediaType,
        seasonNumber: seasonNum,
        episodeNumber: epNum,
        title: activeEpisode ? `${detail.title}: ${activeEpisode.name}` : detail.title,
        posterPath: activeEpisode?.stillPath || detail.posterPath,
        progressSeconds: currentTime,
        durationSeconds: duration,
      });
    }, 2000); // debounce 2s
  }, [detail, mediaType, activeEpisode, currentUser]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
        <div className="detail-info-skeleton">
          <div className="skeleton" style={{ height: '3rem', width: '60%', borderRadius: '8px', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '4px', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '6rem', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  if (error) return <div className="error-msg" style={{ padding: '4rem 2rem' }}>{error}</div>;
  if (!detail) return null;

  const backdrop = detail.backdropPath ? backdropUrl(detail.backdropPath, 'original') : null;
  const poster   = detail.posterPath   ? posterUrl(detail.posterPath, 'w500')         : null;
  const year     = detail.releaseDate  ? new Date(detail.releaseDate).getFullYear()   : '';
  const trailer  = videos[0];

  const cast = detail.credits?.cast?.slice(0, 10) || [];
  const similar = detail.similar?.results?.slice(0, 12)
    .map(item => ({
      id: item.id,
      title: item.title || item.name,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      rating: item.vote_average,
      releaseDate: item.release_date || item.first_air_date,
      mediaType,
      overview: item.overview,
    })) || [];

  const isTV = mediaType === 'tv' || mediaType === 'anime';
  const seasonsCount = detail.seasons || (detail.genreObjects?.length ? 1 : 1);

  return (
    <div className="detail-page">
      {/* Backdrop */}
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt={detail.title} className="detail-backdrop-img" />}
        <div className="detail-backdrop-overlay" />
      </div>

      {/* Back Button */}
      <button className="detail-back-btn" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* Main info */}
      <div className="detail-main">
        {/* Poster */}
        <div className="detail-poster">
          {poster ? (
            <img src={poster} alt={detail.title} />
          ) : (
            <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <div className="detail-badges">
            <span className="pill">{mediaType === 'tv' ? '📺 TV Show' : (mediaType === 'anime' ? '⚡ Anime' : '🎬 Movie')}</span>
            {year && <span className="pill">{year}</span>}
            {detail.status && <span className="pill">{detail.status}</span>}
          </div>

          <h1 className="detail-title">{detail.title}</h1>

          {detail.tagline && <p className="detail-tagline">"{detail.tagline}"</p>}

          <div className="detail-stats">
            {detail.rating > 0 && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <strong>{detail.rating.toFixed(1)}</strong>
                <span>/ 10</span>
                {detail.voteCount > 0 && <span className="detail-stat-sub">({detail.voteCount.toLocaleString()} votes)</span>}
              </div>
            )}
            {detail.runtime && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m</span>
              </div>
            )}
            {detail.seasons && (
              <div className="detail-stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                </svg>
                <span>{detail.seasons} Seasons</span>
              </div>
            )}
          </div>

          {detail.genreNames?.length > 0 && (
            <div className="detail-genres">
              {detail.genreNames.map(g => (
                <span key={g} className="pill">{g}</span>
              ))}
            </div>
          )}

          {detail.overview && (
            <div className="detail-overview">
              <h3>Overview</h3>
              <p>{detail.overview}</p>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="detail-actions" style={{ flexWrap: 'wrap', gap: '0.875rem', marginTop: '1.5rem' }}>
            <button
              className="btn-primary"
              onClick={() => handleStartPlayback(seasonData?.episodes?.[0] || null)}
              style={{
                background: 'var(--brand-gradient)',
                color: '#fff',
                padding: '0.875rem 2rem',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 0 25px rgba(99,102,241,0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {isTV ? 'Watch Episode 1' : 'Watch Movie'}
            </button>

            {trailer && (
              <button
                className="btn-ghost"
                onClick={() => setShowTrailer(true)}
                style={{ borderRadius: '999px', padding: '0.875rem 1.75rem', fontWeight: 600 }}
              >
                🎬 Watch Trailer
              </button>
            )}

            <button
              className="btn-ghost"
              onClick={() => detail && toggleWatchlist({ ...detail, mediaType })}
              style={{
                borderRadius: '999px',
                padding: '0.875rem 1.75rem',
                fontWeight: 600,
                borderColor: inList ? 'var(--brand-secondary)' : undefined,
                background: inList ? 'rgba(168, 85, 247, 0.15)' : undefined,
                color: inList ? '#a855f7' : undefined,
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={inList ? '#a855f7' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              {inList ? 'In My List' : 'Add to List'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TV / Anime Seasons & Episodes Section ──────────────────────── */}
      {isTV && (
        <div className="detail-section" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'var(--brand-gradient)', flexShrink: 0 }} />
              <h2 className="text-section" style={{ margin: 0 }}>Seasons & Episodes</h2>
            </div>

            {/* Season Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="season-select" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Season:
              </label>
              <select
                id="season-select"
                value={selectedSeasonNum}
                onChange={e => setSelectedSeasonNum(Number(e.target.value))}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {Array.from({ length: Math.max(1, seasonsCount) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num} style={{ background: '#0f172a', color: '#fff' }}>
                    Season {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Episode List */}
          {seasonLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
              ))}
            </div>
          ) : seasonData?.episodes?.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
              {seasonData.episodes.map(ep => {
                const stillUrl = ep.stillPath ? `https://image.tmdb.org/t/p/w300${ep.stillPath}` : null;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleStartPlayback(ep)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* Still Preview */}
                    <div style={{ height: '150px', position: 'relative', background: '#0f172a' }}>
                      {stillUrl ? (
                        <img src={stillUrl} alt={ep.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>🎬</div>
                      )}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(5,5,16,0.9) 0%, transparent 60%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                          background: 'rgba(99,102,241,0.9)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 15px rgba(99,102,241,0.5)',
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      </div>
                      <span style={{
                        position: 'absolute', bottom: '0.5rem', left: '0.625rem',
                        background: 'rgba(5,5,16,0.85)', color: 'var(--brand-primary)',
                        fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem',
                        borderRadius: '4px', border: '1px solid rgba(99,102,241,0.3)',
                      }}>
                        {ep.episodeCode}
                      </span>
                    </div>

                    {/* Episode Text */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                        {ep.name}
                      </h3>
                      {ep.overview && (
                        <p style={{ fontSize: '0.82rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                          {ep.overview}
                        </p>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)', fontWeight: 600 }}>
                        {ep.airDate && <span>📅 {ep.airDate}</span>}
                        {ep.runtime && <span>⏱️ {ep.runtime} min</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'rgba(148,163,184,0.7)', fontStyle: 'italic' }}>
              No episode details available for Season {selectedSeasonNum}.
            </p>
          )}
        </div>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <div className="detail-section">
          <h2 className="text-section">Cast</h2>
          <div className="cast-row">
            {cast.map(person => (
              <div key={person.id} className="cast-card">
                <div className="cast-avatar">
                  {person.profile_path
                    ? <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} />
                    : <div className="skeleton" style={{ width: '100%', height: '100%' }} />
                  }
                </div>
                <p className="cast-name">{person.name}</p>
                <p className="cast-character">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <div className="detail-section">
          <h2 className="text-section">More Like This</h2>
          <div className="media-grid">
            {similar.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activePlayback && (
        <VideoPlayer
          playbackSource={activePlayback}
          initialTime={resumeTime}
          onProgress={handlePlayerProgress}
          onClose={() => setActivePlayback(null)}
          onNextEpisode={
            activeEpisode && seasonData?.episodes
              ? () => {
                  const idx = seasonData.episodes.findIndex(e => e.id === activeEpisode.id);
                  if (idx !== -1 && idx < seasonData.episodes.length - 1) {
                    handleStartPlayback(seasonData.episodes[idx + 1]);
                  }
                }
              : null
          }
          onPrevEpisode={
            activeEpisode && seasonData?.episodes
              ? () => {
                  const idx = seasonData.episodes.findIndex(e => e.id === activeEpisode.id);
                  if (idx > 0) {
                    handleStartPlayback(seasonData.episodes[idx - 1]);
                  }
                }
              : null
          }
        />
      )}

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-inner" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
