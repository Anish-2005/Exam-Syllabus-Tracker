import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X, Sun, Moon, User } from 'lucide-react';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDark: boolean;
  user: any;
  loading: boolean;
  fetchAllData: () => void;
  logout: () => void;
  toggleTheme: () => void;
  pathname: string;
  secondaryText: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isDark,
  user,
  loading,
  fetchAllData,
  logout,
  toggleTheme,
  pathname,
  secondaryText,
}) => (
  <AnimatePresence>
    {sidebarOpen && (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className={`fixed inset-0 z-50 w-64 max-w-full p-4 flex flex-col gap-4 shadow-lg ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      >
        {/* Top Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Image src="/emblem.png" alt="NeuraMark Logo" width={28} height={28} className="rounded shadow-sm" />
            <div className="flex items-center space-x-1">
              <h2 className={`font-bold text-lg sm:text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Learning Analytics</h2>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Menu"
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Navigation Links */}
        <div className="flex flex-col space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`px-3 py-2 rounded-md text-base font-medium ${pathname === '/dashboard'
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
              : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/chat"
            onClick={() => setSidebarOpen(false)}
            className={`px-3 py-2 rounded-md text-base font-medium ${pathname === '/chat'
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
              : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
          >
            Chat
          </Link>
        </div>
        <button
          onClick={() => {
            fetchAllData();
            setSidebarOpen(false);
          }}
          className={`w-full py-2 rounded-md text-sm transition flex items-center justify-center space-x-2 ${loading
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Progress</span>
        </button>
        {/* User Info */}
        <div className="flex items-center space-x-2 mt-auto">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName || 'User'} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
              <User size={16} />
            </div>
          )}
          <span className={`text-sm truncate ${secondaryText}`}>{user?.displayName || user?.email}</span>
        </div>
        <button
          onClick={() => {
            logout();
            setSidebarOpen(false);
          }}
          className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 text-sm transition"
        >
          Logout
        </button>
        <button
          onClick={toggleTheme}
          className={`p-2 w-full rounded-md transition-all duration-300 flex justify-center items-center ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
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
);

export default MobileSidebar;
