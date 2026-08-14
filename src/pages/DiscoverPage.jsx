import { useState, useMemo } from 'react';
import useTMDB from '../hooks/useTMDB';
import usePaginatedTMDB from '../hooks/usePaginatedTMDB';
import {
  discoverMovies,
  discoverTV,
  getAnime,
  getMovieGenres,
  getTVGenres,
} from '../services/tmdb';
import MovieCard from '../components/movie-card/MovieCard';

const MEDIA_TABS = [
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'TV Shows' },
  { id: 'anime', label: 'Anime' },
];

const SORTS = {
  movie: [
    { id: 'popularity.desc', label: 'Most Popular' },
    { id: 'vote_average.desc', label: 'Top Rated' },
    { id: 'primary_release_date.desc', label: 'Newest' },
    { id: 'revenue.desc', label: 'Biggest Grossing' },
  ],
  tv: [
    { id: 'popularity.desc', label: 'Most Popular' },
    { id: 'vote_average.desc', label: 'Top Rated' },
    { id: 'first_air_date.desc', label: 'Newest' },
    { id: 'vote_count.desc', label: 'Most Voted' },
  ],
  anime: [
    { id: 'popularity.desc', label: 'Most Popular' },
    { id: 'vote_average.desc', label: 'Top Rated' },
    { id: 'first_air_date.desc', label: 'Newest' },
  ],
};

export default function DiscoverPage() {
  const [mediaTab, setMediaTab] = useState('movie');
  const [genreId, setGenreId] = useState(null);
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const { data: movieGenres } = useTMDB(getMovieGenres, []);
  const { data: tvGenres } = useTMDB(getTVGenres, []);

  const genres = mediaTab === 'movie' ? (movieGenres || []) : (tvGenres || []);

  const fetchPage = useMemo(() => {
    if (mediaTab === 'anime') {
      return (page) => getAnime(page);
    }
    if (mediaTab === 'tv') {
      return (page) => discoverTV({
        genreId,
        year: year ? Number(year) : null,
        sortBy,
        minRating: minRating ? Number(minRating) : null,
        page,
      });
    }
    return (page) => discoverMovies({
      genreId,
      year: year ? Number(year) : null,
      sortBy,
      minRating: minRating ? Number(minRating) : null,
      page,
    });
  }, [mediaTab, genreId, year, sortBy, minRating]);

  const { items, loading, loadingMore, error, hasMore, loadMore, retry } =
    usePaginatedTMDB(fetchPage, [mediaTab, genreId, year, sortBy, minRating]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-hero page-title"><span className="gradient-text">Discover</span></h1>
        <p className="page-subtitle">Filter movies, TV shows, and anime with powerful TMDB discovery.</p>
      </div>

      <div className="tab-bar">
        {MEDIA_TABS.map(t => (
          <button key={t.id} type="button" className={`tab-btn ${mediaTab === t.id ? 'active' : ''}`}
            onClick={() => { setMediaTab(t.id); setGenreId(null); setSortBy('popularity.desc'); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        {mediaTab !== 'anime' && genres.length > 0 && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Genre
            <select value={genreId || ''} onChange={e => setGenreId(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }}>
              <option value="">All genres</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}
        {mediaTab !== 'anime' && (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Year
              <input type="number" min="1900" max="2030" placeholder="e.g. 2024" value={year}
                onChange={e => setYear(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '999px', width: '120px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Min rating
              <input type="number" min="0" max="10" step="0.5" placeholder="7" value={minRating}
                onChange={e => setMinRating(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '999px', width: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }} />
            </label>
          </>
        )}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Sort
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }}>
            {(SORTS[mediaTab] || SORTS.movie).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {error && (
        <div className="row-error-state" style={{ marginBottom: '1.5rem' }}>
          <p>{error}</p>
          <button type="button" className="btn-ghost" onClick={retry}>Retry</button>
        </div>
      )}

      <div className="media-grid">
        {loading
          ? [...Array(20)].map((_, i) => (
              <div key={i} className="movie-card movie-card--md"><div className="card-poster skeleton" /></div>
            ))
          : items.length === 0 && !error
            ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '3rem' }}>🔎</span>
                <h3>No titles match your filters</h3>
              </div>
            )
            : items.map(m => <MovieCard key={`${m.mediaType}-${m.id}`} movie={m} />)
        }
      </div>

      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button type="button" className="btn-ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
