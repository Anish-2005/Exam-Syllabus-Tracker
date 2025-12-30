// app/admin/kra-kpi/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/context/ThemeContext';
import { Menu, BarChart2, Target, Award, TrendingUp, User, Mail, ChevronDown, ChevronUp, RefreshCw, ArrowLeft, Sun, Moon, X, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter, usePathname } from 'next/navigation';
import MobileSidebar from './components/MobileSidebar';
import UserTable from './components/UserTable';
import KPICharts from './components/KPICharts';
import Navbar from '@/app/components/Navbar';
import {
    calculateProgress, UserData, SyllabusDataMap, UserProgressMap, KpiData, KraData, YearlyProgressData
} from './components/utils';
export default function AdminKraKpiPage() {
    const { user: currentUser } = useAuth();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    // --- Types ---
    interface UserData {
        id: string;
        name: string;
        email: string;
        photoURL: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }
    const [users, setUsers] = useState<UserData[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userProgress, setUserProgress] = useState<UserProgressMap>({});
    const [syllabusData, setSyllabusData] = useState<SyllabusDataMap>({});
    const { theme, toggleTheme, isDark } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('kpi');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    // Enhanced theme styles
    const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
    const cardBg = isDark ? 'bg-gray-800/90 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg';
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
    const borderColor = isDark ? 'border-gray-700' : 'border-purple-200';
    const inputBg = isDark ? 'bg-gray-700/80 text-white' : 'bg-white/90 text-gray-900';
    const activeTabBg = isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500';
    const inactiveTabBg = isDark ? 'bg-gray-700/50' : 'bg-white/60';

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData: UserData[] = [];

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
            const sortedUsers = usersData.sort(
                (a, b) =>
                    ((b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0))
            );
            setUsers(sortedUsers);

            // Fetch syllabus data
            const syllabusSnapshot = await getDocs(collection(db, 'syllabus'));
            const syllabusMap: SyllabusDataMap = {};
            syllabusSnapshot.forEach((doc) => {
                const data = doc.data();
                syllabusMap[doc.id] = {
                    name: data.name,
                    code: data.code,
                    year: data.year,
                    semester: data.semester,
                    modules: data.modules,
                    ...data // include any additional properties if needed
                };
            });
            setSyllabusData(syllabusMap);

            // Fetch progress for each user
            const progressData: UserProgressMap = {};
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
    }, []);

    useEffect(() => {
        if (currentUser && currentUser.email === "anishseth0510@gmail.com") {
            setIsAdmin(true);
            fetchAllData();
        }
    }, [currentUser, fetchAllData]);

    interface CalculateProgressResult {
        percentage: number;
        completedCount: number;
        totalModules: number;
    }

    interface SubjectProgress {
        [moduleKey: string]: boolean;
    }

    const calculateProgress = (
        subjectProgress: SubjectProgress,
        subjectId: string
    ): CalculateProgressResult => {
        const subjectInfo = syllabusData[subjectId];
        const totalModules = subjectInfo && subjectInfo.modules ? subjectInfo.modules.length : 0;
        let completedCount = 0;

        if (!subjectInfo || !subjectInfo.modules || totalModules === 0) {
            return {
                percentage: 0,
                completedCount: 0,
                totalModules: 0
            };
        }

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

    interface UserKpiProgress {
        [moduleKey: string]: boolean;
    }

    interface UserKpiData {
        subjectId: string;
        name: string;
        code: string;
        progress: number;
        completed: number;
        total: number;
        year: number;
        semester: number;
    }

    const getUserKpiData = (userId: string): UserKpiData[] => {
        const progress: UserKpiProgress | undefined = userProgress[userId];
        if (!progress) return [];
        
        return Object.entries(progress)
            .filter(([key]) => key.startsWith('subject_'))
            .map(([key, value]) => {
                const subjectId = key.replace('subject_', '');
                const subjectInfo = syllabusData[subjectId];
                if (!subjectInfo) return null;
                
                let subjectProgress: UserKpiProgress = {};
                if (typeof value === 'object' && value !== null) {
                    subjectProgress = value as UserKpiProgress;
                }
                const progressResult = calculateProgress(subjectProgress, subjectId);
                
                return {
                    subjectId,
                    name: subjectInfo.name,
                    code: subjectInfo.code,
                    progress: progressResult.percentage,
                    completed: progressResult.completedCount,
                    total: progressResult.totalModules,
                    year: subjectInfo.year,
                    semester: subjectInfo.semester
                };
            })
            .filter((item): item is UserKpiData => item !== null)
            .sort((a, b) => b.progress - a.progress);
    };

    interface KraDataMap {
        [key: string]: KraData;
    }

    const getUserKraData = (userId: string): KraData[] => {
        const kpiData: KpiData[] = getUserKpiData(userId);
        if (kpiData.length === 0) return [];
        
        // Group by year and semester
        const kraData: KraDataMap = {};
        
        kpiData.forEach((item: KpiData) => {
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
        Object.keys(kraData).forEach((key: string) => {
            kraData[key].avgProgress = Math.round(
                (kraData[key].completedModules / kraData[key].totalModules) * 100
            );
        });
        
        return Object.values(kraData);
    };

    interface YearlyProgressDataMap {
        [key: string]: YearlyProgressData;
    }

    const getYearlyProgressData = (userId: string): YearlyProgressData[] => {
        const kpiData: KpiData[] = getUserKpiData(userId);
        if (kpiData.length === 0) return [];
        
        const yearlyData: YearlyProgressDataMap = {};
        
        kpiData.forEach((item: KpiData) => {
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
        Object.keys(yearlyData).forEach((key: string) => {
            yearlyData[key].progress = Math.round(
                (yearlyData[key].completedModules / yearlyData[key].totalModules) * 100
            );
        });
        
        return Object.values(yearlyData);
    };

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
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

    interface FormatDate {
        (date: Date | null): string;
    }

    const formatDate: FormatDate = (date) => {
        if (!date) return 'Unknown';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    interface ToggleUserExpand {
        (userId: string): void;
    }

    const toggleUserExpand: ToggleUserExpand = (userId) => {
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
                <Navbar
                    user={user ? {
                        displayName: user.displayName ?? undefined,
                        email: user.email ?? undefined,
                        photoURL: user.photoURL ?? undefined
                    } : null}
                    logout={logout}
                    toggleTheme={toggleTheme}
                    isDark={isDark}
                    isAdmin={isAdmin}
                />
                <MobileSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isDark={isDark}
                    user={user}
                    loading={loading}
                    fetchAllData={fetchAllData}
                    logout={logout}
                    toggleTheme={toggleTheme}
                    pathname={pathname}
                    secondaryText={secondaryText}
                />
                <main className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ${textColor} py-6`}>
                    <div className={`${cardBg} p-6 sm:p-8 rounded-2xl shadow-2xl ${borderColor} border-2`}>
                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-indigo-600"></div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-xl"></div>
                                </div>
                                <p className={`text-sm font-medium ${secondaryText} animate-pulse`}>Loading analytics data...</p>
                            </div>
                        ) : (
                            <UserTable
                                users={filteredUsers}
                                isDark={isDark}
                                textColor={textColor}
                                secondaryText={secondaryText}
                                borderColor={borderColor}
                                expandedUser={expandedUser}
                                toggleUserExpand={toggleUserExpand}
                                getUserKpiData={getUserKpiData}
                                getUserKraData={getUserKraData}
                                getYearlyProgressData={getYearlyProgressData}
                            />
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}