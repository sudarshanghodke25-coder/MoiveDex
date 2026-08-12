import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '00:00';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function VideoPlayer({
  playbackSource,
  initialTime = 0,
  onClose,
  onProgress,
  onEnded,
  onNextEpisode = null,
  onPrevEpisode = null,
}) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings menus state
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [currentAudio, setCurrentAudio] = useState('orig');
  const [currentSub, setCurrentSub] = useState('off');

  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [resumeNotice, setResumeNotice] = useState(initialTime > 5 ? `Resumed at ${formatTime(initialTime)}` : null);

  // Clear resume toast after 4s
  useEffect(() => {
    if (resumeNotice) {
      const t = setTimeout(() => setResumeNotice(null), 4000);
      return () => clearTimeout(t);
    }
  }, [resumeNotice]);

  // Handle controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimer]);

  // Video loaded metadata
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    if (initialTime > 0 && initialTime < video.duration) {
      video.currentTime = initialTime;
    }
    setIsLoading(false);
    video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  // Time update callback
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (onProgress) {
      onProgress(video.currentTime, video.duration);
    }
  };

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Seek
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Volume
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    setVolume(val);
    if (video) video.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const el = playerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Quality switch (preserves current time)
  const handleQualityChange = (q) => {
    const video = videoRef.current;
    if (!video) return;
    const time = video.currentTime;
    setCurrentQuality(q.label);
    setShowQualityMenu(false);

    if (q.src && q.src !== video.src) {
      video.src = q.src;
      video.currentTime = time;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user typing in input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.min(1, videoRef.current.volume + 0.1);
          videoRef.current.volume = newVol;
          setVolume(newVol);
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.max(0, videoRef.current.volume - 0.1);
          videoRef.current.volume = newVol;
          setVolume(newVol);
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'Escape') {
        if (!document.fullscreenElement && onClose) {
          onClose();
        }
      }
      resetControlsTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, onClose, resetControlsTimer, togglePlay, toggleMute, toggleFullscreen]);

  if (!playbackSource) return null;

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={resetControlsTimer}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Video Tag */}
      <video
        ref={videoRef}
        src={playbackSource.videoUrl}
        poster={playbackSource.posterUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={() => {
          setIsLoading(false);
          setError('Video stream could not be loaded. Please check your connection.');
        }}
        onClick={togglePlay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          cursor: 'pointer',
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#fff' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: 'var(--brand-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading Stream...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ position: 'absolute', padding: '2rem', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', textAlign: 'center', color: '#fff', maxWidth: '400px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>⚠️</span>
          <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Playback Error</h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(148,163,184,0.85)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '999px' }}>
            Close Player
          </button>
        </div>
      )}

      {/* Resume Notification Toast */}
      {resumeNotice && (
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(225,29,72,0.95)',
          color: '#fff',
          padding: '0.5rem 1.25rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}>
          ⏱️ {resumeNotice}
        </div>
      )}

      {/* Top Header Bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: '1.5rem 2rem',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: controlsVisible ? 1 : 0,
        pointerEvents: controlsVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
              width: '2.5rem', height: '2.5rem', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            aria-label="Close video player"
          >
            ✕
          </button>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>{playbackSource.title}</h2>
            <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>MovieHub Streaming POC</span>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onPrevEpisode && (
            <button
              onClick={onPrevEpisode}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
                padding: '0.45rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              ⏮️ Prev
            </button>
          )}
          {onNextEpisode && (
            <button
              onClick={onNextEpisode}
              style={{
                background: 'var(--brand-primary)', border: 'none', color: '#fff',
                padding: '0.45rem 1.1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
                boxShadow: '0 0 15px rgba(225,29,72,0.5)',
              }}
            >
              Next Ep ⏭️
            </button>
          )}
        </div>
      </div>

      {/* Center Play Overlay Icon when paused */}
      {!isPlaying && !isLoading && !error && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            width: '5rem', height: '5rem', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e11d48 0%, #d97706 100%)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 40px rgba(225,29,72,0.6)',
            transition: 'transform 0.2s ease',
            zIndex: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '2rem 2rem 1.25rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        opacity: controlsVisible ? 1 : 0,
        pointerEvents: controlsVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 5,
      }}>
        {/* Progress bar slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            style={{
              flex: 1,
              height: '5px',
              borderRadius: '999px',
              appearance: 'none',
              background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`,
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>

            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
                {isMuted || volume === 0 ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: '70px', height: '4px', cursor: 'pointer' }}
              />
            </div>

            {/* Time Display */}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls: Quality, Audio, Subtitles, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            {/* Quality Menu */}
            {playbackSource.qualities && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowQualityMenu(v => !v); setShowAudioMenu(false); setShowSubMenu(false); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ⚙️ {currentQuality}
                </button>
                {showQualityMenu && (
                  <div style={{ position: 'absolute', bottom: '2.5rem', right: 0, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '100px', zIndex: 20 }}>
                    {playbackSource.qualities.map(q => (
                      <button
                        key={q.label}
                        onClick={() => handleQualityChange(q)}
                        style={{ background: currentQuality === q.label ? 'var(--brand-primary)' : 'transparent', border: 'none', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '6px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audio Menu */}
            {playbackSource.audioTracks && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowAudioMenu(v => !v); setShowQualityMenu(false); setShowSubMenu(false); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🔊 Audio
                </button>
                {showAudioMenu && (
                  <div style={{ position: 'absolute', bottom: '2.5rem', right: 0, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '130px', zIndex: 20 }}>
                    {playbackSource.audioTracks.map(a => (
                      <button
                        key={a.code}
                        onClick={() => { setCurrentAudio(a.code); setShowAudioMenu(false); }}
                        style={{ background: currentAudio === a.code ? 'var(--brand-primary)' : 'transparent', border: 'none', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '6px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtitles Menu */}
            {playbackSource.subtitleTracks && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowSubMenu(v => !v); setShowQualityMenu(false); setShowAudioMenu(false); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  💬 Subs ({currentSub.toUpperCase()})
                </button>
                {showSubMenu && (
                  <div style={{ position: 'absolute', bottom: '2.5rem', right: 0, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '120px', zIndex: 20 }}>
                    {playbackSource.subtitleTracks.map(s => (
                      <button
                        key={s.code}
                        onClick={() => { setCurrentSub(s.code); setShowSubMenu(false); }}
                        style={{ background: currentSub === s.code ? 'var(--brand-primary)' : 'transparent', border: 'none', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '6px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
              aria-label="Toggle Fullscreen"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
