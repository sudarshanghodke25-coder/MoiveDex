/**
 * pages/Home.jsx  —  Phase 4
 *
 * Strategy:
 *   - All 6 sections fetch in parallel (no waterfall)
 *   - Each ScrollRow wrapped in its own ErrorBoundary → one failing row
 *     never breaks the entire page
 *   - useTMDB hooks pass AbortSignal for cleanup on unmount
 *   - Hero Banner uses trending data; scrolls use genre-specific endpoints
 */

import useTMDB from '../hooks/useTMDB';
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTV,
  getAnime,
  getNowPlaying,
  getUpcoming,
} from '../services/tmdb';
import HeroBanner   from '../components/hero/HeroBanner';
import ScrollRow    from '../components/common/ScrollRow';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Fetcher wrappers that accept AbortSignal from the hook
const fetchTrending      = s => getTrending('week', s);
const fetchPopularMovies = s => getPopularMovies(1, s).then(r => r.results);
const fetchTopRated      = s => getTopRatedMovies(1, s).then(r => r.results);
const fetchPopularTV     = s => getPopularTV(1, s).then(r => r.results);
const fetchAnime         = s => getAnime(1, s).then(r => r.results);
const fetchNowPlaying    = s => getNowPlaying(1, s).then(r => r.results);
const fetchUpcoming      = s => getUpcoming(1, s).then(r => r.results);

/** Minimal inline error UI for a failed scroll row */
function RowError({ error }) {
  return (
    <div style={{
      padding: '1.5rem',
      margin: '0 2rem',
      background: 'rgba(239,68,68,0.07)',
      border: '1px solid rgba(239,68,68,0.18)',
      borderRadius: '12px',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Failed to load this section. {error}
    </div>
  );
}

export default function Home() {
  // All hooks fire simultaneously — true parallel fetch
  const { data: trending,      loading: l1 } = useTMDB(fetchTrending,      []);
  const { data: nowPlaying,    loading: l2 } = useTMDB(fetchNowPlaying,    []);
  const { data: popularMovies, loading: l3 } = useTMDB(fetchPopularMovies, []);
  const { data: topRated,      loading: l4 } = useTMDB(fetchTopRated,      []);
  const { data: upcoming,      loading: l5 } = useTMDB(fetchUpcoming,      []);
  const { data: popularTV,     loading: l6 } = useTMDB(fetchPopularTV,     []);
  const { data: anime,         loading: l7 } = useTMDB(fetchAnime,         []);

  return (
    <div className="page-home">
      {/* ── Hero Banner ─────────────────────────── */}
      <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
        <HeroBanner items={trending} loading={l1} />
      </ErrorBoundary>

      {/* ── Content Rows ─────────────────────────── */}
      <div className="page-sections">
        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Now Playing in Cinemas" items={nowPlaying}    loading={l2} />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Trending This Week"     items={trending}      loading={l1} />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Popular Movies"         items={popularMovies} loading={l3} />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Top Rated Movies"       items={topRated}      loading={l4} />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Coming Soon"            items={upcoming}      loading={l5} />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Popular TV Shows"       items={popularTV}     loading={l6} />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Anime"                  items={anime}         loading={l7} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
