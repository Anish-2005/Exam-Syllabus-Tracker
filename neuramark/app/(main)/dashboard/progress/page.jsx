// app/dashboard/progress/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/context/ThemeContext';
import { Menu, Moon, Sun, BookOpen, ChevronDown, ChevronUp, RefreshCw, User, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
export default function MyProgressPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [syllabusData, setSyllabusData] = useState({});
    const router = useRouter();
    const { theme, toggleTheme, isDark } = useTheme();
    const [expandedSubjects, setExpandedSubjects] = useState([]);

    // Theme styles
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Fetch user progress
            const progressDoc = await getDoc(doc(db, 'userProgress', user.uid));
            if (progressDoc.exists()) {
                setUserProgress(progressDoc.data());
            } else {
                setUserProgress(null);
            }

            // Fetch syllabus data for all subjects in progress
            if (progressDoc.exists()) {
                const progressData = progressDoc.data();
                const subjectIds = Object.keys(progressData)
                    .filter(key => key.startsWith('subject_'))
                    .map(key => key.replace('subject_', ''));

                const syllabusMap = {};
                for (const subjectId of subjectIds) {
                    const subjectDoc = await getDoc(doc(db, 'syllabus', subjectId));
                    if (subjectDoc.exists()) {
                        syllabusMap[subjectId] = subjectDoc.data();
                    }
                }
                setSyllabusData(syllabusMap);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubjectExpand = (subjectId) => {
        setExpandedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const calculateProgress = (subjectProgress, subjectId) => {
        const subjectInfo = syllabusData[subjectId];
        if (!subjectInfo || !subjectInfo.modules) return 0;

        const totalModules = subjectInfo.modules.length;
        if (totalModules === 0) return 0;

        let completedCount = 0;

        for (let i = 0; i < totalModules; i++) {
            if (subjectProgress[`module_${i}`] === true) {
                completedCount++;
            }
        }

        return {
            percentage: Math.round((completedCount / totalModules) * 100),
            completedCount,
            totalModules
        };
    };

    return (
        <ProtectedRoute>
            <div className={`min-h-screen ${bgColor} transition-colors duration-200 pb-8`}>
                {/* Navigation */}

                <nav className={`${cardBg} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            {/* Left Section */}
                            <div className="flex items-center space-x-3 min-w-0">
                                <Link
                                    href="/dashboard"
                                    className="p-2 rounded-full transition-colors"
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

                            {/* Desktop Controls */}
                            <div className="hidden md:flex items-center space-x-4">
                                <button
                                    onClick={fetchUserData}
                                    className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 text-sm shadow-md transition-all transform hover:scale-105 active:scale-95"
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                                    <span>Refresh</span>
                                </button>

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

                                <span className={`hidden sm:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[200px]`}>
                                    {user?.displayName || user?.email}
                                </span>

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
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    aria-label="Open Menu"
                                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Sidebar */}
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
                                    <Image
                                        src="/emblem.png"
                                        alt="NeuraMark Logo"
                                        width={28}
                                        height={28}
                                        className="rounded shadow-sm"
                                    />
                                    <div className="flex items-center space-x-1">
                                        <h2 className={`font-bold text-lg sm:text-xl ${textColor}`}>
                                            My Progress
                                        </h2>
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
                                    className={`px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/dashboard'
                                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                            : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href="/chat"
                                    onClick={() => setSidebarOpen(false)}
                                    className={`px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/chat'
                                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                            : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Chat
                                </Link>
                            </div>
                            {/* Add this button with the other action buttons in your mobile sidebar */}
                            <button
                                onClick={() => {
                                    fetchUserData();
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
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                        <User size={16} />
                                    </div>
                                )}
                                <span className={`text-sm truncate ${secondaryText}`}>
                                    {user?.displayName || user?.email}
                                </span>
                            </div>

                            {/* Buttons */}
                            <button
                                onClick={() => {
                                    logout();
                                    setSidebarOpen(false);
                                }}
                                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 text-sm transition"
                            >
                                Logout
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 w-full rounded-md transition-all duration-300 flex justify-center items-center ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
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
                {/* Main Content */}
                <main className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ${textColor}`}>
                    <div className={`${cardBg} p-4 sm:p-6 rounded-lg shadow ${borderColor} border mt-4`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h2 className={`text-xl font-bold ${textColor} mb-1`}>
                                    Your Learning Progress
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {user?.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300`}>
                                            <User size={14} />
                                        </div>
                                    )}
                                    <span className={`text-sm ${secondaryText}`}>{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : !userProgress ? (
                            <div className={`text-center py-8 ${secondaryText}`}>
                                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No progress data available</p>
                                <p className="mt-2 text-sm">Your completed modules will appear here after you mark them in your subjects.</p>
                                <Link href="/dashboard" className={`mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300`}>
                                    Go to Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(userProgress).map(([key, value]) => {
                                    if (key === 'updatedAt') return null;

                                    const subjectId = key.replace('subject_', '');
                                    const subjectInfo = syllabusData[subjectId];
                                    if (!subjectInfo) return null;

                                    const progress = calculateProgress(value, subjectId);
                                    const isExpanded = expandedSubjects.includes(subjectId);

                                    return (
                                        <div key={key} className={`rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
                                            <div
                                                className="p-4 cursor-pointer"
                                                onClick={() => toggleSubjectExpand(subjectId)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className={`font-medium ${textColor}`}>
                                                            {subjectInfo.name}
                                                            <span className={`text-sm ml-2 ${secondaryText}`}>
                                                                ({subjectInfo.code})
                                                            </span>
                                                        </h3>
                                                        <div className={`text-xs ${secondaryText} mt-1`}>
                                                            {subjectInfo.branch} • Year {subjectInfo.year} • Semester {subjectInfo.semester}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <div className={`text-sm font-medium ${progress.percentage === 100 ? 'text-green-500' : 'text-indigo-500'}`}>
                                                                {progress.percentage}% Complete
                                                            </div>
                                                            <div className={`text-xs ${secondaryText}`}>
                                                                {progress.completedCount} of {progress.totalModules} modules
                                                            </div>
                                                        </div>
                                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-5 h-5" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className={`p-4 pt-0 border-t ${borderColor}`}>
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-sm ${secondaryText}`}>
                                                                {progress.completedCount} completed of {progress.totalModules} modules
                                                            </span>
                                                            <span className={`text-sm font-medium ${progress.percentage === 100 ? 'text-green-500' : 'text-indigo-500'}`}>
                                                                {progress.percentage}%
                                                            </span>
                                                        </div>
                                                        <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                                                            <div
                                                                className={`h-2.5 rounded-full ${progress.percentage === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                                style={{ width: `${progress.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {subjectInfo.modules?.map((module, index) => {
                                                            const isCompleted = value[`module_${index}`] === true;

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className={`p-3 rounded border ${isCompleted
                                                                        ? (theme === 'dark' ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-200')
                                                                        : (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <h4 className={`text-sm font-medium ${textColor}`}>
                                                                                Module {index + 1}: {module.name}
                                                                            </h4>
                                                                            {isCompleted && (
                                                                                <div className={`text-xs mt-1 text-green-600 dark:text-green-400`}>
                                                                                    Status: Completed
                                                                                </div>
                                                                            )}
                                                                            {module.topics?.length > 0 && (
                                                                                <div className="mt-2">
                                                                                    <div className={`text-xs ${secondaryText} font-medium`}>Topics:</div>
                                                                                    <ul className="list-disc list-inside ml-4">
                                                                                        {module.topics.map((topic, i) => (
                                                                                            <li key={i} className={`text-xs ${secondaryText}`}>
                                                                                                {topic}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}