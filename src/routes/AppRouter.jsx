import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import LandingPage from '../pages/LandingPage';

/**
 * AppRouter — Phase 1 routes only.
 * Phase 2 will add /login, /register, /verify-email, /forgot-password
 * Phase 3 will add /home, /movies, /tv, /anime, /search, /movie/:id, etc.
 */
export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Placeholder routes — prevent 404 on nav links during Phase 1 */}
        <Route path="/movies"   element={<ComingSoon page="Movies" />} />
        <Route path="/tv"       element={<ComingSoon page="TV Shows" />} />
        <Route path="/anime"    element={<ComingSoon page="Anime" />} />
        <Route path="/register" element={<ComingSoon page="Sign Up" />} />
        <Route path="/login"    element={<ComingSoon page="Login" />} />
        <Route path="*"         element={<ComingSoon page="Page Not Found" />} />
      </Routes>
    </>
  );
}

/** Minimal placeholder — replaced by real pages in Phase 2/3 */
function ComingSoon({ page }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-deepspace)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--brand-primary)',
      }}>
        Coming in Phase 2/3
      </span>
      <h1 className="text-hero">{page}</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}>
        This section is being built. Check back soon!
      </p>
      <a href="/" className="btn-primary" style={{ marginTop: '0.5rem' }}>
        ← Back to Home
      </a>
    </div>
  );
}
