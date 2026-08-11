import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import LandingPage from '../pages/LandingPage';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthLayout from '../components/layout/AuthLayout';

import Home from '../pages/Home';
import MoviesPage from '../pages/MoviesPage';
import TVPage from '../pages/TVPage';
import AnimePage from '../pages/AnimePage';
import SearchPage from '../pages/SearchPage';
import DetailPage from '../pages/DetailPage';

/**
 * AppRouter — Phase 3 full routes.
 */
export default function AppRouter() {
  const location = useLocation();
  const showPublicNavbar = location.pathname === '/';

  return (
    <>
      {showPublicNavbar && <Navbar />}
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
          <Route path="/mylist"      element={<ComingSoon page="My List" desc="Save your favorite movies and shows to watch later." emoji="🔖" />} />
          <Route path="/profile"     element={<ComingSoon page="Profile" desc="Manage your account and viewing preferences." emoji="👤" />} />
          <Route path="/settings"    element={<ComingSoon page="Settings" desc="Customize your MovieDex experience." emoji="⚙️" />} />
          <Route path="/trending"    element={<ComingSoon page="Trending" desc="See what's trending globally right now." emoji="🔥" />} />
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<ComingSoon page="Page Not Found" desc="Looks like this page doesn't exist." emoji="🎬" />} />
      </Routes>
    </>
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
