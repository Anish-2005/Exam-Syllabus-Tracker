'use client'
import Link from 'next/link'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { Moon, Sun, BookOpen } from 'lucide-react'
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
    <main className={`min-h-screen flex flex-col items-center justify-center ${bgGradient} transition-colors duration-200 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center p-8 max-w-4xl relative z-10"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <Image
              src="/emblem.png"
              alt="NeuraMark Logo"
              width={100}
              height={100}
              className="relative rounded-3xl shadow-2xl ring-4 ring-white/20 shrink-0 transform group-hover:scale-110 transition duration-300"
              priority
            />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`text-6xl md:text-8xl font-black mb-6 ${textPrimary}`}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">
            NeuraMark
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`text-xl md:text-2xl mb-12 ${textSecondary} max-w-3xl mx-auto leading-relaxed`}
        >
          Track your academic progress from 1st to final year across a wide range of courses — from B.Tech branches like 
          <span className="font-bold text-indigo-600 dark:text-indigo-400"> CSE, ECE, AIML, DS</span>, and more.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
        >
          <Link
            href={user ? '/dashboard' : '/login'}
            className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {user ? '🚀 Go to Dashboard' : '✨ Get Started'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            href="/about"
            className="px-10 py-5 rounded-2xl font-bold text-lg border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 backdrop-blur-sm hover:shadow-xl transform hover:scale-105"
          >
            📚 Learn More
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className={`flex flex-wrap justify-center gap-6 text-sm ${textSecondary}`}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time Tracking</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Collaborative</span>
          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}