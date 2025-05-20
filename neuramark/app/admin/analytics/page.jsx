// app/admin/kra-kpi/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/components/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/components/ThemeContext';
import { Menu,BarChart2, Target, Award, TrendingUp, User, Mail, ChevronDown, ChevronUp, RefreshCw, ArrowLeft, Sun, Moon,X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/components/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
export default function AdminKraKpiPage() {
    const { user: currentUser } = useAuth();
    const { user, logout } = useAuth();
    const router=useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userProgress, setUserProgress] = useState({});
    const [syllabusData, setSyllabusData] = useState({});
    const { theme, toggleTheme, isDark } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('kpi');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);

    // Theme styles
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';
    const activeTabBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
    const inactiveTabBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

    const getUserKpiData = (userId) => {
        const progress = userProgress[userId];
        if (!progress) return [];
        
        return Object.entries(progress)
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
            .filter(item => item !== null)
            .sort((a, b) => b.progress - a.progress);
    };

    const getUserKraData = (userId) => {
        const kpiData = getUserKpiData(userId);
        if (kpiData.length === 0) return [];
        
        // Group by year and semester
        const kraData = {};
        
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

    const getYearlyProgressData = (userId) => {
        const kpiData = getUserKpiData(userId);
        if (kpiData.length === 0) return [];
        
        const yearlyData = {};
        
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

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
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
                                    Learning Analytics
                                </h1>
                            </div>

                            {/* Desktop Controls */}
                            <div className="hidden md:flex items-center space-x-4">
                                <button
                                    onClick={fetchAllData}
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
                <main className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ${textColor}`}>
                    <div className={`${cardBg} p-4 sm:p-6 rounded-lg shadow ${borderColor} border mt-4`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h2 className={`text-xl font-bold ${textColor} mb-1`}>
                                    User Learning Analytics
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {currentUser?.photoURL ? (
                                        <Image
                                            src={currentUser.photoURL}
                                            alt={currentUser.displayName || 'Admin'}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300`}>
                                            <User size={14} />
                                        </div>
                                    )}
                                    <span className={`text-sm ${secondaryText}`}>{currentUser?.email}</span>
                                </div>
                            </div>
                            
                            <div className="flex mt-4 sm:mt-0 space-x-2">
                                <button
                                    onClick={() => setActiveTab('kpi')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'kpi' ? `${activeTabBg} ${textColor}` : `${inactiveTabBg} ${secondaryText}`}`}
                                >
                                    <div className="flex items-center">
                                        <Target className="w-4 h-4 mr-2" />
                                        KPIs
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('kra')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'kra' ? `${activeTabBg} ${textColor}` : `${inactiveTabBg} ${secondaryText}`}`}
                                >
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 mr-2" />
                                        KRAs
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md text-sm ${borderColor} ${inputBg}`}
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredUsers.map((user) => {
                                    const userKpiData = getUserKpiData(user.id);
                                    const userKraData = getUserKraData(user.id);
                                    const yearlyProgressData = getYearlyProgressData(user.id);
                                    const hasProgress = userKpiData.length > 0;

                                    return (
                                        <div key={user.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {user.photoURL ? (
                                                        <Image
                                                            src={user.photoURL}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                    ) : (
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300`}>
                                                            <User size={18} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className={`font-medium ${textColor}`}>{user.name}</div>
                                                        <div className={`text-xs ${secondaryText}`}>{user.email}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleUserExpand(user.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    {expandedUser === user.id ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                    <div className={`${secondaryText}`}>Created</div>
                                                    <div>{formatDate(user.createdAt)}</div>
                                                </div>
                                                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                    <div className={`${secondaryText}`}>Updated</div>
                                                    <div>{formatDate(user.updatedAt)}</div>
                                                </div>
                                                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                    <div className={`${secondaryText}`}>Subjects</div>
                                                    <div>{userKpiData.length}</div>
                                                </div>
                                                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                    <div className={`${secondaryText}`}>Avg Progress</div>
                                                    <div>
                                                        {hasProgress ? (
                                                            `${Math.round(
                                                                userKpiData.reduce((sum, subject) => sum + subject.completed, 0) / 
                                                                userKpiData.reduce((sum, subject) => sum + subject.total, 0) * 100
                                                            )}%`
                                                        ) : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedUser === user.id && (
                                                <div className="mt-4 pt-4 border-t ${borderColor}">
                                                    {activeTab === 'kpi' ? (
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h3 className={`text-lg font-semibold ${textColor} mb-3 flex items-center`}>
                                                                    <BarChart2 className="w-5 h-5 mr-2" />
                                                                    Subject-wise Performance
                                                                </h3>
                                                                
                                                                {hasProgress ? (
                                                                    <>
                                                                        <div className="h-64">
                                                                            <ResponsiveContainer width="100%" height="100%">
                                                                                <BarChart
                                                                                    data={userKpiData}
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
                                                                                        {userKpiData.map((entry, index) => (
                                                                                            <Cell 
                                                                                                key={`cell-${index}`} 
                                                                                                fill={entry.progress === 100 ? '#10B981' : COLORS[index % COLORS.length]} 
                                                                                            />
                                                                                        ))}
                                                                                    </Bar>
                                                                                </BarChart>
                                                                            </ResponsiveContainer>
                                                                        </div>

                                                                        <div className="overflow-x-auto mt-6">
                                                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                                                <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                                                    <tr>
                                                                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                            Subject
                                                                                        </th>
                                                                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                            Year/Semester
                                                                                        </th>
                                                                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                            Progress
                                                                                        </th>
                                                                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                            Modules
                                                                                        </th>
                                                                                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                            Status
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                                                    {userKpiData.map((subject) => (
                                                                                        <tr key={subject.subjectId}>
                                                                                            <td className={`px-4 py-4 ${textColor}`}>
                                                                                                <div className="font-medium">{subject.name}</div>
                                                                                                <div className={`text-xs ${secondaryText}`}>{subject.code}</div>
                                                                                            </td>
                                                                                            <td className={`px-4 py-4 ${textColor}`}>
                                                                                                Y{subject.year}, S{subject.semester}
                                                                                            </td>
                                                                                            <td className={`px-4 py-4 ${textColor}`}>
                                                                                                <div className="flex items-center">
                                                                                                    <div className="w-24 mr-2">
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
                                                                                            <td className={`px-4 py-4 ${textColor}`}>
                                                                                                {subject.completed}/{subject.total}
                                                                                            </td>
                                                                                            <td className={`px-4 py-4 ${textColor}`}>
                                                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                                                    ${subject.progress === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 
                                                                                                    subject.progress >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 
                                                                                                    subject.progress >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' : 
                                                                                                    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                                                                                                    {subject.progress === 100 ? 'Completed' : 
                                                                                                    subject.progress >= 70 ? 'Good' : 
                                                                                                    subject.progress >= 40 ? 'Progress' : 'Needs Focus'}
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className={`text-center py-8 ${secondaryText}`}>
                                                                        <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
                                                                        <p>No KPI data available for this user</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h3 className={`text-lg font-semibold ${textColor} mb-3 flex items-center`}>
                                                                    <Award className="w-5 h-5 mr-2" />
                                                                    Semester-wise Key Results
                                                                </h3>
                                                                
                                                                {userKraData.length > 0 ? (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                                            <h4 className={`text-md font-medium ${textColor} mb-3`}>
                                                                                Semester Progress Distribution
                                                                            </h4>
                                                                            <div className="h-64">
                                                                                <ResponsiveContainer width="100%" height="100%">
                                                                                    <PieChart>
                                                                                        <Pie
                                                                                            data={userKraData}
                                                                                            cx="50%"
                                                                                            cy="50%"
                                                                                            labelLine={false}
                                                                                            label={renderCustomizedLabel}
                                                                                            outerRadius={80}
                                                                                            fill="#8884d8"
                                                                                            dataKey="avgProgress"
                                                                                        >
                                                                                            {userKraData.map((entry, index) => (
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
                                                                        
                                                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                                            <h4 className={`text-md font-medium ${textColor} mb-3`}>
                                                                                Yearly Progress Trend
                                                                            </h4>
                                                                            <div className="h-64">
                                                                                <ResponsiveContainer width="100%" height="100%">
                                                                                    <BarChart
                                                                                        data={yearlyProgressData}
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
                                                                                            {yearlyProgressData.map((entry, index) => (
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
                                                                ) : (
                                                                    <div className={`text-center py-8 ${secondaryText}`}>
                                                                        <Award size={48} className="mx-auto mb-4 opacity-50" />
                                                                        <p>No KRA data available for this user</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {userKraData.length > 0 && (
                                                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                                                    <h4 className={`text-md font-medium ${textColor} mb-3`}>
                                                                        Semester Performance Details
                                                                    </h4>
                                                                    
                                                                    <div className="overflow-x-auto">
                                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                                            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                                                <tr>
                                                                                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                        Semester
                                                                                    </th>
                                                                                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                        Subjects
                                                                                    </th>
                                                                                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                        Modules
                                                                                    </th>
                                                                                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                        Progress
                                                                                    </th>
                                                                                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                                                        Status
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                                                {userKraData.map((kra) => (
                                                                                    <tr key={kra.name}>
                                                                                        <td className={`px-4 py-4 ${textColor}`}>
                                                                                            {kra.name}
                                                                                        </td>
                                                                                        <td className={`px-4 py-4 ${textColor}`}>
                                                                                            {kra.subjects}
                                                                                        </td>
                                                                                        <td className={`px-4 py-4 ${textColor}`}>
                                                                                            {kra.completedModules}/{kra.totalModules}
                                                                                        </td>
                                                                                        <td className={`px-4 py-4 ${textColor}`}>
                                                                                            <div className="flex items-center">
                                                                                                <div className="w-24 mr-2">
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
                                                                                        <td className={`px-4 py-4 ${textColor}`}>
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
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {!loading && filteredUsers.length === 0 && (
                                    <div className={`text-center py-8 ${secondaryText}`}>
                                        <User size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>{searchQuery ? 'No matching users found' : 'No user data available'}</p>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}