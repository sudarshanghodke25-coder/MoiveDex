import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import logoImg from '../../assets/MovieDex.jpg';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Movies',   to: '/movies' },
  { label: 'TV Shows', to: '/tv' },
  { label: 'Anime',    to: '/anime' },
  { label: 'Trending', to: '/trending' },
];

export default function Navbar() {
  const navRef   = useRef(null);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

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
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: scrolled ? 'rgba(5,5,16,0.95)' : 'linear-gradient(to bottom, rgba(5,5,16,0.8) 0%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(1.5rem, 5vw, 4rem)',
          height: '5.5rem',
          maxWidth: '1600px', margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="MovieDex home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0, textDecoration: 'none' }}
        >
          <img
            src={logoImg}
            alt="MovieDex logo"
            style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 0 15px rgba(168,85,247,0.4)' }}
          />
          <span style={{
            fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em',
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            MovieDex
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul
          role="list"
          style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', listStyle: 'none', margin: 0, padding: 0 }}
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
                    padding: '0.5rem 0',
                    fontSize: '0.95rem', fontWeight: 500,
                    color: active ? '#f8fafc' : 'rgba(148,163,184,0.85)',
                    background: 'transparent',
                    borderBottom: active ? '2px solid var(--brand-secondary)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    display: 'block', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderBottom = '2px solid rgba(255,255,255,0.5)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; e.currentTarget.style.borderBottom = '2px solid transparent'; }}}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Search */}
          <button
            aria-label="Open search"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.5rem', height: '2.5rem',
              color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
              background: 'transparent', border: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Auth Actions */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="nav-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-glass)',
                color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                padding: '0.65rem 1.75rem', borderRadius: '999px',
                transition: 'all 0.25s ease', cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
            >
              Log Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-login"
                style={{
                  fontSize: '0.95rem', fontWeight: 600,
                  color: '#f8fafc', textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="nav-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: '#a855f7',
                  color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                  padding: '0.65rem 1.75rem', borderRadius: '999px',
                  transition: 'all 0.25s ease', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(168,85,247,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Get Started
              </Link>
            </>
          )}

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
            {currentUser ? (
              <button 
                onClick={handleLogout} 
                style={{ 
                  padding: '0.9rem', textAlign: 'center', borderRadius: '10px', fontWeight: 700, 
                  background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', 
                  cursor: 'pointer', width: '100%', fontSize: '1rem' 
                }}
              >
                Log Out
              </button>
            ) : (
              <>
                <Link to="/login" style={{ padding: '0.875rem 1rem', textAlign: 'center', color: 'rgba(148,163,184,0.85)', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '0.9rem', textAlign: 'center', borderRadius: '10px', fontWeight: 700,
                    background: 'var(--brand-gradient)', color: '#111', textDecoration: 'none',
                  }}
                >
                  Get Started Free
                </Link>
              </>
            )}
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
