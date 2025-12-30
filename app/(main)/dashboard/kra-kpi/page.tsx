'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { useTheme } from '@/app/context/ThemeContext';
import { Sun, Moon, BookOpen, ChevronDown, ChevronUp, RefreshCw, User, BarChart2, Target, Award, TrendingUp, X, Menu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/lib/firebase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';


export default function KraKpiPage() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState<DocumentData | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [syllabusData, setSyllabusData] = useState<{ [key: string]: SubjectInfo }>({});
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('kpi');
    const [selectedSemester, setSelectedSemester] = useState<string | number>('all');


    // Enhanced theme styles
    const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
    const cardBg = isDark ? 'bg-gray-800/90 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg';
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
    const borderColor = isDark ? 'border-gray-700' : 'border-purple-200';
    const activeTabBg = isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500';
    const inactiveTabBg = isDark ? 'bg-gray-700/50' : 'bg-white/60';

    const fetchUserData = useCallback(async () => {
        if (!user) return;
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

                const syllabusMap: { [key: string]: any } = {};
                for (const subjectId of subjectIds) {
                    const subjectDoc = await getDoc(doc(db, 'syllabus', subjectId));
                    if (subjectDoc.exists()) {
                        syllabusMap[subjectId] = subjectDoc.data();
                    }
                }
                setSyllabusData(syllabusMap);
            }

            // Fetch user's saved semester preference
            const userPrefsRef = doc(db, 'userPreferences', user.uid);
            const userPrefsDoc = await getDoc(userPrefsRef);
            if (userPrefsDoc.exists() && userPrefsDoc.data().defaultSemesterKPI) {
                setSelectedSemester(userPrefsDoc.data().defaultSemesterKPI);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user, fetchUserData]);

    interface SubjectInfo {
        name: string;
        code: string;
        year: number;
        semester: string | number;
        modules: any[];
        [key: string]: any;
    }

    interface SubjectProgress {
        [key: string]: boolean;
    }

    interface ProgressResult {
        percentage: number;
        completedCount: number;
        totalModules: number;
    }

    const calculateProgress = (
        subjectProgress: SubjectProgress,
        subjectId: string
    ): ProgressResult => {
        const subjectInfo: SubjectInfo = syllabusData[subjectId];
        if (!subjectInfo || !subjectInfo.modules) return { percentage: 0, completedCount: 0, totalModules: 0 };

        const totalModules: number = subjectInfo.modules.length;
        if (totalModules === 0) return { percentage: 0, completedCount: 0, totalModules: 0 };

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

    const getAvailableSemesters = () => {
        const semesters = new Set(
            Object.values(syllabusData)
                .map(subject => subject.semester)
                .filter(Boolean)
        );
        return Array.from(semesters).sort();
    };

    interface HandleSemesterChangeParams {
        semester: string | number;
    }

    const handleSemesterChange = async (semester: string | number): Promise<void> => {
        setSelectedSemester(semester);
        try {
            await setDoc(doc(db, 'userPreferences', user!.uid), {
                defaultSemesterKPI: semester
            }, { merge: true });
        } catch (error) {
            console.error('Error saving semester preference:', error);
        }
    };

    const getKpiData = () => {
        if (!userProgress) return [];

        return Object.entries(userProgress)
            .filter(([key]) => key.startsWith('subject_'))
            .map(([key, value]) => {
                const subjectId = key.replace('subject_', '');
                const subjectInfo = syllabusData[subjectId];
                if (!subjectInfo) return null;

                const progress = calculateProgress(value, subjectId);

                return {
                    subjectId,
                    name: subjectInfo.name,
                    code: subjectInfo.code,
                    progress: progress.percentage,
                    completed: progress.completedCount,
                    total: progress.totalModules,
                    year: subjectInfo.year,
                    semester: subjectInfo.semester
                };
            })
            .filter((item): item is NonNullable<typeof item> => {
                if (item === null) return false;
                if (selectedSemester === 'all') return true;
                return item.semester === selectedSemester;
            })
            .sort((a, b) => b.progress - a.progress);
    };

    const getKraData = () => {
        const kpiData = getKpiData();
        if (kpiData.length === 0) return [];

        // Group by year and semester
        const kraData: { [key: string]: { name: string; subjects: number; totalModules: number; completedModules: number; avgProgress: number } } = {};

        kpiData.forEach(item => {
            const key = `Year ${item.year} - Semester ${item.semester}`;
            if (!kraData[key]) {
                kraData[key] = {
                    name: key,
                    subjects: 0,
                    totalModules: 0,
                    completedModules: 0,
                    avgProgress: 0
                };
            }

            kraData[key].subjects += 1;
            kraData[key].totalModules += item.total;
            kraData[key].completedModules += item.completed;
        });

        // Calculate average progress for each KRA
        Object.keys(kraData).forEach(key => {
            kraData[key].avgProgress = Math.round(
                (kraData[key].completedModules / kraData[key].totalModules) * 100
            );
        });

        return Object.values(kraData);
    };

    const getYearlyProgressData = () => {
        const kpiData = getKpiData();
        if (kpiData.length === 0) return [];

        const yearlyData: { [key: string]: { name: string; subjects: number; totalModules: number; completedModules: number; progress: number } } = {};

        kpiData.forEach(item => {
            const yearKey = `Year ${item.year}`;
            if (!yearlyData[yearKey]) {
                yearlyData[yearKey] = {
                    name: yearKey,
                    subjects: 0,
                    totalModules: 0,
                    completedModules: 0,
                    progress: 0
                };
            }

            yearlyData[yearKey].subjects += 1;
            yearlyData[yearKey].totalModules += item.total;
            yearlyData[yearKey].completedModules += item.completed;
        });

        // Calculate progress for each year
        Object.keys(yearlyData).forEach(key => {
            yearlyData[key].progress = Math.round(
                (yearlyData[key].completedModules / yearlyData[key].totalModules) * 100
            );
        });

        return Object.values(yearlyData);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }: {
        cx: number;
        cy: number;
        midAngle: number;
        innerRadius: number;
        outerRadius: number;
        percent: number;
        index: number;
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ProtectedRoute>
            <div className={`min-h-screen ${bgColor} transition-colors duration-200 pb-8`}>
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
                                        Learning Analytics
                                    </h1>
                                    <p className={`text-xs ${secondaryText} hidden sm:block`}>KPI & KRA Dashboard</p>
                                </div>
                            </div>

                            {/* Desktop Controls */}
                            <div className="hidden md:flex items-center space-x-4">
                                <button
                                    onClick={fetchUserData}
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
                                            Learning Analytics
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
                <main className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ${textColor} py-6`}>
                    <div className={`${cardBg} p-6 sm:p-8 rounded-2xl shadow-2xl ${borderColor} border-2`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-40"></div>
                                    <div className="relative p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                                        <BarChart2 className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-1`}>
                                        Key Performance Indicators
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        {user?.photoURL ? (
                                            <Image
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                width={28}
                                                height={28}
                                                className="rounded-full ring-2 ring-indigo-500"
                                            />
                                        ) : (
                                            <div className="h-7 w-7 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                                <User size={16} />
                                            </div>
                                        )}
                                        <span className={`text-sm font-medium ${secondaryText}`}>{user?.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex mt-4 sm:mt-0 space-x-3">
                                <button
                                    onClick={() => setActiveTab('kpi')}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-md ${activeTab === 'kpi' ? `${activeTabBg} text-white shadow-lg` : `${inactiveTabBg} ${secondaryText} hover:shadow-lg`}`}
                                >
                                    <div className="flex items-center">
                                        <Target className="w-4 h-4 mr-2" />
                                        KPIs
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('kra')}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-md ${activeTab === 'kra' ? `${activeTabBg} text-white shadow-lg` : `${inactiveTabBg} ${secondaryText} hover:shadow-lg`}`}
                                >
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 mr-2" />
                                        KRAs
                                    </div>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-indigo-600"></div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-xl"></div>
                                </div>
                                <p className={`text-sm font-medium ${secondaryText} animate-pulse`}>Loading analytics...</p>
                            </div>
                        ) : !userProgress ? (
                            <div className={`text-center py-16`}>
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                                    <div className={`relative p-6 rounded-2xl ${isDark ? 'bg-gray-700/50' : 'bg-white/80'} shadow-xl`}>
                                        <BarChart2 className={`w-16 h-16 mx-auto mb-4 ${secondaryText}`} />
                                        <h3 className={`text-xl font-bold ${textColor} mb-2`}>No Analytics Data</h3>
                                        <p className={`${secondaryText} mb-4`}>Your learning analytics will appear here after you make progress in your subjects.</p>
                                        <Link href="/dashboard" className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'} text-white shadow-md hover:shadow-lg`}>
                                            Go to Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'kpi' ? (
                            <div className="space-y-8">
                                {/* Semester Filter */}
                                {getAvailableSemesters().length > 0 && (
                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg backdrop-blur-sm`}>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`text-sm font-medium ${secondaryText}`}>Filter by Semester:</span>
                                            <button
                                                onClick={() => handleSemesterChange('all')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                                                    selectedSemester === 'all'
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                                        : isDark
                                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                All Semesters
                                            </button>
                                            {getAvailableSemesters().map(semester => (
                                                <button
                                                    key={semester}
                                                    onClick={() => handleSemesterChange(semester)}
                                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                                                        selectedSemester === semester
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                                            : isDark
                                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    Semester {semester}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Overall Progress Summary */}
                                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg backdrop-blur-sm`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center`}>
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        Overall Learning Progress
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/80' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} border ${borderColor} shadow-sm hover:shadow-md transition-all`}>
                                            <div className={`text-sm ${secondaryText} mb-1`}>Total Subjects</div>
                                            <div className={`text-2xl font-bold ${textColor}`}>
                                                {getKpiData().length}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/80' : 'bg-gradient-to-br from-purple-50 to-pink-50'} border ${borderColor} shadow-sm hover:shadow-md transition-all`}>
                                            <div className={`text-sm ${secondaryText} mb-1`}>Total Modules</div>
                                            <div className={`text-2xl font-bold ${textColor}`}>
                                                {getKpiData().reduce((sum, subject) => sum + subject.total, 0)}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/80' : 'bg-gradient-to-br from-green-50 to-emerald-50'} border ${borderColor} shadow-sm hover:shadow-md transition-all`}>
                                            <div className={`text-sm ${secondaryText} mb-1`}>Average Completion</div>
                                            <div className={`text-2xl font-bold ${textColor}`}>
                                                {Math.round(
                                                    getKpiData().reduce((sum, subject) => sum + subject.completed, 0) /
                                                    getKpiData().reduce((sum, subject) => sum + subject.total, 0) * 100
                                                ) || 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject Progress Charts */}
                                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg backdrop-blur-sm`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                                        Subject-wise Performance
                                    </h3>

                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={getKpiData()}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4B5563' : '#E5E7EB'} />
                                                <XAxis
                                                    dataKey="code"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={70}
                                                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                                                />
                                                <YAxis
                                                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                                                    label={{
                                                        value: 'Completion %',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        fill: theme === 'dark' ? '#D1D5DB' : '#4B5563'
                                                    }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                                        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                                        color: theme === 'dark' ? '#F3F4F6' : '#111827'
                                                    }}
                                                    formatter={(value) => [`${value}%`, 'Completion']}
                                                    labelFormatter={(label) => `Subject: ${label}`}
                                                />
                                                <Bar
                                                    dataKey="progress"
                                                    name="Completion %"
                                                    fill="#4F46E5"
                                                    radius={[4, 4, 0, 0]}
                                                >
                                                    {getKpiData().map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.progress === 100 ? '#10B981' : COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Detailed Subject Progress */}
                                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg backdrop-blur-sm`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                                        Subject Progress Details
                                    </h3>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Subject
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Year/Semester
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Progress
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Modules Completed
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                {getKpiData().map((subject) => (
                                                    <tr key={subject.subjectId}>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            <div className="font-medium max-w-[300px] break-words whitespace-normal">
                                                                {subject.name}
                                                            </div>
                                                            <div className={`text-sm ${secondaryText}`}>{subject.code}</div>
                                                        </td>

                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            Year {subject.year}, Sem {subject.semester}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            <div className="flex items-center">
                                                                <div className="w-32 mr-2">
                                                                    <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                                                                        <div
                                                                            className={`h-2.5 rounded-full ${subject.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                                            style={{ width: `${subject.progress}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-sm ${subject.progress === 100 ? 'text-green-500' : 'text-indigo-500'}`}>
                                                                    {subject.progress}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            {subject.completed} / {subject.total}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${subject.progress === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                                                                    subject.progress >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                                                                        subject.progress >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                                                                            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                                                                {subject.progress === 100 ? 'Completed' :
                                                                    subject.progress >= 70 ? 'Good Progress' :
                                                                        subject.progress >= 40 ? 'In Progress' : 'Needs Attention'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* KRA Summary */}
                                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg backdrop-blur-sm`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                                        Key Result Areas (By Semester)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800/80' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} border ${borderColor} shadow-md hover:shadow-lg transition-all`}>
                                            <h4 className={`text-md font-medium ${textColor} mb-3`}>
                                                Semester-wise Progress Distribution
                                            </h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getKraData()}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={renderCustomizedLabel}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="avgProgress"
                                                        >
                                                            {getKraData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                                                color: theme === 'dark' ? '#F3F4F6' : '#111827'
                                                            }}
                                                            formatter={(value) => [`${value}%`, 'Average Completion']}
                                                            labelFormatter={(label) => `Semester: ${label}`}
                                                        />
                                                        <Legend
                                                            wrapperStyle={{
                                                                paddingTop: '20px'
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800/80' : 'bg-gradient-to-br from-purple-50 to-pink-50'} border ${borderColor} shadow-md hover:shadow-lg transition-all`}>
                                            <h4 className={`text-md font-medium ${textColor} mb-3`}>
                                                Yearly Progress Trend
                                            </h4>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={getYearlyProgressData()}
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4B5563' : '#E5E7EB'} />
                                                        <XAxis
                                                            dataKey="name"
                                                            tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                                                            label={{
                                                                value: 'Completion %',
                                                                angle: -90,
                                                                position: 'insideLeft',
                                                                fill: theme === 'dark' ? '#D1D5DB' : '#4B5563'
                                                            }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                                                color: theme === 'dark' ? '#F3F4F6' : '#111827'
                                                            }}
                                                            formatter={(value) => [`${value}%`, 'Average Completion']}
                                                            labelFormatter={(label) => `Year: ${label}`}
                                                        />
                                                        <Bar
                                                            dataKey="progress"
                                                            name="Completion %"
                                                            fill="#4F46E5"
                                                            radius={[4, 4, 0, 0]}
                                                        >
                                                            {getYearlyProgressData().map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* KRA Detailed Table */}
                                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg backdrop-blur-sm`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                                        Semester-wise Key Results
                                    </h3>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Semester
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Subjects
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Modules Completed
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Average Progress
                                                    </th>
                                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                {getKraData().map((kra) => (
                                                    <tr key={kra.name}>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            <div className="font-medium">{kra.name}</div>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            {kra.subjects}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            {kra.completedModules} / {kra.totalModules}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            <div className="flex items-center">
                                                                <div className="w-32 mr-2">
                                                                    <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                                                                        <div
                                                                            className={`h-2.5 rounded-full ${kra.avgProgress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                                            style={{ width: `${kra.avgProgress}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-sm ${kra.avgProgress === 100 ? 'text-green-500' : 'text-indigo-500'}`}>
                                                                    {kra.avgProgress}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${kra.avgProgress === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                                                                    kra.avgProgress >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                                                                        kra.avgProgress >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                                                                            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                                                                {kra.avgProgress === 100 ? 'Completed' :
                                                                    kra.avgProgress >= 70 ? 'On Track' :
                                                                        kra.avgProgress >= 40 ? 'In Progress' : 'Needs Focus'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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