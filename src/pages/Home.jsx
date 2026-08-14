/**
 * pages/Home.jsx
 *
 * All content rows fetch in parallel. Each ScrollRow handles its own
 * loading, empty, and error states with retry support.
 */

import useTMDB from '../hooks/useTMDB';
import {
  getTrending,
  getTrendingToday,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTV,
  getAnime,
  getNowPlaying,
  getUpcoming,
} from '../services/tmdb';
import HeroBanner from '../components/hero/HeroBanner';
import ScrollRow from '../components/common/ScrollRow';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ContinueWatchingRow from '../components/home/ContinueWatchingRow';

const fetchTrendingHero  = () => getTrending('week');
const fetchTrendingToday = () => getTrendingToday();
const fetchPopularMovies = () => getPopularMovies(1).then(r => r.results);
const fetchTopRated      = () => getTopRatedMovies(1).then(r => r.results);
const fetchPopularTV     = () => getPopularTV(1).then(r => r.results);
const fetchAnime         = () => getAnime(1).then(r => r.results);
const fetchNowPlaying    = () => getNowPlaying(1).then(r => r.results);
const fetchUpcoming      = () => getUpcoming(1).then(r => r.results);

function RowError({ error }) {
  return (
    <div className="row-error-state" style={{ margin: '0 2rem' }}>
      <p>Failed to load this section. {error}</p>
    </div>
  );
}

export default function Home() {
  const hero      = useTMDB(fetchTrendingHero, []);
  const trending  = useTMDB(fetchTrendingToday, []);
  const nowPlaying = useTMDB(fetchNowPlaying, []);
  const popularMovies = useTMDB(fetchPopularMovies, []);
  const topRated  = useTMDB(fetchTopRated, []);
  const upcoming  = useTMDB(fetchUpcoming, []);
  const popularTV = useTMDB(fetchPopularTV, []);
  const anime     = useTMDB(fetchAnime, []);

  return (
    <div className="page-home">
      <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
        <HeroBanner items={hero.data} loading={hero.loading} />
      </ErrorBoundary>

      <div className="page-sections">
        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ContinueWatchingRow />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Now Playing in Cinemas" items={nowPlaying.data} loading={nowPlaying.loading} error={nowPlaying.error} onRetry={nowPlaying.retry} viewAllTo="/movies" />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Trending Today" items={trending.data} loading={trending.loading} error={trending.error} onRetry={trending.retry} viewAllTo="/trending" />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Popular Movies" items={popularMovies.data} loading={popularMovies.loading} error={popularMovies.error} onRetry={popularMovies.retry} viewAllTo="/movies" />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Top Rated Movies" items={topRated.data} loading={topRated.loading} error={topRated.error} onRetry={topRated.retry} viewAllTo="/movies" />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Coming Soon" items={upcoming.data} loading={upcoming.loading} error={upcoming.error} onRetry={upcoming.retry} viewAllTo="/movies" />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Popular TV Shows" items={popularTV.data} loading={popularTV.loading} error={popularTV.error} onRetry={popularTV.retry} viewAllTo="/tv" />
        </ErrorBoundary>

        <ErrorBoundary fallback={e => <RowError error={e?.message} />}>
          <ScrollRow title="Anime" items={anime.data} loading={anime.loading} error={anime.error} onRetry={anime.retry} viewAllTo="/anime" />
        </ErrorBoundary>
      </div>
    </div>
  );
}
