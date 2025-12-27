// context/AuthContext.tsx
'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, AuthState } from '@/types/auth';

interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType extends AuthState {
  userProfile: UserProfile | null;
  needsProfile: boolean;
  signup: (email: string, password: string) => Promise<FirebaseUser>;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<FirebaseUser>;
  completeProfile: (name: string) => Promise<UserProfile>;
  updateUserProfile: (uid: string, profileData: Partial<UserProfile>) => Promise<UserProfile>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user profile exists in Firestore
  const checkUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }
    return null;
  };

  // Update user profile in Firestore
  const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    const updatedProfile = await checkUserProfile(uid);
    if (!updatedProfile) throw new Error('Failed to update profile');
    return updatedProfile;
  };

  // Create new user profile in Firestore
  const createUserProfile = async (user: FirebaseUser, name: string): Promise<UserProfile> => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name,
      email: user.email!,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const profile = await checkUserProfile(user.uid);
    if (!profile) throw new Error('Failed to create profile');
    return profile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user has a profile
        const profile = await checkUserProfile(firebaseUser.uid);

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || '',
          role: 'user', // Default role, can be updated based on profile
          avatar: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
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
  const signup = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After signup, always check if profile exists
      const profile = await checkUserProfile(userCredential.user.uid);
      setNeedsProfile(!profile);
      return userCredential.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setError(message);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await checkUserProfile(userCredential.user.uid);
      setNeedsProfile(!profile);
      return userCredential.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setNeedsProfile(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      setError(message);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      setError(message);
      throw error;
    }
  };

  // Google Sign-In function
  const googleSignIn = async (): Promise<FirebaseUser> => {
    const provider = new GoogleAuthProvider();
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      const profile = await checkUserProfile(result.user.uid);
      setNeedsProfile(!profile);
      return result.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      setError(message);
      throw error;
    }
  };

  // Complete profile setup
  const completeProfile = async (name: string): Promise<UserProfile> => {
    if (!user) throw new Error('No user logged in');

    try {
      setError(null);
      // Update auth profile
      await updateProfile(auth.currentUser!, {
        displayName: name
      });

      // Create/update Firestore profile
      const profile = await createUserProfile(auth.currentUser!, name);

      // Update state
      setUser(prev => prev ? ({
        ...prev,
        name: name
      }) : null);
      setUserProfile(profile);
      setNeedsProfile(false);

      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile completion failed';
      setError(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    needsProfile,
    signup,
    login,
    logout,
    resetPassword,
    googleSignIn,
    completeProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};