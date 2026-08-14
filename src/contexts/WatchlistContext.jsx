/**
 * WatchlistContext.jsx
 *
 * Provides My List state to the entire app.
 *
 * DATA SOURCES:
 *  - Authenticated: Firestore users/{uid}/myList (real-time sync)
 *  - Guest / Offline: localStorage 'moviedex_guest_watchlist'
 *
 * Seamless Behaviour:
 *  - Guests can bookmark and save items immediately without logging in.
 *  - When a guest signs in, their local guest watchlist is automatically
 *    migrated & merged into their Firestore account.
 *  - Provides instant toast notifications on add / remove.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  subscribeToMyList,
  addToMyList,
  removeFromMyList,
  clearMyList,
} from '../services/myList';

const GUEST_STORAGE_KEY = 'moviedex_guest_watchlist';

function loadGuestWatchlist() {
  try {
    const data = localStorage.getItem(GUEST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGuestWatchlist(items) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[myList] Failed to save guest watchlist to localStorage:', err);
  }
}

const WatchlistContext = createContext();

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

export function WatchlistProvider({ children }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? null;
  const { showToast } = useToast();

  // The active watchlist items
  const [watchlist, setWatchlist] = useState(() => (uid ? [] : loadGuestWatchlist()));
  // Loading state for initial fetch
  const [loading, setLoading] = useState(Boolean(uid));

  const unsubscribeRef = useRef(null);

  // Sync / Listeners
  useEffect(() => {
    // Teardown previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!uid) {
      // Guest mode: load from localStorage
      setWatchlist(loadGuestWatchlist());
      setLoading(false);
      return;
    }

    // Authenticated mode: migrate any guest items first
    const guestItems = loadGuestWatchlist();
    if (guestItems.length > 0) {
      // Migrate guest items into Firestore in the background
      Promise.all(
        guestItems.map(item => addToMyList(uid, item).catch(() => null))
      ).then(() => {
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY);
        } catch {
          // ignore
        }
      });
    }

    setLoading(true);
    const unsubscribe = subscribeToMyList(uid, (items) => {
      setWatchlist(items);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [uid]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const isInWatchlist = useCallback(
    (id, mediaType = 'movie') => {
      if (!id) return false;
      return watchlist.some(
        (item) =>
          String(item.id) === String(id) &&
          (item.mediaType || 'movie') === (mediaType || 'movie')
      );
    },
    [watchlist]
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addToWatchlist = useCallback(
    async (item) => {
      if (!item?.id) return;
      const mediaType = item.mediaType || 'movie';
      if (isInWatchlist(item.id, mediaType)) return;

      const normalizedItem = {
        id: item.id,
        title: item.title || item.name || 'Untitled',
        posterPath: item.posterPath || item.poster_path || null,
        backdropPath: item.backdropPath || item.backdrop_path || null,
        rating: item.rating ?? item.vote_average ?? null,
        releaseDate: item.releaseDate || item.release_date || item.first_air_date || null,
        mediaType,
        overview: item.overview || '',
        genreNames: item.genreNames || [],
        addedAt: new Date().toISOString(),
      };

      if (!uid) {
        // Guest mode: save locally
        setWatchlist((prev) => {
          const next = [normalizedItem, ...prev.filter(i => !(String(i.id) === String(item.id) && (i.mediaType || 'movie') === mediaType))];
          saveGuestWatchlist(next);
          return next;
        });
        showToast(`Added "${normalizedItem.title}" to My List (saved locally)`, 'success', 3000);
        return;
      }

      try {
        await addToMyList(uid, normalizedItem);
        showToast(`Added "${normalizedItem.title}" to My List`, 'success', 3000);
      } catch (err) {
        console.error('[myList] addToWatchlist error:', err);
        showToast('Could not save to My List. Please try again.', 'error', 3500);
      }
    },
    [uid, isInWatchlist, showToast]
  );

  const removeFromWatchlist = useCallback(
    async (id, mediaType = 'movie') => {
      if (!id) return;

      if (!uid) {
        // Guest mode
        setWatchlist((prev) => {
          const next = prev.filter(
            (i) => !(String(i.id) === String(id) && (i.mediaType || 'movie') === (mediaType || 'movie'))
          );
          saveGuestWatchlist(next);
          return next;
        });
        showToast('Removed from My List', 'info', 2500);
        return;
      }

      try {
        await removeFromMyList(uid, id, mediaType);
        showToast('Removed from My List', 'info', 2500);
      } catch (err) {
        console.error('[myList] removeFromWatchlist error:', err);
        showToast('Could not remove from My List. Please try again.', 'error', 3500);
      }
    },
    [uid, showToast]
  );

  const toggleWatchlist = useCallback(
    async (item) => {
      if (!item?.id) return false;
      const mediaType = item.mediaType || 'movie';
      if (isInWatchlist(item.id, mediaType)) {
        await removeFromWatchlist(item.id, mediaType);
        return false;
      } else {
        await addToWatchlist(item);
        return true;
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  const clearWatchlist = useCallback(async () => {
    if (!uid) {
      setWatchlist([]);
      saveGuestWatchlist([]);
      showToast('Cleared your My List', 'info', 2500);
      return;
    }

    try {
      await clearMyList(uid);
      showToast('Cleared your My List', 'info', 2500);
    } catch (err) {
      console.error('[myList] clearWatchlist error:', err);
      showToast('Could not clear My List. Please try again.', 'error', 3500);
    }
  }, [uid, showToast]);

  const value = {
    watchlist,
    loading,
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

