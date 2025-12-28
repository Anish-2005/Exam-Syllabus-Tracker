'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X, Moon, Sun, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
    user: {
        displayName?: string;
        email?: string;
        photoURL?: string;
    } | null;
    logout: () => void;
    toggleTheme: () => void;
    isDark: boolean;
    page?: string;
    isAdmin?: boolean;
}

export default function Navbar({ user, logout, toggleTheme, isDark, page = "Dashboard", isAdmin }: NavbarProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Chat', href: '/chat' }
    ];

    return (
        <>
            <nav className={`bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50`}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex justify-between items-center h-16">
                        {/* Left Section */}
                        <div className="flex items-center space-x-4 min-w-0">
                            <Image
                                src="/emblem.png"
                                alt="NeuraMark Logo"
                                width={32}
                                height={32}
                                className="rounded shrink-0"
                                priority
                            />
                            <h1 className={`text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-xs`}>
                                {page}
                            </h1>
                            {isAdmin && (
                                <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
                                    ADMIN
                                </span>
                            )}
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}

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
                                    <User size={16} />
                                </div>
                            )}

                            <span className="hidden sm:inline-block text-sm font-medium truncate max-w-[200px] text-gray-700 dark:text-gray-200">
                                {user?.displayName || user?.email}
                            </span>

                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 text-sm transition-colors"
                            >
                                Logout
                            </button>

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
                            <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-md ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`} aria-label="Open Menu">
                                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
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
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                            <button onClick={() => setSidebarOpen(false)} className={`p-1 rounded-md ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`} aria-label="Close Menu">
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>

                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="block text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <button
                                onClick={() => {
                                    logout();
                                    setSidebarOpen(false);
                                }}
                                className="block text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium py-2 px-3 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
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
