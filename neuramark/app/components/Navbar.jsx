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
            <nav className={`bg-white/80 dark:bg-gray-900/80 shadow-2xl border-b-2 border-purple-200/50 dark:border-purple-900/30 sticky top-0 z-50 backdrop-blur-2xl`}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex justify-between items-center h-20">
                        {/* Left Section */}
                        <div className="flex items-center space-x-4 min-w-0">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition duration-300"></div>
                                <Image
                                    src="/emblem.png"
                                    alt="NeuraMark Logo"
                                    width={48}
                                    height={48}
                                    className="relative rounded-xl shadow-xl shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                    priority
                                />
                            </div>
                            <h1 className={`text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 tracking-tight truncate max-w-[140px] sm:max-w-xs`}>
                                {page}
                            </h1>
                            {isAdmin && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-2 px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse"
                                >
                                    ADMIN
                                </motion.span>
                            )}
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-400 dark:hover:to-pink-400 px-4 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-800 transition-all duration-200"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {user?.photoURL ? (
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        width={36}
                                        height={36}
                                        className="relative rounded-full ring-2 ring-white dark:ring-gray-800"
                                    />
                                </div>
                            ) : (
                                <div className="h-9 w-9 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                                    <User size={20} />
                                </div>
                            )}

                            <span className="hidden sm:inline-block text-sm md:text-base font-semibold truncate max-w-[200px] text-gray-700 dark:text-gray-200">
                                {user?.displayName || user?.email}
                            </span>

                            <button
                                onClick={logout}
                                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-rose-600 text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                            >
                                Logout
                            </button>

                            <button
                                onClick={toggleTheme}
                                className={`p-3 rounded-xl transition-all duration-300
                                    ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700' : 'bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200'}
                                    shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2
                                    ${isDark ? 'focus:ring-purple-500' : 'focus:ring-purple-400'} transform hover:scale-110 active:scale-95`}
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
