import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../components/hero/HeroSection';
import MovieRow from '../components/movie-card/MovieRow';
import Footer from '../components/common/Footer';
import useTMDB from '../hooks/useTMDB';
import { getTrending, getPopularMovies, getPopularTV, getAnime } from '../services/tmdb';

gsap.registerPlugin(ScrollTrigger);

const GENRE_PILLS = [
  { label: 'Action', emoji: '💥' },
  { label: 'Drama',  emoji: '🎭' },
  { label: 'Sci-Fi', emoji: '🚀' },
  { label: 'Thriller', emoji: '🔪' },
  { label: 'Comedy',  emoji: '😂' },
  { label: 'Horror',  emoji: '👻' },
  { label: 'Romance', emoji: '💕' },
  { label: 'Animation', emoji: '✨' },
  { label: 'Fantasy', emoji: '🧙' },
  { label: 'Documentary', emoji: '🎥' },
];

const FEATURES = [
  {
    emoji: '🎬',
    title: 'Always Up-to-Date',
    desc: 'Powered by TMDB for real-time ratings, cast info, trailers and more.',
    color: '#6366f1',
  },
  {
    emoji: '❤️',
    title: 'Personal Lists',
    desc: 'Build your watchlist, save favorites, and track your watch history.',
    color: '#ef4444',
  },
  {
    emoji: '🔍',
    title: 'Instant Search',
    desc: 'Find any movie or show in milliseconds with smart debounced search.',
    color: '#f59e0b',
  },
  {
    emoji: '🤖',
    title: 'Smart Recommendations',
    desc: 'Discover what to watch next based on your unique taste profile.',
    color: '#10b981',
  },
];

export default function LandingPage() {
  const featuresRef  = useRef(null);
  const ctaRef       = useRef(null);
  const genreRef     = useRef(null);
  const [activeGenre, setActiveGenre] = useState('Action');

  // ── Live TMDB data ──────────────────────────────────────────────
  const trending = useTMDB(getTrending,        []);
  const movies   = useTMDB(getPopularMovies,   []);
  const tv       = useTMDB(getPopularTV,       []);
  const anime    = useTMDB(getAnime,           []);

  // ── Scroll animations ───────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Features cards
      gsap.from('.feature-card', {
        y: 60, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      });

      // Genre pills
      gsap.from('.genre-pill', {
        scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(1.8)',
        scrollTrigger: { trigger: genreRef.current, start: 'top 88%', toggleActions: 'play none none none' },
      });

      // CTA section
      gsap.from(ctaRef.current, {
        y: 50, opacity: 0, duration: 0.75, ease: 'power2.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 82%', toggleActions: 'play none none none' },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main id="main-content" style={{ background: 'var(--bg-deepspace)', minHeight: '100dvh' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Trending (live TMDB) ─────────────────────────────────── */}
      <MovieRow
        title="🔥 Trending This Week"
        items={trending.data}
        loading={trending.loading}
        error={trending.error}
        viewAllTo="/movies"
      />

      {/* ── Popular Movies (live TMDB) ────────────────────────────── */}
      <MovieRow
        title="🎬 Popular Movies"
        items={movies.data}
        loading={movies.loading}
        error={movies.error}
        viewAllTo="/movies"
      />

      {/* ── Genre pills ──────────────────────────────────────────── */}
      <section
        ref={genreRef}
        aria-labelledby="genres-heading"
        style={{ padding: '1.5rem clamp(1rem, 5vw, 4rem)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'linear-gradient(to bottom, #f59e0b, #ef4444)', flexShrink: 0 }} />
          <h2 id="genres-heading" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', fontWeight: 800, color: '#f8fafc' }}>
            Browse by Genre
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }} role="list" aria-label="Genre filters">
          {GENRE_PILLS.map(({ label, emoji }) => (
            <button
              key={label}
              role="listitem"
              aria-pressed={activeGenre === label}
              className="genre-pill"
              onClick={() => setActiveGenre(label)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1.1rem', borderRadius: '999px',
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
                background: activeGenre === label
                  ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                  : 'rgba(255,255,255,0.06)',
                color: activeGenre === label ? '#fff' : 'rgba(148,163,184,0.85)',
                boxShadow: activeGenre === label ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                outline: 'none',
              }}
              onMouseEnter={e => { if (activeGenre !== label) { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#f8fafc'; } }}
              onMouseLeave={e => { if (activeGenre !== label) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; } }}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Popular TV (live TMDB) ────────────────────────────────── */}
      <MovieRow
        title="📺 Popular TV Shows"
        items={tv.data}
        loading={tv.loading}
        error={tv.error}
        viewAllTo="/tv"
      />

      {/* ── Anime (live TMDB) ─────────────────────────────────────── */}
      <MovieRow
        title="⚡ Top Anime"
        items={anime.data}
        loading={anime.loading}
        error={anime.error}
        viewAllTo="/anime"
      />

      {/* ── Why MovieDex features strip ───────────────────────────── */}
      <section
        ref={featuresRef}
        aria-labelledby="features-heading"
        style={{
          padding: 'clamp(3rem, 8vh, 5rem) clamp(1rem, 5vw, 4rem)',
          background: 'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, transparent 100%)',
          marginTop: '1rem',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '999px', padding: '0.35rem 1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Why MovieDex</span>
            </div>
            <h2 id="features-heading" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                discover more
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ emoji, title, desc, color }) => (
              <article
                key={title}
                className="feature-card"
                style={{
                  padding: '2rem 1.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = `${color}44`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${color}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{
                  width: '3.25rem', height: '3.25rem', borderRadius: '12px',
                  background: `${color}18`, border: `1px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '1.25rem',
                }}>
                  {emoji}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.65 }}>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        aria-labelledby="cta-heading"
        style={{
          padding: 'clamp(4rem, 12vh, 7rem) clamp(1rem, 5vw, 4rem)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Glowing background */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 80% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(168,85,247,0.08) 0%, transparent 60%)
          `,
        }} />
        {/* Animated border glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '0 10%', top: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.6), transparent)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍿</p>
          <h2 id="cta-heading" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.1 }}>
            Ready to explore?
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.85)', marginBottom: '2.5rem', lineHeight: 1.7, fontSize: '1.05rem' }}>
            Join MovieDex for free. Build your watchlist, find hidden gems, and
            never run out of something great to watch.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/register"
              id="cta-banner-signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                padding: '1rem 2.25rem', borderRadius: '999px',
                boxShadow: '0 0 40px rgba(99,102,241,0.4)', textDecoration: 'none',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(99,102,241,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.4)'; }}
            >
              🚀 Create Free Account
            </a>
            <a
              href="/movies"
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.06)', color: '#f8fafc',
                fontWeight: 600, fontSize: '1rem',
                padding: '1rem 2.25rem', borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)', textDecoration: 'none',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              Browse First
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
