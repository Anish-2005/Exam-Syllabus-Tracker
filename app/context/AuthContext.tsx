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
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: any;
  loading: boolean;
  needsProfile: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  completeProfile: (name: string) => Promise<any>;
  updateUserProfile: (profileData: any) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsProfile, setNeedsProfile] = useState<boolean>(false);

  // Check if user profile exists in Firestore
  interface UserProfile {
    name: string;
    email: string;
    photoURL?: string | null;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
  }

  const checkUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  };

  // Update user profile in Firestore
  interface UpdateUserProfileData {
    [key: string]: any;
  }

  const updateUserProfile = async (
    profileData: UpdateUserProfileData
  ): Promise<UserProfile | null> => {
    if (!user) throw new Error('No user logged in');
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        ...profileData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    const updatedProfile = await checkUserProfile(user.uid);
    setUserProfile(updatedProfile);
    return updatedProfile;
  };

  // Create new user profile in Firestore
  interface CreateUserProfileParams {
    user: User;
    name: string;
  }

  const createUserProfile = async (
    user: User,
    name: string
  ): Promise<UserProfile | null> => {
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
        
        setUser(firebaseUser);

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
  interface SignupParams {
    email: string;
    password: string;
  }

  interface SignupReturn {
    user: User;
  }

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After signup, always check if profile exists
      const profile = await checkUserProfile(userCredential.user.uid);
      setNeedsProfile(!profile);
      // No return value needed
    } catch (error) {
      throw error;
    }
  };

  interface LoginParams {
    email: string;
    password: string;
  }

  interface LoginReturn {
    user: User;
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await checkUserProfile(userCredential.user.uid);
      setNeedsProfile(!profile);
      // No return value to match Promise<void>
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  interface ResetPasswordParams {
    email: string;
  }

  interface ResetPasswordReturn {
    // sendPasswordResetEmail returns Promise<void>
  }

  const resetPassword = (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  };

  // Google Sign-In function
  const googleSignIn = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const profile = await checkUserProfile(result.user.uid);
      setNeedsProfile(!profile);
      // Do not return result.user to match the expected return type
    } catch (error) {
      throw error;
    }
  };

  // Complete profile setup
  interface CompleteProfileParams {
    name: string;
  }

  interface CompleteProfileReturn {
    name: string;
    email: string;
    photoURL?: string | null;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
  }

  const completeProfile = async (name: string): Promise<CompleteProfileReturn | null> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Update auth profile
      await updateProfile(auth.currentUser as User, {
        displayName: name
      });
      
      // Create/update Firestore profile
      const profile = await createUserProfile(auth.currentUser as User, name);
      
      // Update state
      setUser(prev => prev ? ({
        ...prev,
        displayName: name
      }) : prev);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};