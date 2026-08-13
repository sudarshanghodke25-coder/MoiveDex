import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../components/hero/HeroSection';
import MovieRow from '../components/movie-card/MovieRow';
import Footer from '../components/common/Footer';
import useTMDB from '../hooks/useTMDB';
import { getTrending, getPopularMovies, getPopularTV, getAnime, discoverMoviesByGenre } from '../services/tmdb';
import CinematicBackground from '../components/common/CinematicBackground';
import Loader from '../components/common/Loader';

gsap.registerPlugin(ScrollTrigger);

const GENRE_PILLS = [
  { label: 'Action',      emoji: '💥', id: 28 },
  { label: 'Drama',       emoji: '🎭', id: 18 },
  { label: 'Sci-Fi',      emoji: '🚀', id: 878 },
  { label: 'Thriller',    emoji: '🔪', id: 53 },
  { label: 'Comedy',      emoji: '😂', id: 35 },
  { label: 'Horror',      emoji: '👻', id: 27 },
  { label: 'Romance',     emoji: '💕', id: 10749 },
  { label: 'Animation',   emoji: '✨', id: 16 },
  { label: 'Fantasy',     emoji: '🧙', id: 14 },
  { label: 'Documentary', emoji: '🎥', id: 99 },
];

const FEATURES = [
  {
    emoji: '🎬',
    title: 'Always Up-to-Date',
    desc: 'Powered by TMDB for real-time ratings, cast info, trailers and more.',
    color: 'var(--brand-primary)',
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
  {
    emoji: '📱',
    title: 'Cross-Platform',
    desc: 'Seamlessly synced across all your devices. Watch anywhere, anytime.',
    color: '#3b82f6',
  },
  {
    emoji: '✨',
    title: 'Premium UI',
    desc: 'Cinematic, distraction-free interface designed specifically for movie lovers.',
    color: 'var(--brand-secondary)',
  }
];

export default function LandingPage() {
  const featuresRef  = useRef(null);
  const ctaRef       = useRef(null);
  const genreRef     = useRef(null);
  const [activeGenre, setActiveGenre] = useState(GENRE_PILLS[0]);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // ── Live TMDB data ──────────────────────────────────────────────
  const trending = useTMDB(getTrending,        []);
  const movies   = useTMDB(getPopularMovies,   []);
  const tv       = useTMDB(getPopularTV,       []);
  const anime    = useTMDB(getAnime,           []);
  
  const genreFetcher = useCallback(() => discoverMoviesByGenre(activeGenre.id).then(r => r.results), [activeGenre.id]);
  const genreMovies = useTMDB(genreFetcher, [activeGenre.id]);

  // ── Scroll animations ───────────────────────────────────────────
  useEffect(() => {
    if (!loadingComplete) return;

    const ctx = gsap.context(() => {
      // Animate Section Headings
      gsap.utils.toArray('.section-header').forEach(header => {
        gsap.fromTo(header, 
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play reverse play reverse' }
          }
        );
      });

      // Features cards stagger
      gsap.fromTo('.feature-card', 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
        }
      );

      // Genre pills stagger
      gsap.fromTo('.genre-pill', 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.8)',
          scrollTrigger: { trigger: genreRef.current, start: 'top 88%', toggleActions: 'play reverse play reverse' }
        }
      );

      // CTA section content
      gsap.fromTo(ctaRef.current.children, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 82%', toggleActions: 'play reverse play reverse' }
        }
      );
    });

    return () => ctx.revert();
  }, [loadingComplete]);

  return (
    <>
      {!loadingComplete && <Loader onComplete={() => setLoadingComplete(true)} />}
      
      <main id="main-content" style={{ minHeight: '100dvh', position: 'relative', opacity: loadingComplete ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        
        {/* Full Page Background */}
        <CinematicBackground />

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 1 }}>
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
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '0.3rem', height: '1.5rem', borderRadius: '2px', background: 'linear-gradient(to bottom, #f59e0b, #ef4444)', flexShrink: 0 }} />
              <h2 id="genres-heading" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', fontWeight: 800, color: '#f8fafc' }}>
                Browse by Genre
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }} role="list" aria-label="Genre filters">
              {GENRE_PILLS.map((genre) => {
                const isSelected = activeGenre.id === genre.id;
                return (
                  <button
                    key={genre.label}
                    role="listitem"
                    aria-pressed={isSelected}
                    className="genre-pill"
                    onClick={() => setActiveGenre(genre)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 1.1rem', borderRadius: '999px',
                      fontSize: '0.85rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      background: isSelected
                        ? 'var(--brand-gradient)'
                        : 'rgba(18, 18, 22, 0.85)',
                      color: isSelected ? '#f8fafc' : 'rgba(148,163,184,0.85)',
                      border: isSelected ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.4)' : 'none',
                      outline: 'none',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(30, 30, 38, 0.9)'; e.currentTarget.style.color = '#f8fafc'; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(18, 18, 22, 0.75)'; e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; } }}
                  >
                    <span>{genre.emoji}</span>
                    {genre.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Dynamic Genre Row ────────────────────────────────────── */}
          <MovieRow
            title={`${activeGenre.emoji} Top ${activeGenre.label} Movies`}
            items={genreMovies.data}
            loading={genreMovies.loading}
            error={genreMovies.error}
            viewAllTo="/movies"
          />

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
              background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
              marginTop: '1rem',
            }}
          >
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div className="section-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', marginBottom: '4rem' }}>
                <div style={{ flex: '1 1 400px', textAlign: 'left' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px', padding: '0.35rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Why MovieDex</span>
                  </div>
                  <h2 id="features-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Everything you need to <br/>
                    <span style={{                    background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block', paddingBottom: '0.2em' }}>
                      discover more
                    </span>
                  </h2>
                </div>
                <p style={{ flex: '1 1 300px', color: 'rgba(148,163,184,0.85)', fontSize: '1.1rem', lineHeight: 1.7, textAlign: 'left', margin: 0 }}>
                  Designed specifically for cinema lovers. An elegant, fast, and feature-rich 
                  platform that redefines how you track your favorite content.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                {FEATURES.map(({ emoji, title, desc, color }) => (
                  <article
                    key={title}
                    className="feature-card"
                    style={{
                      padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1.5rem, 4vw, 2rem)',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '20px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'default',
                      backdropFilter: 'blur(12px)',
                      display: 'flex',
                      gap: 'clamp(1rem, 3vw, 1.5rem)',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = `${color}44`;
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${color}22`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div style={{
                      width: '3.5rem', height: '3.5rem', borderRadius: '14px',
                      background: `${color}18`, border: `1px solid ${color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.75rem', flexShrink: 0,
                    }}>
                      {emoji}
                    </div>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.5rem', wordWrap: 'break-word' }}>{title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.65, wordWrap: 'break-word' }}>{desc}</p>
                    </div>
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
              padding: 'clamp(5rem, 15vh, 8rem) clamp(1rem, 5vw, 4rem)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Glowing background */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `
                radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 70%),
                radial-gradient(ellipse 40% 60% at 80% 30%, rgba(0,0,0,0.4) 0%, transparent 60%)
              `,
            }} />
            {/* Animated hairline accent */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: '0 10%', top: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🍿</div>
              <h2 id="cta-heading" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.1 }}>
                Ready to explore?
              </h2>
              <p style={{ color: 'rgba(148,163,184,0.85)', marginBottom: '3rem', lineHeight: 1.7, fontSize: '1.15rem' }}>
                Join MovieDex for free. Build your watchlist, find hidden gems, and
                never run out of something great to watch.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/register"
                  id="cta-banner-signup"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--brand-gradient)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#f8fafc', fontWeight: 700, fontSize: '1rem',
                    padding: '1.1rem 2.5rem', borderRadius: '999px',
                    boxShadow: '0 0 30px rgba(225,29,72,0.35)', textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(245,158,11,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--brand-gradient)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(225,29,72,0.35)'; }}
                >
                  🚀 Create Free Account
                </Link>
                <Link
                  to="/movies"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: 'rgba(18, 18, 22, 0.85)', color: '#f8fafc',
                    fontWeight: 600, fontSize: '1rem',
                    padding: '1.1rem 2.5rem', borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)', textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 30, 38, 0.95)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(18, 18, 22, 0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                  Browse First
                </Link>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </main>
    </>
  );
}
