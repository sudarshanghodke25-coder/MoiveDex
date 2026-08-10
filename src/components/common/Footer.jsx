import { Link } from 'react-router-dom';

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
      { label: 'Watchlist', to: '/watchlist' },
      { label: 'Favorites', to: '/favorites' },
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
  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--bg-dark)',
        borderTop: '1px solid var(--border-subtle)',
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
          <div>
            <Link to="/" aria-label="MovieDex home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="8" fill="url(#foot-logo-grad)" />
                <path d="M8 9l5 3.5L8 16V9z" fill="white" opacity="0.9" />
                <path d="M13 9l5 3.5-5 3.5V9z" fill="white" opacity="0.6" />
                <rect x="7" y="18" width="14" height="1.5" rx="0.75" fill="white" opacity="0.4" />
                <defs>
                  <linearGradient id="foot-logo-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                MovieDex
              </span>
            </Link>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '200px' }}>
              Your cinematic gateway to movies, TV shows &amp; anime.
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Movie data by{' '}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}
              >
                TMDB
              </a>
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                {heading}
              </h3>
              <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginTop: '1.5rem',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} MovieDex. Built as a learning project.
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
