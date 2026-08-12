/**
 * services/myList.js
 *
 * Centralized Firestore service for My List operations.
 * All data is scoped to: users/{uid}/myList/{itemId}
 *
 * Only lightweight references are stored — full movie metadata
 * continues to come from TMDB via the existing services.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generate a deterministic Firestore document ID for a list item.
 * Format: "{mediaType}-{tmdbId}"
 */
function getItemDocId(id, mediaType = 'movie') {
  return `${mediaType}-${id}`;
}

/**
 * Subscribe to real-time My List updates for a user.
 * Returns an unsubscribe function.
 *
 * @param {string} uid  Firebase Auth UID
 * @param {Function} callback  Called with array of list items on every change
 * @returns {Function} unsubscribe
 */
export function subscribeToMyList(uid, callback) {
  if (!uid) {
    callback([]);
    return () => {};
  }

  const colRef = collection(db, 'users', uid, 'myList');
  const q = query(colRef, orderBy('addedAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), _docId: docSnap.id });
      });
      callback(items);
    },
    (err) => {
      console.warn('[myList] Realtime listener error:', err?.message);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Add an item to the user's My List in Firestore.
 * Stores a lightweight reference (no full TMDB metadata duplication).
 *
 * @param {string} uid
 * @param {Object} item  Normalised movie/TV item
 */
export async function addToMyList(uid, item) {
  if (!uid || !item?.id) return;

  const mediaType = item.mediaType || 'movie';
  const docId = getItemDocId(item.id, mediaType);
  const docRef = doc(db, 'users', uid, 'myList', docId);

  const payload = {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    posterPath: item.posterPath || item.poster_path || null,
    backdropPath: item.backdropPath || item.backdrop_path || null,
    rating: item.rating ?? item.vote_average ?? null,
    releaseDate: item.releaseDate || item.release_date || item.first_air_date || null,
    mediaType,
    overview: item.overview || '',
    genreNames: item.genreNames || [],
    addedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload, { merge: false });
  } catch (err) {
    console.error('[myList] Failed to add item:', err);
    throw err;
  }
}

/**
 * Remove an item from the user's My List in Firestore.
 *
 * @param {string} uid
 * @param {string|number} id  TMDB content ID
 * @param {string} mediaType
 */
export async function removeFromMyList(uid, id, mediaType = 'movie') {
  if (!uid || !id) return;

  const docId = getItemDocId(id, mediaType);
  const docRef = doc(db, 'users', uid, 'myList', docId);

  try {
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[myList] Failed to remove item:', err);
    throw err;
  }
}

/**
 * Clear ALL items from the user's My List in Firestore.
 *
 * @param {string} uid
 */
export async function clearMyList(uid) {
  if (!uid) return;

  try {
    const colRef = collection(db, 'users', uid, 'myList');
    const snap = await getDocs(colRef);
    const deletes = [];
    snap.forEach((docSnap) => deletes.push(deleteDoc(docSnap.ref)));
    await Promise.all(deletes);
  } catch (err) {
    console.error('[myList] Failed to clear list:', err);
    throw err;
  }
}
