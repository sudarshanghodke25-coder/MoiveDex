/**
 * WatchlistContext.jsx
 *
 * Provides My List state to the entire app.
 *
 * DATA SOURCE: Firestore  users/{uid}/myList
 * IDENTITY:   Firebase Auth UID (via AuthContext)
 *
 * Behaviour:
 *  - Subscribes to the current user's Firestore myList collection in real-time.
 *  - Clears local state and unsubscribes when the user logs out (uid → null).
 *  - Exposes the same public API as before so all consumers continue to work
 *    without modification:
 *      watchlist, addToWatchlist, removeFromWatchlist,
 *      isInWatchlist, toggleWatchlist, clearWatchlist, loading
 *
 * ⚠️  localStorage is NOT used for My List. Firestore is the single source of truth.
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
import {
  subscribeToMyList,
  addToMyList,
  removeFromMyList,
  clearMyList,
} from '../services/myList';

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

  // The active watchlist for the current user
  const [watchlist, setWatchlist] = useState([]);
  // True while waiting for the first Firestore snapshot
  const [loading, setLoading] = useState(false);

  // Keep a ref to the active Firestore unsubscribe function so we can
  // tear it down when the user changes or unmounts.
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Unsubscribe any previous listener and clear stale data immediately
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setWatchlist([]);

    if (!uid) {
      // No user — nothing to load
      setLoading(false);
      return;
    }

    // Start loading indicator before first snapshot arrives
    setLoading(true);

    const unsubscribe = subscribeToMyList(uid, (items) => {
      setWatchlist(items);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount or uid change
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
      if (!uid) {
        console.warn('[myList] No authenticated user. Cannot add to My List.');
        return;
      }
      if (!item?.id) return;

      const mediaType = item.mediaType || 'movie';
      if (isInWatchlist(item.id, mediaType)) return; // already in list

      try {
        await addToMyList(uid, item);
        // Optimistic UI is not needed — onSnapshot will update watchlist
      } catch (err) {
        console.error('[myList] addToWatchlist error:', err);
      }
    },
    [uid, isInWatchlist]
  );

  const removeFromWatchlist = useCallback(
    async (id, mediaType = 'movie') => {
      if (!uid || !id) return;
      try {
        await removeFromMyList(uid, id, mediaType);
      } catch (err) {
        console.error('[myList] removeFromWatchlist error:', err);
      }
    },
    [uid]
  );

  const toggleWatchlist = useCallback(
    async (item) => {
      if (!item?.id) return false;
      const mediaType = item.mediaType || 'movie';
      if (isInWatchlist(item.id, mediaType)) {
        await removeFromWatchlist(item.id, mediaType);
        return false; // removed
      } else {
        await addToWatchlist(item);
        return true; // added
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  const clearWatchlist = useCallback(async () => {
    if (!uid) return;
    try {
      await clearMyList(uid);
    } catch (err) {
      console.error('[myList] clearWatchlist error:', err);
    }
  }, [uid]);

  // ── Context Value ──────────────────────────────────────────────────────────

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
