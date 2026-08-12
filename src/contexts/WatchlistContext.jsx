import { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

const STORAGE_KEY = 'moviedex_watchlist';

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load watchlist from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const isInWatchlist = (id, mediaType = 'movie') => {
    if (!id) return false;
    return watchlist.some(item => String(item.id) === String(id) && (item.mediaType || 'movie') === (mediaType || 'movie'));
  };

  const addToWatchlist = (item) => {
    if (!item || !item.id) return;
    const mediaType = item.mediaType || 'movie';
    if (isInWatchlist(item.id, mediaType)) return;

    // Normalised stored item
    const newItem = {
      id: item.id,
      title: item.title || item.name || 'Untitled',
      posterPath: item.posterPath || item.poster_path || null,
      backdropPath: item.backdropPath || item.backdrop_path || null,
      rating: item.rating ?? item.vote_average ?? null,
      releaseDate: item.releaseDate || item.release_date || item.first_air_date || null,
      mediaType: mediaType,
      overview: item.overview || '',
      genreNames: item.genreNames || [],
      addedAt: new Date().toISOString(),
    };

    setWatchlist(prev => [newItem, ...prev]);
  };

  const removeFromWatchlist = (id, mediaType = 'movie') => {
    if (!id) return;
    setWatchlist(prev =>
      prev.filter(item => !(String(item.id) === String(id) && (item.mediaType || 'movie') === (mediaType || 'movie')))
    );
  };

  const toggleWatchlist = (item) => {
    if (!item || !item.id) return;
    const mediaType = item.mediaType || 'movie';
    if (isInWatchlist(item.id, mediaType)) {
      removeFromWatchlist(item.id, mediaType);
      return false; // removed
    } else {
      addToWatchlist(item);
      return true; // added
    }
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    clearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}
