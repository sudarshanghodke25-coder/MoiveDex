/**
 * pages/NotFoundPage.jsx
 *
 * Cinematic 404 — rendered for any unmatched route (public, no navbar).
 * Uses the design system tokens so it stays consistent with the app.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFoundPage() {
  const { currentUser } = useAuth();
  usePageTitle('Page Not Found | MovieDex');

  const homeTo = currentUser ? '/home' : '/';
  const secondaryTo = currentUser ? '/movies' : '/register';
  const secondaryLabel = currentUser ? 'Browse Movies' : 'Get Started';

  return (
    <div
      className="page-content"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow — subtle cinematic depth */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(225,29,72,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 80% 90%, rgba(245,158,11,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Film-frame decoration */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: 'min(180px, 60vw)',
          aspectRatio: '16 / 10',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(225,29,72,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        {/* Sprocket holes */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 6,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              left: `calc(${14 + i * 30}%)`,
            }}
          />
        ))}
        {[0, 1, 2].map(i => (
          <div
            key={`b-${i}`}
            style={{
              position: 'absolute',
              bottom: 6,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              left: `calc(${14 + i * 30}%)`,
            }}
          />
        ))}
        <span
          className="text-display"
          style={{
            fontSize: 'clamp(3.5rem, 14vw, 5.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="gradient-text">404</span>
        </span>
      </div>

      <span
        style={{
          position: 'relative',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--brand-secondary)',
          marginBottom: '1rem',
        }}
      >
        Lost in the theatre
      </span>

      <h1 className="text-hero" style={{ marginBottom: '1rem' }}>
        This scene doesn&apos;t exist.
      </h1>

      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '420px',
          lineHeight: 1.7,
          marginBottom: '2.25rem',
        }}
      >
        The page you&apos;re looking for couldn&apos;t be found. It may have been
        moved, or the reel may have skipped. Let&apos;s get you back to the show.
      </p>

      <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={homeTo} className="btn-primary" style={{ textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9" />
            <path d="M3 4v5h5" />
            <path d="M3 12h7" />
          </svg>
          Back to MovieDex
        </Link>
        <Link to={secondaryTo} className="btn-ghost" style={{ textDecoration: 'none' }}>
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
