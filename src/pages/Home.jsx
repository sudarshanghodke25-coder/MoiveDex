import useTMDB from '../hooks/useTMDB';
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTV,
  getAnime,
  getNowPlaying,
} from '../services/tmdb';
import HeroBanner from '../components/hero/HeroBanner';
import ScrollRow from '../components/common/ScrollRow';

export default function Home() {
  const { data: trending,     loading: trendLoading }    = useTMDB(getTrending, []);
  const { data: popularMovies, loading: popMovLoading }  = useTMDB(() => getPopularMovies().then(r => r.results), []);
  const { data: topRated,      loading: topLoading }     = useTMDB(() => getTopRatedMovies().then(r => r.results), []);
  const { data: popularTV,     loading: tvLoading }      = useTMDB(() => getPopularTV().then(r => r.results), []);
  const { data: anime,         loading: animeLoading }   = useTMDB(() => getAnime().then(r => r.results), []);
  const { data: nowPlaying,    loading: nowLoading }     = useTMDB(() => getNowPlaying().then(r => r.results), []);

  return (
    <div className="page-home">
      {/* Hero Banner — trending content */}
      <HeroBanner items={trending} loading={trendLoading} />

      <div className="page-sections">
        <ScrollRow title="Now Playing in Cinemas" items={nowPlaying}   loading={nowLoading} />
        <ScrollRow title="Trending This Week"     items={trending}     loading={trendLoading} />
        <ScrollRow title="Popular Movies"         items={popularMovies} loading={popMovLoading} />
        <ScrollRow title="Top Rated Movies"       items={topRated}     loading={topLoading} />
        <ScrollRow title="Popular TV Shows"       items={popularTV}    loading={tvLoading} />
        <ScrollRow title="Anime"                  items={anime}        loading={animeLoading} />
      </div>
    </div>
  );
}
