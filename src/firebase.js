import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- 1. FIREBASE CONFIGURATION (Using the user's provided config) ---
const firebaseConfig = {
  apiKey: "AIzaSyBlXWghjhmmCcyEb2MO8p-gWaQOsg30jss",
  authDomain: "haltt-protocol.firebaseapp.com",
  projectId: "haltt-protocol",
  storageBucket: "haltt-protocol.firebasestorage.app",
  messagingSenderId: "36896481785",
  appId: "1:36896481785:web:50c40b29463390a43add28",
  measurementId: "G-QNYB9ZHYQP"
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

