'use client'
import Link from 'next/link'
import Image from 'next/image'
import { RefreshCw, Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'
import UserAvatar from './UserAvatar'

export default function ProgressHeader({ user, loading, onRefresh, onMenuOpen }) {
  const { theme, toggleTheme, isDark } = useTheme()
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'

  return (
    <nav className={`${cardBg} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Image
              src="/emblem.png"
              alt="NeuraMark Logo"
              width={36}
              height={36}
              className="rounded-sm shadow-sm shrink-0"
              priority
            />
            <h1 className={`text-lg sm:text-2xl font-bold ${textColor} tracking-tight truncate max-w-[140px] sm:max-w-xs`}>
              My Progress
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onRefresh}
              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 text-sm shadow-md transition-all transform hover:scale-105 active:scale-95"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <UserAvatar user={user} size="sm" />

            <span className={`hidden sm:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[200px]`}>
              {user?.displayName || user?.email}
            </span>

            {/* Original Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300
                ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isDark ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
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
                    <Sun className="w-5 h-5 md:w-6 md:h-6" />
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
                    <Moon className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={onMenuOpen}
              aria-label="Open Menu"
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}