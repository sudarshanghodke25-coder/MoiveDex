import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthLayout from '../components/layout/AuthLayout';

// Route-level code splitting — keeps the initial bundle lean by loading
// heavy pages (LandingPage pulls in three.js) only when actually visited.
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const Home = lazy(() => import('../pages/Home'));
const MoviesPage = lazy(() => import('../pages/MoviesPage'));
const TVPage = lazy(() => import('../pages/TVPage'));
const AnimePage = lazy(() => import('../pages/AnimePage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const DetailPage = lazy(() => import('../pages/DetailPage'));
const MyListPage = lazy(() => import('../pages/MyListPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

/**
 * AppRouter — full application routes.
 */
export default function AppRouter() {
  const location = useLocation();
  const showPublicNavbar = location.pathname === '/';

  return (
    <>
      {showPublicNavbar && <Navbar />}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />

          {/* Protected Authenticated Routes */}
          <Route element={<ProtectedRoute><AuthLayout /></ProtectedRoute>}>
            <Route path="/home"        element={<Home />} />
            <Route path="/movies"      element={<MoviesPage />} />
            <Route path="/tv"          element={<TVPage />} />
            <Route path="/anime"       element={<AnimePage />} />
            <Route path="/search"      element={<SearchPage />} />
            <Route path="/movie/:id"   element={<DetailPage mediaType="movie" />} />
            <Route path="/tv/:id"      element={<DetailPage mediaType="tv" />} />
            <Route path="/anime/:id"   element={<DetailPage mediaType="anime" />} />
            <Route path="/mylist"      element={<MyListPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="/trending"    element={<ComingSoon page="Trending" desc="See what's trending globally right now." emoji="🔥" />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<ComingSoon page="Page Not Found" desc="Looks like this page doesn't exist." emoji="🎬" />} />
        </Routes>
      </Suspense>
    </>
  );
}

/** Minimal branded loading state while a route chunk loads. */
function RouteFallback() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--bg-deepspace)',
    }}>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--brand-gradient)',
          boxShadow: 'var(--glow-primary)',
          animation: 'routePulse 1.2s ease-in-out infinite',
        }}
      />
      <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        MovieDex
      </span>
      <style>{`
        @keyframes routePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(0.82); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function ComingSoon({ page, desc = 'This section is being built. Check back soon!', emoji = '🚀' }) {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '4rem 2rem',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '4rem' }}>{emoji}</span>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-secondary)' }}>
        Coming Soon
      </span>
      <h1 className="text-hero">{page}</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}>{desc}</p>
    </div>
  );
}
