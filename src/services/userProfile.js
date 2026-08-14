import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getDefaultAvatarUrl } from '../utils/userAvatar';

/**
 * Fetch Firestore user profile for a given uid.
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error('[userProfile] Failed to fetch profile:', err);
  }
  return null;
}

/**
 * Update user profile in Firestore.
 */
export async function updateUserProfile(uid, profileData) {
  if (!uid) return;
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(
      docRef,
      {
        ...profileData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[userProfile] Failed to update profile:', err);
    throw err;
  }
}

/**
 * Ensure user document exists upon login/registration.
 */
export async function createUserProfileIfMissing(user) {
  if (!user?.uid) return;
  try {
    const docRef = doc(db, 'users', user.uid);
    const snap = await getDoc(docRef);
    const defaultPhotoURL = getDefaultAvatarUrl(user) || null;

    if (!snap.exists()) {
      const defaultProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'MovieDex Member',
        email: user.email,
        photoURL: defaultPhotoURL,
        emailVerified: user.emailVerified || false,
        preferredLanguage: 'en',
        preferredSubtitleLanguage: 'en',
        autoplay: true,
        notificationsEnabled: true,
        newContentNotifications: true,
        upcomingNotifications: true,
        newEpisodesNotifications: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, defaultProfile);
      return;
    }

    const profile = snap.data();
    if (!profile.photoURL && defaultPhotoURL) {
      await setDoc(
        docRef,
        {
          photoURL: defaultPhotoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('[userProfile] Failed to initialize profile:', err);
  }
}
