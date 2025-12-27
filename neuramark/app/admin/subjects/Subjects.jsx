'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useTheme } from '@/app/context/ThemeContext';
import {User,RefreshCw,Menu, Moon, Sun, Trash2, Edit, ArrowLeft ,X, BookOpen, GraduationCap, Layers} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
export default function AdminSubjects() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const { theme, toggleTheme, isDark } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
    const cardBg = isDark ? 'bg-gray-800/90 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg';
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
    const borderColor = isDark ? 'border-gray-700' : 'border-purple-200';

    useEffect(() => {
        if (user && user.email === "anishseth0510@gmail.com") {
            setIsAdmin(true);
            fetchAllSubjects();
        }
    }, [user]);

    const fetchAllSubjects = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'syllabus'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllSubjects(data);
        } catch (error) {
            console.error('Error fetching all subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSubject = async (subjectId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this subject? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'syllabus', subjectId));
            setAllSubjects(allSubjects.filter(sub => sub.id !== subjectId));
            alert('Subject deleted successfully');
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert('Failed to delete subject');
        }
    };

    const handleViewSubject = (subject) => {
        // Store the subject in session storage to be retrieved on the dashboard
        sessionStorage.setItem('subjectToView', JSON.stringify(subject));
        router.push(`/dashboard?subject=${subject.id}`);
    };

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
            <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                 {/* Navigation */}
                <nav className={`${cardBg} shadow-xl ${borderColor} border-b sticky top-0 z-50 backdrop-blur-xl`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            {/* Left Section */}
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
                                        Subjects
                                    </h1>
                                    <p className={`text-xs ${secondaryText} hidden sm:block`}>Manage Syllabus</p>
                                </div>
                            </div>

                            {/* Desktop Controls */}
                            <div className="hidden md:flex items-center space-x-4">
                                <button
                                    onClick={fetchAllSubjects}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    <span>Refresh Data</span>
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
                                    fetchAllSubjects();
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


                <main className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${textColor}`}>
                    <div className={`${cardBg} p-6 sm:p-8 rounded-2xl shadow-2xl ${borderColor} border-2`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
                                        All Subjects
                                    </h2>
                                    <p className={`text-sm ${secondaryText}`}>
                                        {allSubjects.length} {allSubjects.length === 1 ? 'Subject' : 'Subjects'} in Database
                                    </p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-indigo-600"></div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-xl"></div>
                                </div>
                                <p className={`text-sm font-medium ${secondaryText} animate-pulse`}>Loading subjects...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl">
                                <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700">
                                    <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
                                        <tr>
                                            <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    Subject
                                                </div>
                                            </th>
                                            <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                Code
                                            </th>
                                            <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4" />
                                                    Branch
                                                </div>
                                            </th>
                                            <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                Year
                                            </th>
                                            <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                Semester
                                            </th>
                                            <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-4 h-4" />
                                                    Modules
                                                </div>
                                            </th>
                                            <th scope="col" className={`px-6 py-4 text-right text-xs font-semibold ${textColor} uppercase tracking-wider`}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDark ? 'bg-gray-800/50' : 'bg-white/60'}`}>
                                        {allSubjects.map((subject) => (
                                            <tr key={subject.id} className={`transition-all ${isDark ? 'hover:bg-gray-700/70' : 'hover:bg-purple-50/80'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-medium ${textColor}`}>
                                                        {subject.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm ${secondaryText}`}>
                                                        {subject.code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm ${secondaryText}`}>
                                                        {subject.branch}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm ${secondaryText}`}>
                                                        Year {subject.year}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm ${secondaryText}`}>
                                                        Sem {subject.semester}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm ${secondaryText}`}>
                                                        {subject.modules?.length || 0}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewSubject(subject)}
                                                            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'} shadow-md hover:shadow-lg`}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSubject(subject.id)}
                                                            className={`p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 ${isDark ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'} shadow-sm hover:shadow-md`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && allSubjects.length === 0 && (
                            <div className={`text-center py-16`}>
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                                    <div className={`relative p-6 rounded-2xl ${isDark ? 'bg-gray-700/50' : 'bg-white/80'} shadow-xl`}>
                                        <BookOpen className={`w-16 h-16 mx-auto mb-4 ${secondaryText}`} />
                                        <h3 className={`text-xl font-bold ${textColor} mb-2`}>No Subjects Found</h3>
                                        <p className={`${secondaryText}`}>No subjects are currently available in the database.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}