import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gsap from 'gsap';
import logoImg from '../../assets/MovieDex.jpg';

export default function Navbar() {
  const navRef   = useRef(null);
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

  // Scroll: glass background effect
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={navRef}
      role="banner"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: scrolled ? 'rgba(6,6,13,0.92)' : 'linear-gradient(to bottom, rgba(6,6,13,0.85) 0%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <nav
        aria-label="Landing page header"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(1.25rem, 5vw, 4rem)',
          height: '5.25rem',
          maxWidth: '1600px', margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="MovieDex home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0, textDecoration: 'none' }}
        >
          <img
            src={logoImg}
            alt="MovieDex logo"
            style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 0 15px rgba(225,29,72,0.4)' }}
          />
          <span style={{
            fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em',
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            MovieDex
          </span>
        </Link>

        {/* Authentication Buttons ONLY */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {currentUser ? (
            <>
              <Link
                to="/home"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f8fafc', fontWeight: 600, fontSize: '0.92rem',
                  padding: '0.6rem 1.35rem', borderRadius: '999px',
                  transition: 'all 0.25s ease', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'; }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontWeight: 600, fontSize: '0.92rem',
                  padding: '0.6rem 1.35rem', borderRadius: '999px',
                  transition: 'all 0.25s ease', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="landing-nav-login"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(18, 18, 22, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc', fontWeight: 600, fontSize: '0.92rem',
                  padding: '0.6rem 1.35rem', borderRadius: '999px',
                  transition: 'all 0.25s ease', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30, 30, 38, 0.95)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(18, 18, 22, 0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                id="landing-nav-register"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--brand-gradient)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#f8fafc', fontWeight: 700, fontSize: '0.92rem',
                  padding: '0.6rem 1.45rem', borderRadius: '999px',
                  boxShadow: '0 0 20px rgba(225, 29, 72, 0.35)',
                  transition: 'all 0.25s ease', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--brand-gradient)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(225, 29, 72, 0.35)'; }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
