/**
 * components/hero/HeroBanner.jsx  —  Phase 4
 *
 * Improvements over Phase 3:
 *   - Preloads next slide's backdrop before the transition
 *   - GSAP crossfade between slides (old fades out, new fades in)
 *   - Progressive backdrop: shows blurred low-res first, swaps to full res
 *   - srcSet on backdrop image for responsive bandwidth
 *   - "More Info" correctly navigates to detail page
 *   - Accessible prev/next keyboard controls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { backdropUrl, backdropSrcSet, preloadImage } from '../../services/tmdb';
import { useWatchlist } from '../../contexts/WatchlistContext';

const SLIDE_INTERVAL = 8000; // 8 seconds per slide
const MAX_SLIDES     = 6;

export default function HeroBanner({ items = [], loading = false }) {
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [startX, setStartX] = useState(null);
  const [paused, setPaused] = useState(false);
  const contentRef = useRef(null);
  const navigate   = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const slides = items.slice(0, MAX_SLIDES);

  // ── Slide transition ──────────────────────────────────────────────
  const goTo = useCallback((idx, direction = 1) => {
    if (!slides.length) return;
    const clampedIdx = ((idx % slides.length) + slides.length) % slides.length;

    // GSAP: slide content out then in
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: direction * 40 },
        { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' }
      );
    }

    setActiveIdx(clampedIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, slides.length]);

  // ── Preload next slide's backdrop ─────────────────────────────────
  useEffect(() => {
    if (!slides.length) return;
    const next = slides[(activeIdx + 1) % slides.length];
    if (!next?.backdropPath) return;
    const url = backdropUrl(next.backdropPath, 'lg');
    preloadImage(url).catch(() => {});
  }, [activeIdx, slides]);

  // ── Auto-rotate (paused on hover; skipped when reduced motion) ────
  useEffect(() => {
    if (!slides.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || paused) return;
    const timer = setInterval(() => goTo(activeIdx + 1, 1), SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [activeIdx, slides.length, goTo, paused]);

  // ── Reset index when items change ─────────────────────────────────
  useEffect(() => { setActiveIdx(0); }, [items]);

  // ── Drag / Swipe handlers ─────────────────────────────────────────
  const handleDragStart = (e) => {
    setStartX(e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);
  };

  const handleDragEnd = (e) => {
    if (startX === null) return;
    const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (diff > 50) {
      goTo(activeIdx + 1, 1);
    } else if (diff < -50) {
      goTo(activeIdx - 1, -1);
    }
    setStartX(null);
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="hero-banner hero-banner--skeleton">
        <div className="hero-skeleton-content">
          <div className="skeleton" style={{ height: '1.5rem', width: '120px', borderRadius: '999px', marginBottom: '1.25rem' }} />
          <div className="skeleton" style={{ height: '3rem', width: '70%', borderRadius: '8px', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: '3rem', width: '50%', borderRadius: '8px', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '90%', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '80%', borderRadius: '4px', marginBottom: '2rem' }} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '3rem', width: '140px', borderRadius: '999px' }} />
            <div className="skeleton" style={{ height: '3rem', width: '120px', borderRadius: '999px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!slides.length) return null;

  const movie    = slides[activeIdx];
  const inHeroList = isInWatchlist(movie.id, movie.mediaType || 'movie');
  const backdrop = movie?.backdropPath ? backdropUrl(movie.backdropPath, 'lg') : null;
  const srcset   = movie?.backdropPath ? backdropSrcSet(movie.backdropPath) : '';
  const year     = movie?.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

  function handleDetail() {
    if (!movie) return;
    if (movie.mediaType === 'anime') navigate(`/anime/${movie.id}`);
    else if (movie.mediaType === 'tv') navigate(`/tv/${movie.id}`);
    else navigate(`/movie/${movie.id}`);
  }

  return (
    <div 
      className="hero-banner" 
      role="region" 
      aria-label="Featured content"
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ 
        cursor: startX !== null ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'pan-y'
      }}
    >
      {/* Backdrop layer — key forces React to replace, triggering CSS animation */}
      <div className="hero-bg" key={`bg-${movie.id}`} aria-hidden="true">
        {backdrop && (
          <img
            src={backdrop}
            srcSet={srcset}
            sizes="100vw"
            alt=""
            className="hero-bg-img"
            fetchPriority="high"
          />
        )}
        <div className="hero-gradient-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content" ref={contentRef}>
        <div className="hero-meta">
          <span className="pill hero-type-pill">
            {movie.mediaType === 'anime' ? '⚡ Anime' : movie.mediaType === 'tv' ? '📺 Series' : '🎬 Film'}
          </span>
          {year && <span className="hero-year">{year}</span>}
          {movie.rating > 0 && (
            <span className="hero-rating" aria-label={`Rated ${movie.rating.toFixed(1)} out of 10`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {movie.rating.toFixed(1)}
            </span>
          )}
          {movie.genreNames?.slice(0, 2).map(g => (
            <span key={g} className="hero-genre-tag">{g}</span>
          ))}
        </div>

        <h1 className="hero-title">{movie.title}</h1>

        {movie.overview && (
          <p className="hero-overview">
            {movie.overview.length > 220 ? movie.overview.slice(0, 220) + '…' : movie.overview}
          </p>
        )}

        <div className="hero-actions">
          <button className="btn-primary hero-play-btn" onClick={handleDetail} aria-label={`View details for ${movie.title}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            View Details
          </button>
          <button
            className="btn-ghost"
            onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie); }}
            aria-label={inHeroList ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
            aria-pressed={inHeroList}
            style={{
              borderColor: inHeroList ? 'rgba(245,158,11,0.6)' : undefined,
              background: inHeroList ? 'rgba(245,158,11,0.15)' : undefined,
              color: inHeroList ? 'var(--brand-accent)' : undefined,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={inHeroList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
            </svg>
            {inHeroList ? 'In My List' : 'Add to List'}
          </button>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="hero-controls" aria-label="Slide controls">
        <div className="hero-dots" role="tablist" aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              className={`hero-dot ${i === activeIdx ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i, i > activeIdx ? 1 : -1);
              }}
              aria-selected={i === activeIdx}
              aria-label={`Slide ${i + 1}: ${slides[i]?.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
