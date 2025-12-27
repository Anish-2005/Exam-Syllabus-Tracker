'use client'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { RefreshCw, X, Moon, Sun } from 'lucide-react'
import UserAvatar from './UserAvatar'
import { useTheme } from '@/app/context/ThemeContext'

export default function ProgressSidebar({ isOpen, onClose, user, loading, onRefresh, logout }) {
  const { toggleTheme, isDark } = useTheme()
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = isDark ? 'text-gray-300' : 'text-gray-600'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className={`fixed inset-0 z-50 w-64 max-w-full p-4 flex flex-col gap-4 shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/emblem.png"
                alt="NeuraMark Logo"
                width={28}
                height={28}
                className="rounded shadow-sm"
              />
              <h2 className={`font-bold text-lg sm:text-xl ${textColor}`}>
                My Progress
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Menu"
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              Dashboard
            </Link>

            <Link
              href="/chat"
              onClick={onClose}
              className={`px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              Chat
            </Link>
          </div>

          <button
            onClick={() => {
              onRefresh()
              onClose()
            }}
            className={`w-full py-2 rounded-md text-sm transition flex items-center justify-center space-x-2 ${
              loading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Progress</span>
          </button>

          <div className="flex items-center space-x-2 mt-auto">
            <UserAvatar user={user} size="md" />
            <span className={`text-sm truncate ${secondaryText}`}>
              {user?.displayName || user?.email}
            </span>
          </div>

          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 text-sm transition"
          >
            Logout
          </button>

          {/* Original Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 w-full rounded-md transition-all duration-300 flex justify-center items-center ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
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
                  className="text-yellow-400 flex items-center space-x-2"
                >
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-indigo-600 flex items-center space-x-2"
                >
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}