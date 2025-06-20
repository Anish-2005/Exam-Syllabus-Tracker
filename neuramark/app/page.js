'use client'
import Link from 'next/link'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function Home() {
  const { user } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()

  // Theme-based classes
  const bgGradient = isDark
    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-blue-50 to-indigo-100'
  const textPrimary = isDark ? 'text-white' : 'text-gray-800'
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600'
  const buttonPrimary = isDark
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
  const buttonSecondary = isDark
    ? 'border-indigo-400 text-indigo-400 hover:bg-gray-800'
    : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center ${bgGradient} transition-colors duration-200`}>
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

      <div className="text-center p-8 max-w-2xl">
        <div className="flex items-center justify-center space-x-3">
          <Image
            src="/emblem.png"
            alt="NeuraMark Logo"
            width={60}
            height={60}
            className="mb-5 rounded-md shadow-md shrink-0"
            priority
          />
        </div>

        <h1 className={`text-4xl font-bold mb-6 ${textPrimary}`}>
          NeuraMark
        </h1>
        <p className={`text-lg mb-8 ${textSecondary}`}>
          Track your academic progress from 1st to final year across a wide range of courses — from B.Tech branches like CSE, ECE, AIML, DS, EE, ME, and more, to non-tech programs such as BCA, BBA, BHM, and others.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href={user ? '/dashboard' : '/login'}
            className={`px-6 py-3 rounded-lg transition-colors ${buttonPrimary}`}
          >
            {user ? 'Go to Dashboard' : 'Get Started'}
          </Link>
          <Link
            href="/about"
            className={`px-6 py-3 border rounded-lg transition-colors ${buttonSecondary}`}
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  )
}