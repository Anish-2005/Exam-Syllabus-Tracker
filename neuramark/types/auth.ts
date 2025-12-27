import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  // Extend Firebase User with our custom properties
  role?: 'admin' | 'user' | 'super-admin';
  name?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}