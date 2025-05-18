// context/AuthContext.js
'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Check if user profile exists in Firestore
  const checkUserProfile = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  };

  // Update user profile in Firestore
  const updateUserProfile = async (uid, profileData) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return await checkUserProfile(uid);
  };

  // Create new user profile in Firestore
  const createUserProfile = async (user, name) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name,
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return await checkUserProfile(user.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user has a profile
        const profile = await checkUserProfile(firebaseUser.uid);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });

        if (!profile) {
          setNeedsProfile(true);
        } else {
          setUserProfile(profile);
          setNeedsProfile(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setNeedsProfile(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/password functions
  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setNeedsProfile(true); // New users always need to set profile
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await checkUserProfile(userCredential.user.uid);
      setNeedsProfile(!profile); // Only need profile if it doesn't exist
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Google Sign-In function
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const profile = await checkUserProfile(result.user.uid);
      setNeedsProfile(!profile); // Only need profile if it doesn't exist
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  // Complete profile setup
  const completeProfile = async (name) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Update auth profile
      await updateProfile(auth.currentUser, {
        displayName: name
      });
      
      // Create/update Firestore profile
      const profile = await createUserProfile(auth.currentUser, name);
      
      // Update state
      setUser(prev => ({
        ...prev,
        displayName: name
      }));
      setUserProfile(profile);
      setNeedsProfile(false);
      
      return profile;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      loading, 
      needsProfile,
      signup, 
      login, 
      logout, 
      resetPassword,
      googleSignIn,
      completeProfile,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};