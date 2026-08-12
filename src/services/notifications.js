import {
  collection,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribe to real-time notification updates for a user.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(uid, callback) {
  if (!uid) {
    callback([]);
    return () => {};
  }

  const colRef = collection(db, 'users', uid, 'notifications');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifications = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notifications.push({
          id: docSnap.id,
          ...data,
          // Format timestamp safely if Firestore Timestamp or string
          createdAtFormatted: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
        });
      });
      callback(notifications);
    },
    (err) => {
      console.warn('[notifications] Realtime listener fallback:', err?.message);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(uid, notificationId) {
  if (!uid || !notificationId) return;
  try {
    const docRef = doc(db, 'users', uid, 'notifications', notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (err) {
    console.error('[notifications] Failed to mark as read:', err);
  }
}

/**
 * Mark all unread notifications as read.
 */
export async function markAllNotificationsAsRead(uid, notifications = []) {
  if (!uid) return;
  try {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      const docRef = doc(db, 'users', uid, 'notifications', n.id);
      batch.update(docRef, { isRead: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('[notifications] Failed to mark all as read:', err);
  }
}

/**
 * Create a new notification for user.
 */
export async function createNotification(uid, notificationData) {
  if (!uid) return;
  try {
    const colRef = collection(db, 'users', uid, 'notifications');
    const newDocRef = doc(colRef);
    await setDoc(newDocRef, {
      id: newDocRef.id,
      type: notificationData.type || 'system',
      title: notificationData.title || 'MovieHub Update',
      message: notificationData.message || '',
      imageUrl: notificationData.imageUrl || null,
      contentId: notificationData.contentId || null,
      contentType: notificationData.contentType || 'movie',
      route: notificationData.route || '/home',
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[notifications] Failed to create notification:', err);
  }
}

import { getTrending, posterUrl } from './tmdb';

/**
 * Seed initial real-world notifications for a user if their notification list is empty.
 * Integrates with TMDB to pull real, live movie/show/anime posters and titles.
 */
export async function seedInitialNotifications(uid) {
  if (!uid) return;
  try {
    const colRef = collection(db, 'users', uid, 'notifications');
    const snap = await getDocs(colRef);
    if (!snap.empty) return; // User already has notifications

    let initialNotifications = [];

    // Attempt to pull live trending items from TMDB
    try {
      const trending = await getTrending('all');
      if (Array.isArray(trending) && trending.length >= 3) {
        const item1 = trending[0];
        const item2 = trending[1];
        const item3 = trending[2];

        initialNotifications = [
          {
            id: `notif-${item1.id}`,
            type: item1.mediaType === 'tv' ? 'new_tv' : item1.mediaType === 'anime' ? 'new_anime' : 'new_movie',
            title: `🎬 New Release: ${item1.title}`,
            message: item1.overview ? item1.overview.slice(0, 100) + '...' : 'Now streaming on MovieHub.',
            imageUrl: posterUrl(item1.posterPath, 'sm') || 'https://image.tmdb.org/t/p/w185/8cdWjvZ2712DGBhKGYmIbA23zE4.jpg',
            contentId: item1.id,
            contentType: item1.mediaType || 'movie',
            route: `/${item1.mediaType || 'movie'}/${item1.id}`,
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
          {
            id: `notif-${item2.id}`,
            type: item2.mediaType === 'tv' ? 'new_tv' : 'new_movie',
            title: `📺 Trending: ${item2.title}`,
            message: item2.overview ? item2.overview.slice(0, 100) + '...' : 'Available now in Full HD.',
            imageUrl: posterUrl(item2.posterPath, 'sm') || 'https://image.tmdb.org/t/p/w185/1pdfLPoLStVJ2L8mKooVRyCmgCh.jpg',
            contentId: item2.id,
            contentType: item2.mediaType || 'tv',
            route: `/${item2.mediaType || 'tv'}/${item2.id}`,
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: `notif-${item3.id}`,
            type: 'upcoming_movie',
            title: `⏰ Coming Soon: ${item3.title}`,
            message: 'Add to your watchlist to receive release alerts.',
            imageUrl: posterUrl(item3.posterPath, 'sm') || 'https://image.tmdb.org/t/p/w185/hE1Z0y1L4p33rY2P2bH0l3u9X1A.jpg',
            contentId: item3.id,
            contentType: item3.mediaType || 'movie',
            route: `/${item3.mediaType || 'movie'}/${item3.id}`,
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          },
        ];
      }
    } catch (e) {
      console.warn('[notifications] Could not fetch live TMDB trending for seed, using curated fallback:', e?.message);
    }

    // Curated fallback if TMDB fetch returned empty
    if (initialNotifications.length === 0) {
      initialNotifications = [
        {
          id: 'notif-aot-s4',
          type: 'new_anime',
          title: '⚡ Attack on Titan: Final Season',
          message: 'All episodes are now available to stream in Full HD.',
          imageUrl: 'https://image.tmdb.org/t/p/w185/hE1Z0y1L4p33rY2P2bH0l3u9X1A.jpg',
          contentId: 1429,
          contentType: 'anime',
          route: '/anime/1429',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: 'notif-dune-2',
          type: 'new_movie',
          title: '🎬 Dune: Part Two Added',
          message: 'The epic saga continues. Stream now in 4K HDR.',
          imageUrl: 'https://image.tmdb.org/t/p/w185/1pdfLPoLStVJ2L8mKooVRyCmgCh.jpg',
          contentId: 693134,
          contentType: 'movie',
          route: '/movie/693134',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
        {
          id: 'notif-apothecary',
          type: 'upcoming_tv',
          title: '⏰ The Apothecary Diaries',
          message: 'New episodes upcoming next week on MovieHub.',
          imageUrl: 'https://image.tmdb.org/t/p/w185/o70zMevf3Z9775R77wR9cQ.jpg',
          contentId: 218230,
          contentType: 'tv',
          route: '/tv/218230',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ];
    }

    for (const notif of initialNotifications) {
      const docRef = doc(db, 'users', uid, 'notifications', notif.id);
      await setDoc(docRef, {
        ...notif,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('[notifications] Failed to seed initial notifications:', err?.message);
  }
}
