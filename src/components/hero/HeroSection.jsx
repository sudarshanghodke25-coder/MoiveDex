import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function HeroSection() {
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

      tl.from(badgeRef.current, { y: 30, opacity: 0, duration: 0.7 })
        .from(titleRef.current.children, { y: 80, opacity: 0, rotateX: 20, duration: 1, stagger: 0.15 }, '-=0.4')
        .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
        .from(ctaRef.current.children, { y: 30, opacity: 0, scale: 0.92, duration: 0.6, stagger: 0.12 }, '-=0.45')
        .from(statsRef.current.children, { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3');
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      aria-label="Hero"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'transparent',
        padding: '6rem clamp(1rem, 6vw, 5rem) 5rem',
      }}
    >
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '900px',
          width: '100%',
        }}
      >
        {/* Badge */}
        <div
          ref={badgeRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '999px',
            padding: '0.4rem 1.1rem',
            marginBottom: '2rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--brand-primary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--brand-primary)',
            boxShadow: '0 0 10px rgba(99,102,241,0.9)',
            animation: 'pulse-dot 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          ⚡ YOUR ULTIMATE CINEMATIC ESCAPE
        </div>

        {/* Main title */}
        <h1
          ref={titleRef}
          style={{
            marginBottom: '1.5rem',
            perspective: '800px',
            lineHeight: 1.04,
          }}
        >
          <span style={{
            display: 'block',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 40px rgba(99,102,241,0.3)',
          }}>
            Endless Movies, Shows & Anime.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            color: 'rgba(148,163,184,0.9)',
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
            fontSize: 'clamp(1rem, 2.2vw, 1.15rem)',
            lineHeight: 1.75,
          }}
        >
          Stream, track, and dive into 1M+ titles across every genre. Zero subscriptions, pure entertainment.
        </p>

        {/* CTA buttons */}
        <div
          ref={ctaRef}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}
        >
          <Link
            to="/register"
            id="hero-cta-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem',
              padding: '1rem 2.5rem', borderRadius: '999px',
              boxShadow: '0 0 30px rgba(99,102,241,0.35)',
              transition: 'all 0.25s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.35)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Exploring Free
          </Link>
          <Link
            to="/movies"
            id="hero-cta-secondary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
              background: 'rgba(15, 23, 42, 0.85)', color: '#f8fafc', fontWeight: 600,
              fontSize: '1.05rem', padding: '1rem 2.5rem', borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              transition: 'all 0.25s ease', textDecoration: 'none',
              opacity: 1, visibility: 'visible'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.95)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = ''; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            Watch Trailer
          </Link>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          role="list"
          aria-label="Platform statistics"
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '1.5rem 3rem',
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          {[
            { value: '1M+', label: 'Titles', icon: '🎬' },
            { value: '150+', label: 'Countries', icon: '🌍' },
            { value: '50+', label: 'Genres', icon: '🎭' },
            { value: 'Free', label: 'Forever', icon: '✨' },
          ].map(({ value, label, icon }) => (
            <div key={label} role="listitem" style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', fontWeight: 900,
                background: 'linear-gradient(135deg, #e0e7ff, #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>
                {icon} {value}
              </div>
              <div style={{
                fontSize: '0.72rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.3rem',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; box-shadow:0 0 10px rgba(99,102,241,0.9); }
          50%      { opacity:0.5; box-shadow:0 0 20px rgba(99,102,241,0.4); }
        }
      `}</style>
    </section>
  );
}
