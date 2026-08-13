import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LINKS = [
  {
    heading: 'Discover',
    links: [
      { label: 'Movies', to: '/movies' },
      { label: 'TV Shows', to: '/tv' },
      { label: 'Anime', to: '/anime' },
      { label: 'Trending', to: '/trending' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign Up', to: '/register' },
      { label: 'Login', to: '/login' },
      { label: 'My List', to: '/mylist' },
      { label: 'Settings', to: '/settings' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About MovieDex', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Use', to: '#' },
      { label: 'Contact', to: '#' },
    ],
  },
];

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-anim', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play reverse play reverse',
        },
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      style={{
        background: 'rgba(10, 10, 26, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: 'clamp(2.5rem, 6vh, 4rem) clamp(1rem, 5vw, 4rem)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top: Logo + links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div className="footer-anim">
            <Link to="/" aria-label="MovieDex home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem', textDecoration: 'none' }}>
              <img
                src="/logo.png"
                alt="MovieDex logo"
                style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              />
              <span style={{
                fontWeight: 900,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #e11d48 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                MovieDex
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.6, maxWidth: '200px' }}>
              Your cinematic gateway to movies, TV shows &amp; anime.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading} className="footer-anim">
              <h3 style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(148,163,184,0.6)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                {heading}
              </h3>
              <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: 0, padding: 0 }}>
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="footer-link"
                      style={{
                        fontSize: '0.875rem',
                        color: 'rgba(148,163,184,0.9)',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-anim" style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

        {/* Bottom bar */}
        <div className="footer-anim" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)' }}>
            © {new Date().getFullYear()} MovieDex.
          </p>
        </div>
      </div>

      <style>{`
        .footer-link {
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }
        .footer-link:hover {
          color: #f8fafc !important;
          transform: translateX(4px);
        }
      `}</style>
    </footer>
  );
}
