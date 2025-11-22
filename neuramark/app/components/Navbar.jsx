'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X, Moon, Sun, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user, logout, toggleTheme, isDark, page = "Dashboard", isAdmin }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Chat', href: '/chat' }
    ];

    return (
        <>
            <nav className={`bg-white dark:bg-gray-900 shadow-2xl border-b-2 dark:border-gray-700 border-purple-100 dark:border-purple-900/30 sticky top-0 z-50 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        {/* Left Section */}
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className="relative group">
                                <Image
                                    src="/emblem.png"
                                    alt="NeuraMark Logo"
                                    width={40}
                                    height={40}
                                    className="rounded-lg shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
                                    priority
                                />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h1 className={`text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 tracking-tight truncate max-w-[140px] sm:max-w-xs`}>
                                {page}
                            </h1>
                            {isAdmin && (
                                <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs rounded-full shadow-sm">
                                    ADMIN
                                </span>
                            )}
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center space-x-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white px-3 py-2 rounded-md"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {user?.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    width={28}
                                    height={28}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="h-7 w-7 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                    <User size={16} />
                                </div>
                            )}

                            <span className="hidden sm:inline-block text-sm md:text-base truncate max-w-[200px] text-gray-600 dark:text-gray-300">
                                {user?.displayName || user?.email}
                            </span>

                            <button
                                onClick={logout}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 text-sm shadow-md transition-all transform hover:scale-105 active:scale-95"
                            >
                                Logout
                            </button>

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

                        {/* Hamburger for Mobile */}
                        <div className="md:hidden">
                            <button onClick={() => setSidebarOpen(true)} aria-label="Open Menu">
                                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}>
                    <div
                        className="absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                            <button onClick={() => setSidebarOpen(false)} aria-label="Close Menu">
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>

                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-white text-sm font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <button
                                onClick={() => {
                                    logout();
                                    setSidebarOpen(false);
                                }}
                                className="block text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium mt-4"
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
