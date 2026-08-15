import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
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
const PersonPage = lazy(() => import('../pages/PersonPage'));
const MyListPage = lazy(() => import('../pages/MyListPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const TrendingPage = lazy(() => import('../pages/TrendingPage'));
const GenresPage = lazy(() => import('../pages/GenresPage'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage'));
const CollectionPage = lazy(() => import('../pages/CollectionPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const HowItWorksPage = lazy(() => import('../pages/HowItWorksPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const FeedbackPage = lazy(() => import('../pages/FeedbackPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('../pages/TermsOfUsePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

/**
 * AppRouter — full application routes.
 */
export default function AppRouter() {
  return (
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
            <Route path="/person/:id"  element={<PersonPage />} />
            <Route path="/mylist"      element={<MyListPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="/trending"    element={<TrendingPage />} />
            <Route path="/genres"      element={<GenresPage />} />
            <Route path="/discover"    element={<DiscoverPage />} />
            <Route path="/collection/:id" element={<CollectionPage />} />

            {/* Informational / Legal Pages */}
            <Route path="/about"        element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact"      element={<ContactPage />} />
            <Route path="/feedback"     element={<FeedbackPage />} />
            <Route path="/privacy"      element={<PrivacyPolicyPage />} />
            <Route path="/terms"        element={<TermsOfUsePage />} />
          </Route>

          {/* Public 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
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

