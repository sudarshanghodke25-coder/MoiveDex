import { useRef, useState } from 'react';
import MovieCard from '../movie-card/MovieCard';

export default function ScrollRow({ title, items = [], loading = false, icon = null }) {
  const rowRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  function scroll(dir) {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: 'smooth' });
    setTimeout(() => {
      setShowLeft(el.scrollLeft > 10);
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 350);
  }

  const skeletonCount = 7;

  return (
    <section className="scroll-section">
      <div className="section-header">
        <h2 className="text-section section-label">
          {icon && <span className="section-dot" style={{ background: icon }}></span>}
          {!icon && <span className="section-dot"></span>}
          {title}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="scroll-arrow-btn"
            onClick={() => scroll(-1)}
            disabled={!showLeft}
            aria-label="Scroll left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            className="scroll-arrow-btn"
            onClick={() => scroll(1)}
            disabled={!showRight}
            aria-label="Scroll right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="scroll-row"
        onScroll={() => {
          const el = rowRef.current;
          if (!el) return;
          setShowLeft(el.scrollLeft > 10);
          setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }}
      >
        {loading
          ? [...Array(skeletonCount)].map((_, i) => (
              <div key={i} className="movie-card movie-card--md" style={{ flexShrink: 0 }}>
                <div className="card-poster skeleton" />
                <div className="card-info">
                  <div className="skeleton" style={{ height: '0.875rem', width: '80%', marginBottom: '0.4rem', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '50%', borderRadius: '4px' }} />
                </div>
              </div>
            ))
          : items.map(movie => (
              <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={movie} size="md" />
            ))
        }
      </div>
    </section>
  );
}
