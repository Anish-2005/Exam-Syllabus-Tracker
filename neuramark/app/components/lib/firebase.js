// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export { auth, db };