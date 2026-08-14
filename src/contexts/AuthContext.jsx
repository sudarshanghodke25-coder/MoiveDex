import { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserProfileIfMissing } from "../services/userProfile";
import { getGoogleAvatarUrl } from "../utils/userAvatar";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function applyDefaultGoogleAvatar(user) {
    if (!user || user.photoURL) return user;

    const googleAvatarUrl = getGoogleAvatarUrl(user);
    if (!googleAvatarUrl) return user;

    try {
      await updateProfile(user, { photoURL: googleAvatarUrl });
      return { ...user, photoURL: googleAvatarUrl };
    } catch (err) {
      console.warn("[auth] Could not apply Google avatar:", err);
      return user;
    }
  }

  // Email/Password — set currentUser synchronously so ProtectedRoute
  // doesn't bounce the user back to /login before onAuthStateChanged fires.
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password).then((cred) => {
      setCurrentUser(cred.user);
      return cred;
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password).then((cred) => {
      setCurrentUser(cred.user);
      return cred;
    });
  }

  // Google
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then(async (cred) => {
      const user = await applyDefaultGoogleAvatar(cred.user);
      await createUserProfileIfMissing(user);
      setCurrentUser(user);
      return { ...cred, user };
    });
  }

  // Session
  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }
  
  function verifyEmail() {
    return sendEmailVerification(auth.currentUser);
  }

  function updateProfileInfo(displayName, photoURL) {
    if (!auth.currentUser) return Promise.reject(new Error("No active user"));
    return updateProfile(auth.currentUser, {
      displayName: displayName ?? auth.currentUser.displayName,
      photoURL: photoURL ?? auth.currentUser.photoURL,
    }).then(() => {
      // Force update local state
      setCurrentUser({ ...auth.currentUser });
    });
  }

  function updateUserPassword(newPassword) {
    if (!auth.currentUser) return Promise.reject(new Error("No active user"));
    return updatePassword(auth.currentUser, newPassword);
  }

  function deleteAccount() {
    if (!auth.currentUser) return Promise.reject(new Error("No active user"));
    return deleteUser(auth.currentUser);
  }

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setCurrentUser(null);
          setLoading(false);
        }
        return;
      }

      const userWithAvatar = await applyDefaultGoogleAvatar(user);
      if (!active) return;

      setCurrentUser(userWithAvatar);
      if (user) {
        createUserProfileIfMissing(userWithAvatar);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    verifyEmail,
    loginWithGoogle,
    updateProfileInfo,
    updateUserPassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
