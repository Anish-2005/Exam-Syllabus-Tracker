'use client'
import Link from 'next/link'
import Image from 'next/image'
import { RefreshCw, Menu, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'
import UserAvatar from './UserAvatar'

export default function ProgressHeader({ user, loading, onRefresh, onMenuOpen }) {
  const { theme, toggleTheme, isDark } = useTheme()
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
  const cardBg = isDark ? 'bg-gray-800/90 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg'
  const borderColor = isDark ? 'border-gray-700' : 'border-purple-200'
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600'

  return (
    <nav className={`${cardBg} shadow-xl ${borderColor} border-b sticky top-0 z-50 backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-3 min-w-0">
            <Link
              href="/dashboard"
              className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-purple-100'}`}
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className={`h-5 w-5 ${textColor}`} />
            </Link>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40"></div>
              <Image
                src="/emblem.png"
                alt="NeuraMark Logo"
                width={40}
                height={40}
                className="rounded-lg shadow-lg shrink-0 relative"
                priority
              />
            </div>
            <div>
              <h1 className={`text-lg sm:text-2xl font-bold tracking-tight truncate max-w-[140px] sm:max-w-xs ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                My Progress
              </h1>
              <p className={`text-xs ${secondaryText} hidden sm:block`}>Track Your Learning</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onRefresh}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <UserAvatar user={user} size="sm" />

            <span className={`hidden sm:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[200px]`}>
              {user?.displayName || user?.email}
            </span>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95
                ${isDark ? 'bg-gray-700/80 hover:bg-gray-600/80' : 'bg-white/80 hover:bg-purple-100'}
                shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isDark ? 'focus:ring-indigo-500' : 'focus:ring-purple-500'}`}
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