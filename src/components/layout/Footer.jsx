import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/MovieDex.jpg';

/* ─── Navigation Data ─────────────────────────────────────────────── */
const DISCOVER_LINKS = [
  { label: 'Movies',   to: '/movies' },
  { label: 'TV Shows', to: '/tv' },
  { label: 'Anime',    to: '/anime' },
  { label: 'Trending', to: '/trending' },
  { label: 'Genres',   to: '/genres' },
];

const ABOUT_LINKS = [
  { label: 'About MovieDex', to: '/about' },
  { label: 'How It Works',   to: '/how-it-works' },
  { label: 'Contact',        to: '/contact' },
  { label: 'Feedback',       to: '/feedback' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use',   to: '/terms' },
];

const LOGGED_IN_LINKS = [
  { label: 'Profile',  to: '/profile' },
  { label: 'My List',  to: '/mylist' },
  { label: 'Settings', to: '/settings' },
];

const LOGGED_OUT_LINKS = [
  { label: 'Login',   to: '/login' },
  { label: 'Sign Up', to: '/register' },
];

/* ─── Footer Component ─────────────────────────────────────────────── */
export default function Footer() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  }

  return (
    <footer className="app-footer" aria-label="Site footer">
      <div className="footer-inner">
        {/* ── Column 1: Brand ─── */}
        <section className="footer-brand" aria-label="MovieDex brand">
          <Link to="/home" className="footer-logo-link" aria-label="MovieDex home">
            <img src={logoImg} alt="MovieDex logo" className="footer-logo-img" />
            <span className="footer-logo-text">MovieDex</span>
          </Link>
          <p className="footer-tagline">
            Your cinematic gateway to movies, TV shows, and anime.
          </p>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-tmdb-badge"
            aria-label="TMDB — This product uses the TMDB API but is not endorsed or certified by TMDB"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            Powered by TMDB
          </a>
        </section>

        {/* ── Column 2: Discover ─── */}
        <nav className="footer-col" aria-label="Discover navigation">
          <h3 className="footer-col-title">Discover</h3>
          <ul role="list" className="footer-link-list">
            {DISCOVER_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="footer-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Column 3: Account (auth-aware) ─── */}
        <nav className="footer-col" aria-label="Account navigation">
          <h3 className="footer-col-title">Account</h3>
          <ul role="list" className="footer-link-list">
            {currentUser ? (
              <>
                {LOGGED_IN_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    className="footer-link footer-logout-btn"
                    onClick={handleLogout}
                    aria-label="Log out of MovieDex"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              LOGGED_OUT_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>

        {/* ── Column 4: About ─── */}
        <nav className="footer-col" aria-label="About navigation">
          <h3 className="footer-col-title">About</h3>
          <ul role="list" className="footer-link-list">
            {ABOUT_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="footer-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ── Bottom bar ─── */}
      <div className="footer-bottom" role="contentinfo">
        <span className="footer-copyright">
          © {new Date().getFullYear()} MovieDex. All rights reserved.
        </span>
        <div className="footer-bottom-links">
          <Link to="/privacy" className="footer-bottom-link">
            Privacy Policy
          </Link>
          <span className="footer-bottom-sep" aria-hidden="true">·</span>
          <Link to="/terms" className="footer-bottom-link">
            Terms of Use
          </Link>
          <span className="footer-bottom-sep" aria-hidden="true">·</span>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-bottom-link"
          >
            TMDB
          </a>
        </div>
      </div>
    </footer>
  );
}
