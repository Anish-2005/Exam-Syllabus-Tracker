// app/admin/active-users/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/context/ThemeContext';
import { Menu,Sun, Moon, RefreshCw, ArrowLeft, User, Mail, Calendar, Clock, BookOpen, CheckCircle, ChevronDown, ChevronUp,X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function UserDataPage() {
    const { user: currentUser } = useAuth();
    const { user, logout } = useAuth();
    const router =useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [syllabusData, setSyllabusData] = useState({});
    const { theme, toggleTheme, isDark } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Theme styles
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

    useEffect(() => {
        if (currentUser && currentUser.email === "anishseth0510@gmail.com") {
            setIsAdmin(true);
            fetchAllData();
        }
    }, [currentUser]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = [];

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                usersData.push({
                    id: doc.id,
                    name: userData.name || 'Not provided',
                    email: userData.email || 'No email',
                    photoURL: userData.photoURL || null,
                    createdAt: userData.createdAt?.toDate() || null,
                    updatedAt: userData.updatedAt?.toDate() || null
                });
            });

            // Sort by creation date (newest first)
            const sortedUsers = usersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setUsers(sortedUsers);

            // Fetch syllabus data
            const syllabusSnapshot = await getDocs(collection(db, 'syllabus'));
            const syllabusMap = {};
            syllabusSnapshot.forEach((doc) => {
                syllabusMap[doc.id] = doc.data();
            });
            setSyllabusData(syllabusMap);

            // Fetch progress for each user
            const progressData = {};
            for (const user of sortedUsers) {
                const progressDoc = await getDoc(doc(db, 'userProgress', user.id));
                if (progressDoc.exists()) {
                    progressData[user.id] = progressDoc.data();
                }
            }
            setUserProgress(progressData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleUserExpand = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
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

    const renderProgressData = (userId) => {
        const progress = userProgress[userId];
        if (!progress) return <div className="text-sm text-gray-500 dark:text-gray-400 italic">No progress data available</div>;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Learning Progress
                </h4>

                <div className="space-y-6">
                    {Object.entries(progress).map(([key, value]) => {
                        if (key === 'updatedAt') return null;

                        const subjectId = key.replace('subject_', '');
                        const subjectInfo = syllabusData[subjectId];
                        if (!subjectInfo) return null;

                        const progress = calculateProgress(value, subjectId);

                        return (
                            <div key={key} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h5 className="font-semibold text-gray-900 dark:text-white">
                                            {subjectInfo.name}
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {subjectInfo.code} • {subjectInfo.branch} • Year {subjectInfo.year} • Sem {subjectInfo.semester}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${progress.percentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {progress.percentage}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {progress.completedCount} of {progress.totalModules} modules
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-300 ${progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {subjectInfo.modules?.map((module, index) => {
                                        const isCompleted = value[`module_${index}`] === true;

                                        return (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-md border transition-colors ${
                                                    isCompleted
                                                        ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                        : 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-medium ${
                                                        isCompleted
                                                            ? 'text-green-800 dark:text-green-300'
                                                            : 'text-gray-900 dark:text-gray-300'
                                                    }`}>
                                                        Module {index + 1}: {module.name}
                                                    </span>
                                                    {isCompleted && (
                                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {progress.updatedAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        Last updated: {formatDate(progress.updatedAt.toDate())}
                    </div>
                )}
            </div>
        );
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.id.toLowerCase().includes(searchLower)
        );
    });

    if (!isAdmin) {
        return (
            <ProtectedRoute>
                <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
                    <div className={`${cardBg} p-8 rounded-lg shadow-lg text-center max-w-md ${borderColor} border`}>
                        <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Access Denied</h2>
                        <p className={secondaryText}>You don't have permission to access this page.</p>
                        <Link href="/dashboard" className={`mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300`}>
                            Go back to Dashboard
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className={`min-h-screen ${bgColor} transition-colors duration-200 pb-8`}>
                {/* Navigation */}
                <nav className={`bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50`}>
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
                                <button
                                    onClick={fetchAllData}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm transition-colors"
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    <span>Refresh</span>
                                </button>

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
                                            Subjects
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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Learners</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {Object.keys(userProgress).filter(id => userProgress[id] && Object.keys(userProgress[id]).length > 0).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects Available</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(syllabusData).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {users.filter(user => {
                                            const weekAgo = new Date();
                                            weekAgo.setDate(weekAgo.getDate() - 7);
                                            return user.createdAt && user.createdAt > weekAgo;
                                        }).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table/Card Container */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        User Management
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Monitor user activity and learning progress
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={fetchAllData}
                                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Mobile Cards */}
                                <div className="sm:hidden space-y-4 p-6">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {user.photoURL ? (
                                                        <Image
                                                            src={user.photoURL}
                                                            alt={user.name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleUserExpand(user.id)}
                                                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    {expandedUser === user.id ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Joined</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Last Active</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</p>
                                                </div>
                                            </div>

                                            {expandedUser === user.id && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                    {renderProgressData(user.id)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden sm:block">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-2" />
                                                        User
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Email
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Joined
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        Last Active
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Progress
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredUsers.map((user) => (
                                                <>
                                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    {user.photoURL ? (
                                                                        <Image
                                                                            src={user.photoURL}
                                                                            alt={user.name}
                                                                            width={40}
                                                                            height={40}
                                                                            className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                                                                            {user.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                        {user.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        ID: {user.id.slice(0, 8)}...
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.createdAt)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                userProgress[user.id] && Object.keys(userProgress[user.id]).length > 0
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                {userProgress[user.id] && Object.keys(userProgress[user.id]).length > 0 ? 'Active' : 'No Progress'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => toggleUserExpand(user.id)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            >
                                                                {expandedUser === user.id ? (
                                                                    <ChevronUp className="w-5 h-5" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedUser === user.id && (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30">
                                                                {renderProgressData(user.id)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {!loading && filteredUsers.length === 0 && (
                            <div className="text-center py-16">
                                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    {searchQuery ? 'No matching users found' : 'No users registered yet'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchQuery
                                        ? 'Try adjusting your search terms or clear the search to see all users.'
                                        : 'Users will appear here once they register and start using the platform.'
                                    }
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}