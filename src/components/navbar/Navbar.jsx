import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Home',   to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: 'TV',     to: '/tv' },
  { label: 'Anime',  to: '/anime' },
];

export default function Navbar() {
  const navRef   = useRef(null);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, { y: -70, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
    });
    return () => ctx.revert();
  }, []);

  // Scroll: glass bg + auto-hide
  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y > lastY && y > 120) {
        gsap.to(navRef.current, { y: '-100%', duration: 0.32, ease: 'power2.in' });
      } else {
        gsap.to(navRef.current, { y: 0, duration: 0.38, ease: 'power2.out' });
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <header
      ref={navRef}
      role="banner"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        background: scrolled ? 'rgba(5,5,16,0.88)' : 'rgba(5,5,16,0.2)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(4px)',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(4px)',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent',
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(1rem, 5vw, 4rem)',
          height: '4.25rem',
          maxWidth: '1400px', margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="MovieDex home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0, textDecoration: 'none' }}
        >
          <img
            src="/logo.png"
            alt="MovieDex logo"
            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <span style={{
            fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            MovieDex
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul
          role="list"
          style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', listStyle: 'none', margin: 0, padding: 0 }}
          className="nav-desktop"
        >
          {NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.9rem', fontWeight: 500,
                    color: active ? '#f8fafc' : 'rgba(148,163,184,0.85)',
                    background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                    border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    display: 'block', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Search */}
          <button
            aria-label="Open search"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.375rem', height: '2.375rem', borderRadius: '999px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(148,163,184,0.85)', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.color = '#f8fafc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Login link */}
          <Link
            to="/login"
            className="nav-login"
            style={{
              fontSize: '0.875rem', fontWeight: 600,
              color: 'rgba(148,163,184,0.85)', textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; }}
          >
            Sign In
          </Link>

          {/* CTA */}
          <Link
            to="/register"
            className="nav-cta"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              padding: '0.55rem 1.35rem', borderRadius: '999px',
              boxShadow: '0 0 20px rgba(99,102,241,0.3)',
              transition: 'all 0.25s ease', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 35px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'; }}
          >
            Get Started
          </Link>

          {/* Hamburger (mobile) */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            id="mobile-menu-btn"
            className="nav-hamburger"
            onClick={() => setMenuOpen(v => !v)}
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: '2.375rem', height: '2.375rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc', cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          role="navigation"
          aria-label="Mobile menu"
          style={{
            position: 'absolute', top: '4.25rem', left: 0, right: 0,
            background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(99,102,241,0.12)',
            padding: '1rem clamp(1rem, 5vw, 4rem) 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
          }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: '0.875rem 1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 500,
                color: location.pathname === to ? '#f8fafc' : 'rgba(148,163,184,0.85)',
                background: location.pathname === to ? 'rgba(99,102,241,0.12)' : 'transparent',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.75rem', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/login" style={{ padding: '0.875rem 1rem', textAlign: 'center', color: 'rgba(148,163,184,0.85)', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                padding: '0.9rem', textAlign: 'center', borderRadius: '10px', fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', textDecoration: 'none',
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-cta     { display: none !important; }
          .nav-login   { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-desktop   { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
