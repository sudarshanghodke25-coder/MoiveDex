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

/**
 * Seed initial real-world notifications for a user if their notification list is empty.
 * Uses TMDB content IDs so clicking them opens real titles (e.g. Attack on Titan, Dune, etc.)
 */
export async function seedInitialNotifications(uid) {
  if (!uid) return;
  try {
    const colRef = collection(db, 'users', uid, 'notifications');
    const snap = await getDocs(colRef);
    if (!snap.empty) return; // User already has notifications

    const initialNotifications = [
      {
        id: 'notif-aot-s4',
        type: 'new_anime',
        title: '⚡ Attack on Titan: Final Season',
        message: 'All episodes are now available to stream in Full HD.',
        imageUrl: 'https://image.tmdb.org/t/p/w300/hE1Z0y1L4p33rY2P2bH0l3u9X1A.jpg',
        contentId: 1429,
        contentType: 'anime',
        route: '/anime/1429',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
      },
      {
        id: 'notif-dune-2',
        type: 'new_movie',
        title: '🎬 Dune: Part Two Added',
        message: 'The epic saga continues. Stream now in 4K HDR.',
        imageUrl: 'https://image.tmdb.org/t/p/w300/1pdfLPoLStVJ2L8mKooVRyCmgCh.jpg',
        contentId: 693134,
        contentType: 'movie',
        route: '/movie/693134',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
      },
      {
        id: 'notif-apothecary',
        type: 'upcoming_tv',
        title: '⏰ The Apothecary Diaries',
        message: 'New episodes upcoming next week on MovieHub.',
        imageUrl: 'https://image.tmdb.org/t/p/w300/o70zMevf3Z9775R77wR9cQ.jpg',
        contentId: 218230,
        contentType: 'tv',
        route: '/tv/218230',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];

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
