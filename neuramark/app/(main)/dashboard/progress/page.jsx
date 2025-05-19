// app/dashboard/progress/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/components/context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/components/ThemeContext';
import { Moon, Sun, BookOpen, ChevronDown, ChevronUp, RefreshCw, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/components/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
export default function MyProgressPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState(null);
    const [syllabusData, setSyllabusData] = useState({});
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
                <nav className={`${cardBg} ${borderColor} border-b shadow-lg sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">

                            {/* Left: Logo and Title */}
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/dashboard"
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Back to Dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>

                                <Image
                                    src="/emblem.png"
                                    alt="NeuraMark Logo"
                                    width={40}
                                    height={40}
                                    className="rounded shadow-sm"
                                    priority
                                />

                                <h1 className={`text-lg sm:text-2xl font-bold tracking-tight ${textColor}`}>
                                    My Learning Progress
                                </h1>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={fetchUserData}
                                    className="flex items-center px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    className={`p-2 rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isDark ? 'bg-gray-700 hover:bg-gray-600 focus:ring-indigo-500' : 'bg-gray-100 hover:bg-gray-200 focus:ring-blue-500'}`}
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

                        </div>
                    </div>
                </nav>


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