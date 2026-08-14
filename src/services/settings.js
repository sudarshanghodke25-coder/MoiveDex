import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_SETTINGS = {
  preferredLanguage: 'en',
  preferredContentLanguage: 'en',
  preferredSubtitleLanguage: 'en',
  watchProviderRegion: 'IN',
  autoplay: true,
  notificationsEnabled: true,
  newMoviesNotifications: true,
  newTVNotifications: true,
  newAnimeNotifications: true,
  upcomingNotifications: true,
  newEpisodesNotifications: true,
  systemNotifications: true,
};

/**
 * Fetch settings from Firestore users/{uid}
 */
export async function getUserSettings(uid) {
  if (!uid) return DEFAULT_SETTINGS;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return { ...DEFAULT_SETTINGS, ...data };
    }
  } catch (err) {
    console.error('[settings] Failed to fetch settings:', err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Persist user settings updates to Firestore users/{uid}
 */
export async function updateUserSettings(uid, settingsData) {
  if (!uid) return;
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(
      docRef,
      {
        ...settingsData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[settings] Failed to update settings:', err);
    throw err;
  }
}
