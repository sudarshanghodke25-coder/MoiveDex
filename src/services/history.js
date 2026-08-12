import { doc, setDoc, getDoc, getDocs, collection, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const LOCAL_HISTORY_KEY = 'moviedex_watch_history';

// Helper to access local storage watch history
function getLocalHistory() {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to read local history', e);
    return {};
  }
}

function saveLocalHistory(historyObj) {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(historyObj));
  } catch (e) {
    console.error('Failed to save local history', e);
  }
}

/**
 * Generate unique history document ID.
 * Movies: "movie-12345"
 * TV/Anime: "tv-12345-s1-e4"
 */
export function getContentId(tmdbId, mediaType = 'movie', seasonNumber = 1, episodeNumber = 1) {
  if (mediaType === 'tv' || mediaType === 'anime') {
    return `${mediaType}-${tmdbId}-s${seasonNumber}-e${episodeNumber}`;
  }
  return `${mediaType}-${tmdbId}`;
}

/**
 * Save user watch progress to Firestore (and localStorage fallback).
 * Debounced by caller to prevent excessive network writes.
 */
export async function saveWatchProgress(uid, progressData) {
  const {
    tmdbId,
    mediaType = 'movie',
    seasonNumber = 1,
    episodeNumber = 1,
    title = 'Untitled',
    posterPath = null,
    progressSeconds = 0,
    durationSeconds = 0,
  } = progressData;

  if (!tmdbId) return;

  const contentId = getContentId(tmdbId, mediaType, seasonNumber, episodeNumber);
  const completed = durationSeconds > 0 && (progressSeconds / durationSeconds) >= 0.92;

  const payload = {
    contentId,
    tmdbId,
    mediaType,
    seasonNumber: mediaType === 'movie' ? null : seasonNumber,
    episodeNumber: mediaType === 'movie' ? null : episodeNumber,
    title,
    posterPath,
    progressSeconds: Math.floor(progressSeconds),
    durationSeconds: Math.floor(durationSeconds),
    completed,
    updatedAt: new Date().toISOString(),
  };

  // 1. Always save to LocalStorage for instant UI updates & offline fallback
  const local = getLocalHistory();
  local[contentId] = payload;
  saveLocalHistory(local);

  // 2. Save to Firestore if uid is logged in
  if (uid) {
    try {
      const docRef = doc(db, 'users', uid, 'history', contentId);
      await setDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore progress save fallback to local:', err?.message);
    }
  }
}

/**
 * Get saved progress for a specific item.
 */
export async function getWatchProgress(uid, contentId) {
  // Check local first for speed
  const local = getLocalHistory();
  if (local[contentId]) return local[contentId];

  if (!uid) return null;

  try {
    const docRef = doc(db, 'users', uid, 'history', contentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Firestore progress fetch fallback to local:', err?.message);
  }

  return null;
}

/**
 * Fetch Continue Watching list for a user.
 * Returns array of unfinished items sorted by most recently watched.
 */
export async function getContinueWatchingList(uid) {
  let itemsMap = { ...getLocalHistory() };

  if (uid) {
    try {
      const colRef = collection(db, 'users', uid, 'history');
      const snap = await getDocs(colRef);
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.contentId) {
          itemsMap[data.contentId] = data;
        }
      });
    } catch (err) {
      console.warn('Firestore continue watching fetch fallback to local:', err?.message);
    }
  }

  // Filter out completed items or items with < 5s progress, and sort by updatedAt desc
  const list = Object.values(itemsMap)
    .filter(item => item && !item.completed && item.progressSeconds > 5)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return list;
}

/**
 * Remove an item from Watch History.
 */
export async function removeFromHistory(uid, contentId) {
  const local = getLocalHistory();
  delete local[contentId];
  saveLocalHistory(local);

  if (uid) {
    try {
      const docRef = doc(db, 'users', uid, 'history', contentId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore remove history error:', err?.message);
    }
  }
}
