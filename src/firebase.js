import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- 1. FIREBASE CONFIGURATION (Using the user's provided config) ---
const firebaseConfig = {
  apiKey: "AIzaSyDE-qC4g0Bp7th-sLRVFpFmSOImI-1uD7k",
  authDomain: "haltt-55aff.firebaseapp.com",
  projectId: "haltt-55aff",
  storageBucket: "haltt-55aff.firebasestorage.app",
  messagingSenderId: "1044909002503",
  appId: "1:1044909002503:web:4979061edd3c0afc907fa2",
  measurementId: "G-ZDR2V10Y0N"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app); // <-- EXPORTABLE AUTH INSTANCE
const googleProvider = new GoogleAuthProvider(); // <-- EXPORTABLE PROVIDER INSTANCE

// Configure Google provider to request profile information
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
const db = getFirestore(app);

// --- 2. AUTH STATE HOOK (Replacement for react-firebase-hooks) ---
// Custom hook to manage the global auth state, replacing 'useAuthState' for simplicity
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
};

// Export the auth instance, provider, hook, and auth functions for use in other components
export { auth, googleProvider, useAuth, signInWithPopup, signOut, db };

