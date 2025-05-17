import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Optional: Add measurementId only if you use Firebase Analytics
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Admin email constant
const ADMIN_EMAIL = "anishseth0510@gmail.com";

// Helper function to check if current user is admin
const isAdmin = () => {
  const user = auth.currentUser;
  return user && user.email === ADMIN_EMAIL;
};

// Timestamp utility
const timestamp = serverTimestamp();

// Google auth provider for authentication
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, timestamp, isAdmin, ADMIN_EMAIL };
