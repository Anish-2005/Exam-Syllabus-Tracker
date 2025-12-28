// app/(auth)/login/page.js
'use client'
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Link from 'next/link';
import { Moon, Sun, User, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import NameCollectionModal from '../../components/NameCollectionModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();
   const { login, googleSignIn, needsProfile, user, userProfile } = useAuth();

  useEffect(() => {
    // If user is logged in and has a profile (doesn't need profile), redirect to dashboard
    if (user && !needsProfile && userProfile) {
      router.push('/dashboard');
    }
    // If user is logged in but needs profile, show name modal
    else if (user && needsProfile) {
      setShowNameModal(true);
    }
  }, [user, needsProfile, userProfile, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // The useEffect will handle redirection or showing the modal
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      // The useEffect will handle redirection or showing the modal
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleNameComplete = () => {
    setShowNameModal(false);
    router.push('/dashboard');
  };


  // Theme-based classes
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';
  const errorBg = isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-200';
  const googleBtnBg = isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50';
  const googleBtnBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} transition-colors duration-200 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`
          fixed top-6 right-6 p-3 rounded-2xl
          transition-all duration-300
          ${isDark ? 'bg-gray-800/80 hover:bg-gray-700/80' : 'bg-white/80 hover:bg-gray-50/80'}
          backdrop-blur-md shadow-xl hover:shadow-2xl
          focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}
          z-50 transform hover:scale-110 active:scale-95
        `}
        aria-label="Toggle Theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-yellow-400"
            >
              <Sun className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-indigo-600"
            >
              <Moon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Login Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full mx-4 space-y-8 p-10 rounded-3xl shadow-2xl ${cardBg} ${borderColor} border backdrop-blur-xl relative z-10`}
      >
        <div className="text-center">
          <h2 className={`text-4xl font-black ${textColor} mb-2 flex items-center justify-center gap-3`}>
            <User className="w-10 h-10" />
            Welcome Back!
          </h2>
          <p className={`${secondaryText} text-sm`}>Sign in to continue your learning journey</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${errorBg} border px-4 py-3 rounded-xl ${textColor} text-sm flex items-center gap-2`}
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 ${googleBtnBorder} ${googleBtnBg} shadow-lg hover:shadow-xl ${textColor} transition-all duration-300 disabled:opacity-50 font-semibold transform hover:scale-105 active:scale-95`}
        >
          <FcGoogle className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${isDark ? 'bg-gray-800' : 'bg-white'} ${secondaryText} font-medium`}>
              Or continue with email
            </span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className={`block text-sm font-semibold ${textColor} flex items-center gap-2`}>
                <User className="w-4 h-4" />
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-4 py-3 border-2 ${borderColor} rounded-xl ${inputBg} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 placeholder-gray-400`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className={`block text-sm font-semibold ${textColor} flex items-center gap-2`}>
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`w-full px-4 py-3 border-2 ${borderColor} rounded-xl ${inputBg} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 placeholder-gray-400`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl shadow-lg text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 transform hover:scale-105 hover:shadow-xl active:scale-95 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className={`text-center space-y-3 pt-2 ${secondaryText}`}>
          <Link href="/signup" className={`block text-sm font-semibold transition-colors duration-200 ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}>
            Don't have an account? Sign Up →
          </Link>
          <Link href="/forgot-password" className={`block text-sm font-semibold transition-colors duration-200 ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'} flex items-center justify-center gap-2`}>
            <Lock className="w-4 h-4" />
            Forgot password?
          </Link>
        </div>
      </motion.div>

      {/* Name Collection Modal */}
      {showNameModal && (
        <NameCollectionModal
          onComplete={handleNameComplete}
          onClose={() => setShowNameModal(false)}
        />
      )}
    </div>
  );
}
