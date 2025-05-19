// app/dashboard/kra-kpi/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/components/context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/components/ThemeContext';
import { Sun, Moon, BookOpen, ChevronDown, ChevronUp, RefreshCw, User, BarChart2, Target, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/components/lib/firebase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
export default function KraKpiPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState(null);
    const [syllabusData, setSyllabusData] = useState({});
    const { theme, toggleTheme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('kpi');

    // Theme styles
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const activeTabBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
    const inactiveTabBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';

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
            .filter(item => item !== null)
            .sort((a, b) => b.progress - a.progress);
    };

    const getKraData = () => {
        const kpiData = getKpiData();
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

    const getYearlyProgressData = () => {
        const kpiData = getKpiData();
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

    return (
        <ProtectedRoute>
            <div className={`min-h-screen ${bgColor} transition-colors duration-200 pb-8`}>
                {/* Navigation */}
                <nav className={`${cardBg} ${borderColor} border-b shadow-md sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">

                            {/* Left Section: Logo & Title */}
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/dashboard"
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Back to Dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
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

                                <h1 className={`text-lg sm:text-2xl font-semibold ${textColor} tracking-tight`}>
                                    Learning Analytics Dashboard
                                </h1>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={fetchUserData}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    className={`p-2 rounded-full transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
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
                                    Key Performance Indicators
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

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : !userProgress ? (
                            <div className={`text-center py-8 ${secondaryText}`}>
                                <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No analytics data available</p>
                                <p className="mt-2 text-sm">Your learning analytics will appear here after you make progress in your subjects.</p>
                                <Link href="/dashboard" className={`mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300`}>
                                    Go to Dashboard
                                </Link>
                            </div>
                        ) : activeTab === 'kpi' ? (
                            <div className="space-y-8">
                                {/* Overall Progress Summary */}
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center`}>
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        Overall Learning Progress
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                            <div className={`text-sm ${secondaryText} mb-1`}>Total Subjects</div>
                                            <div className={`text-2xl font-bold ${textColor}`}>
                                                {getKpiData().length}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                                            <div className={`text-sm ${secondaryText} mb-1`}>Total Modules</div>
                                            <div className={`text-2xl font-bold ${textColor}`}>
                                                {getKpiData().reduce((sum, subject) => sum + subject.total, 0)}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
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
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
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
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
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
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
                                    <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
                                        Key Result Areas (By Semester)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
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

                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
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
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
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