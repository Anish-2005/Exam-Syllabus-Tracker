// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCz8--y866MNsz8u1S_q7BJbGN5HS33ITg",
  authDomain: "exam-syllabus-tracker-851f7.firebaseapp.com",
  projectId: "exam-syllabus-tracker-851f7",
  storageBucket: "exam-syllabus-tracker-851f7.firebasestorage.app",
  messagingSenderId: "316759921811",
  appId: "1:316759921811:web:1a6f4f1737a79b69eda966",
  measurementId: "G-1HXMQZ1M22"
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