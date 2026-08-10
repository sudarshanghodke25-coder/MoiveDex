import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

gsap.registerPlugin(ScrollTrigger);

export default function MovieRow({ title, items = [], loading = false, error = null, viewAllTo = null }) {
  const sectionRef = useRef(null);
  const rowRef     = useRef(null);
  const titleRef   = useRef(null);

  useEffect(() => {
    if (loading || items.length === 0) return;

    const ctx = gsap.context(() => {
      // Title slide in
      gsap.from(titleRef.current, {
        x: -40, opacity: 0, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', toggleActions: 'play none none none' },
      });

      // Cards stagger up
      const cards = rowRef.current?.children || [];
      if (cards.length) {
        gsap.from(Array.from(cards), {
          y: 50, opacity: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out',
          scrollTrigger: { trigger: rowRef.current, start: 'top 92%', toggleActions: 'play none none none' },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, items]);

  return (
    <section ref={sectionRef} style={{ padding: 'clamp(1.5rem, 4vh, 2.5rem) clamp(1rem, 5vw, 4rem)' }} aria-labelledby={`row-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Header */}
      <div ref={titleRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '0.3rem', height: '1.5rem', borderRadius: '2px',
            background: 'linear-gradient(to bottom, #6366f1, #a855f7)',
            boxShadow: '0 0 12px rgba(99,102,241,0.6)',
            flexShrink: 0,
          }} />
          <h2 id={`row-${title.replace(/\s+/g, '-').toLowerCase()}`} style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
        </div>
        {viewAllTo && (
          <a
            href={viewAllTo}
            aria-label={`View all ${title}`}
            style={{
              fontSize: '0.82rem', fontWeight: 700, color: '#6366f1',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              textDecoration: 'none', transition: 'color 0.2s, gap 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a855f7'; e.currentTarget.style.gap = '0.6rem'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.gap = '0.3rem'; }}
          >
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>

      {/* Error state */}
      {error && !loading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(148,163,184,0.6)', fontSize: '0.875rem' }}>
          ⚠️ Could not load content — please check your connection.
        </div>
      )}

      {/* Scroll row */}
      {!error && (
        <div
          ref={rowRef}
          role="list"
          aria-label={`${title} list`}
          style={{
            display: 'flex', gap: '1rem', overflowX: 'auto', overflowY: 'visible',
            paddingBottom: '1rem', paddingTop: '0.25rem',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent',
            scrollSnapType: 'x mandatory',
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} role="listitem" style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                  <MovieCardSkeleton />
                </div>
              ))
            : items.map(item => (
                <div key={item.id} role="listitem" style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                  <MovieCard
                    title={item.title}
                    posterPath={item.posterPath}
                    rating={item.rating}
                    year={item.releaseDate ? item.releaseDate.slice(0, 4) : null}
                    mediaType={item.mediaType}
                  />
                </div>
              ))
          }
        </div>
      )}
    </section>
  );
}
