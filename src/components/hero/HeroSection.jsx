import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import CinematicBackground from './StarfieldBackground';

export default function HeroSection() {
  const badgeRef    = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef      = useRef(null);
  const statsRef    = useRef(null);
  const scrollRef   = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

      tl.from(badgeRef.current, { y: 30, opacity: 0, duration: 0.7 })
        .from(titleRef.current.children, { y: 80, opacity: 0, rotateX: 20, duration: 1, stagger: 0.15 }, '-=0.4')
        .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
        .from(ctaRef.current.children, { y: 30, opacity: 0, scale: 0.92, duration: 0.6, stagger: 0.12 }, '-=0.45')
        .from(statsRef.current.children, { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
        .from(scrollRef.current, { opacity: 0, duration: 0.6 }, '-=0.2');
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
        background: '#050510',
        padding: '6rem clamp(1rem, 6vw, 5rem) 5rem',
      }}
    >
      {/* Cinematic parallax background */}
      <CinematicBackground />

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
            color: '#a5b4fc',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#6366f1',
            boxShadow: '0 0 10px rgba(99,102,241,0.9)',
            animation: 'pulse-dot 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          🎬 Your Cinematic Universe Awaits
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
            fontSize: 'clamp(3rem, 10vw, 7rem)',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '-0.03em',
            textShadow: '0 4px 40px rgba(99,102,241,0.3)',
          }}>
            Movie
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Dex</span>
          </span>
          <span style={{
            display: 'block',
            fontSize: 'clamp(1.1rem, 3.5vw, 2rem)',
            fontWeight: 400,
            color: 'rgba(248,250,252,0.55)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '0.3rem',
          }}>
            Discover · Track · Explore
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
          Your all-in-one gateway to movies, TV shows &amp; anime. Discover what to
          watch, build your personal list, and never miss a great title.
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
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', fontWeight: 700, fontSize: '1.05rem',
              padding: '1rem 2.5rem', borderRadius: '999px', border: 'none',
              boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.4)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 70px rgba(99,102,241,0.6), 0 12px 40px rgba(0,0,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.4)'; }}
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
              background: 'rgba(255,255,255,0.06)', color: '#f8fafc', fontWeight: 600,
              fontSize: '1.05rem', padding: '1rem 2.5rem', borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
              transition: 'all 0.25s ease', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = ''; }}
          >
            Browse Movies
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
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
            { value: '1M+',   label: 'Titles', icon: '🎬' },
            { value: '150+',  label: 'Countries', icon: '🌍' },
            { value: '50+',   label: 'Genres', icon: '🎭' },
            { value: 'Free',  label: 'Forever', icon: '✨' },
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

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '2.5rem', left: '50%',
          transform: 'translateX(-50%)', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        }}
      >
        <div style={{
          width: '22px', height: '36px', borderRadius: '11px',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '5px',
        }}>
          <div style={{
            width: '3px', height: '8px', borderRadius: '1.5px',
            background: 'linear-gradient(to bottom, #6366f1, #a855f7)',
            animation: 'scroll-wheel 1.8s ease-in-out infinite',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; box-shadow:0 0 10px rgba(99,102,241,0.9); }
          50%      { opacity:0.5; box-shadow:0 0 20px rgba(99,102,241,0.4); }
        }
        @keyframes scroll-wheel {
          0%   { transform:translateY(0); opacity:1; }
          80%  { transform:translateY(12px); opacity:0; }
          100% { transform:translateY(0); opacity:0; }
        }
      `}</style>
    </section>
  );
}
