// app/(auth)/signup/page.js
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/context/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleSignIn } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
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
    <div className={`min-h-screen flex items-center justify-center ${bgColor} transition-colors duration-200 relative`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`
          fixed top-4 right-4 p-2 rounded-full
          transition-all duration-300
          ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
          shadow-md hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}
          z-50
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
              <Sun className="w-5 h-5" />
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
              <Moon className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Signup Box */}
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow ${cardBg} ${borderColor} border`}>
        <h2 className={`text-center text-3xl font-extrabold ${textColor}`}>
          Create a new account
        </h2>
        
        {error && (
          <div className={`${errorBg} border px-4 py-3 rounded ${textColor}`}>
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border ${googleBtnBorder} ${googleBtnBg} shadow-sm ${textColor} transition-colors duration-200 disabled:opacity-50`}
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${borderColor}`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isDark ? 'bg-gray-800' : 'bg-white'} ${secondaryText}`}>
              Or sign up with email
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`sr-only ${textColor}`}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-3 py-2 border rounded-md ${borderColor} ${inputBg}`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className={`sr-only ${textColor}`}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`w-full px-3 py-2 border rounded-md ${borderColor} ${inputBg}`}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={`sr-only ${textColor}`}>Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`w-full px-3 py-2 border rounded-md ${borderColor} ${inputBg}`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className={`text-center ${secondaryText}`}>
          <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}