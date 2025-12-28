import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon, Menu, ArrowLeft, User } from 'lucide-react';

interface AdminNavbarProps {
  user: any;
  isDark: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminNavbar({ user, isDark, toggleTheme, setSidebarOpen }: AdminNavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <Image
              src="/emblem.png"
              alt="NeuraMark Logo"
              width={32}
              height={32}
              className="rounded shrink-0"
              priority
            />
            <h1 className={`text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-xs`}>
              Active Users
            </h1>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
              ADMIN
            </span>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 ml-4 pl-3 border-l border-gray-300 dark:border-gray-600">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`hidden sm:inline-block text-sm font-medium truncate max-w-[200px] text-gray-700 dark:text-gray-200`}>
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          </div>

          {/* Hamburger for Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-md ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
