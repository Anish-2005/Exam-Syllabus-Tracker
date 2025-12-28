import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
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
const functions = getFunctions(app);

// Configure emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Admin configuration
const ADMIN_EMAILS = new Set([
  "anishseth0510@gmail.com",
  // Add additional admin emails here
  // "admin2@example.com",
]);

// Helper function to check if current user is admin
const isAdmin = () => {
  const user = auth.currentUser;
  return !!user && !!user.email && ADMIN_EMAILS.has(user.email);
};

// Timestamp utility
const timestamp = serverTimestamp();

// Auth providers
const googleProvider = new GoogleAuthProvider();
// Add other providers as needed
// const facebookProvider = new FacebookAuthProvider();

export { 
  auth, 
  db, 
  functions,
  googleProvider, 
  timestamp, 
  isAdmin, 
  ADMIN_EMAILS,
  app as firebaseApp
};