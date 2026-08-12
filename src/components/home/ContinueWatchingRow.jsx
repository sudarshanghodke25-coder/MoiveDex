import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getContinueWatchingList, removeFromHistory } from '../../services/history';
import { getPlaybackSource } from '../../services/playback';
import VideoPlayer from '../player/VideoPlayer';

function formatProgressTime(seconds) {
  if (!seconds) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ContinueWatchingRow() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlayback, setActivePlayback] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getContinueWatchingList(currentUser?.uid);
      setItems(list);
    } catch (err) {
      console.error('Failed to load continue watching history:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleResume = async (item) => {
    try {
      const playback = await getPlaybackSource({
        contentId: item.tmdbId,
        mediaType: item.mediaType,
        seasonNumber: item.seasonNumber || 1,
        episodeNumber: item.episodeNumber || 1,
        title: item.title,
        posterPath: item.posterPath,
      });

      if (playback.playable) {
        setResumeTime(item.progressSeconds || 0);
        setActivePlayback(playback);
      } else {
        alert(playback.reason || 'Playback is currently unavailable.');
      }
    } catch (e) {
      console.error('Playback error:', e);
      alert('Could not start playback. Please try again.');
    }
  };

  const handleRemove = async (e, item) => {
    e.stopPropagation();
    await removeFromHistory(currentUser?.uid, item.contentId);
    setItems(prev => prev.filter(i => i.contentId !== item.contentId));
  };

  if (loading || items.length === 0) return null;

  return (
    <section style={{ padding: 'clamp(1.5rem, 4vh, 2.5rem) clamp(1rem, 5vw, 4rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '0.3rem', height: '1.5rem', borderRadius: '2px',
          background: 'linear-gradient(to bottom, #10b981, #3b82f6)',
          boxShadow: '0 0 12px rgba(16,185,129,0.6)', flexShrink: 0,
        }} />
        <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
          ▶️ Continue Watching
        </h2>
      </div>

      {/* Row Grid */}
      <div style={{
        display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent',
      }}>
        {items.map(item => {
          const posterUrl = item.posterPath ? `https://image.tmdb.org/t/p/w342${item.posterPath}` : null;
          const percent = item.durationSeconds ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100)) : 0;
          const isTV = item.mediaType === 'tv' || item.mediaType === 'anime';

          return (
            <div
              key={item.contentId}
              onClick={() => handleResume(item)}
              style={{
                width: '260px',
                flexShrink: 0,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Card Media Preview */}
              <div style={{ height: '140px', position: 'relative', background: '#0f172a' }}>
                {posterUrl ? (
                  <img src={posterUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>🎬</div>
                )}

                {/* Dark Overlay with Play Icon */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(5,5,16,0.95) 0%, rgba(5,5,16,0.3) 60%, transparent 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '50%',
                    background: 'var(--brand-primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(99,102,241,0.6)',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={e => handleRemove(e, item)}
                  title="Remove from Continue Watching"
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                    width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', cursor: 'pointer', zIndex: 5,
                  }}
                >
                  ✕
                </button>

                {/* Episode Badge if TV */}
                {isTV && (
                  <span style={{
                    position: 'absolute', bottom: '0.5rem', left: '0.5rem',
                    background: 'rgba(99,102,241,0.85)', color: '#fff',
                    fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem',
                    borderRadius: '6px', backdropFilter: 'blur(4px)',
                  }}>
                    S{item.seasonNumber}:E{item.episodeNumber}
                  </span>
                )}
              </div>

              {/* Info + Progress Bar */}
              <div style={{ padding: '0.875rem' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.35rem' }}>
                  {item.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(148,163,184,0.8)', marginBottom: '0.5rem' }}>
                  <span>{formatProgressTime(item.progressSeconds)} left</span>
                  <span>{percent}%</span>
                </div>

                {/* Progress bar line */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'var(--brand-gradient)', borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player Modal */}
      {activePlayback && (
        <VideoPlayer
          playbackSource={activePlayback}
          initialTime={resumeTime}
          onClose={() => {
            setActivePlayback(null);
            fetchHistory(); // Refresh history list when player closes
          }}
        />
      )}
    </section>
  );
}
