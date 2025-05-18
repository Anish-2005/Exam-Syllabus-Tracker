// app/admin/active-users/page.js
'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/components/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/app/components/ThemeContext';
import { RefreshCw,ArrowLeft, User, Mail, Calendar, Clock, Image as ImageIcon, BookOpen, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/app/components/lib/firebase';

export default function UserDataPage() {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [syllabusData, setSyllabusData] = useState({});
    const { theme } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);

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

    const renderProgressData = (userId) => {
        const progress = userProgress[userId];
        if (!progress) return <div className={`text-sm ${secondaryText} italic`}>No progress data</div>;

        return (
            <div className={`mt-2 p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className={`font-medium ${textColor} flex items-center mb-2`}>
                    <BookOpen className="w-4 h-4 mr-2" /> Learning Progress
                </h4>

                {Object.entries(progress).map(([key, value]) => {
                    if (key === 'updatedAt') return null;

                    const subjectId = key.replace('subject_', '');
                    const subjectInfo = syllabusData[subjectId];
                    const subjectName = subjectInfo?.name || `Subject: ${subjectId}`;
                    const subjectCode = subjectInfo?.code ? `(${subjectInfo.code})` : '';

                    return (
                        <div key={key} className="mb-4">
                            <div className={`font-medium ${textColor} flex items-center justify-between`}>
                                <span>
                                    {subjectName} {subjectCode}
                                    {subjectInfo?.branch && (
                                        <span className={`text-xs ml-2 ${secondaryText}`}>
                                            {subjectInfo.branch} • Year {subjectInfo.year} • Sem {subjectInfo.semester}
                                        </span>
                                    )}
                                </span>
                            </div>

                            {typeof value === 'object' && value !== null ? (
                                <div className="ml-4 mt-2">
                                    {Object.entries(value).map(([moduleKey, moduleValue]) => {
                                        if (!moduleKey.startsWith('module_')) return null;

                                        const moduleIndex = parseInt(moduleKey.replace('module_', ''));
                                        const moduleInfo = subjectInfo?.modules?.[moduleIndex];
                                        const moduleName = moduleInfo?.name || `Module ${moduleIndex}`;

                                        return (
                                            <div key={moduleKey} className="mb-2">
                                                <div className="flex items-center">
                                                    <span className={`text-sm font-medium ${secondaryText}`}>
                                                        {moduleName}:
                                                    </span>
                                                    <span className={`ml-2 text-sm ${moduleValue ? 'text-green-500' : 'text-yellow-500'}`}>
                                                        {moduleValue ? 'Completed' : 'In Progress'}
                                                    </span>
                                                </div>

                                                {moduleInfo?.topics && (
                                                    <div className="ml-4 mt-1">
                                                        <div className={`text-xs ${secondaryText} font-medium`}>Topics:</div>
                                                        <ul className="list-disc list-inside">
                                                            {moduleInfo.topics.map((topic, i) => (
                                                                <li key={i} className={`text-xs ${secondaryText}`}>
                                                                    {topic}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="ml-4">
                                    <span className={`text-sm ${secondaryText}`}>
                                        {value.toString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {progress.updatedAt && (
                    <div className={`text-xs ${secondaryText} mt-2`}>
                        Last updated: {formatDate(progress.updatedAt.toDate())}
                    </div>
                )}
            </div>
        );
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
            <div className={`min-h-screen ${bgColor} transition-colors duration-200 pb-8`}>
                {/* Navigation */}
                <nav className={`${cardBg} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            <div className="flex items-center space-x-2">
                                <Link href="/dashboard" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <ArrowLeft size={20} />
                                </Link>
                                <Image
                                    src="/emblem.png"
                                    alt="NeuraMark Logo"
                                    width={36}
                                    height={36}
                                    className="rounded-sm shadow-sm"
                                    priority
                                />
                                <h1 className={`text-lg sm:text-2xl font-bold ${textColor} tracking-tight`}>
                                    User Database
                                </h1>
                            </div>
                            <button
                                onClick={fetchAllData}
                                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ${textColor}`}>
                    <div className={`${cardBg} p-4 sm:p-6 rounded-lg shadow ${borderColor} border mt-4`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <h2 className={`text-xl font-bold ${textColor} mb-4 sm:mb-0`}>
                                {users.length} Registered Users
                            </h2>
                            <div className="flex space-x-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className={`px-3 py-1 border rounded-md text-sm w-full sm:w-64 ${borderColor} ${bgColor}`}
                                // Add search functionality here
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Mobile Cards */}
                                <div className="sm:hidden space-y-4">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border ${borderColor}`}
                                        >
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

                                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <div className={`${secondaryText}`}>Created</div>
                                                    <div>{formatDate(user.createdAt)}</div>
                                                </div>
                                                <div>
                                                    <div className={`${secondaryText}`}>Updated</div>
                                                    <div>{formatDate(user.updatedAt)}</div>
                                                </div>
                                                <div>
                                                    <div className={`${secondaryText}`}>Progress</div>
                                                    <div className={userProgress[user.id] ? 'text-green-500' : secondaryText}>
                                                        {userProgress[user.id] ? 'Has progress' : 'No data'}
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedUser === user.id && (
                                                <div className="mt-4 pt-4 border-t ${borderColor}">
                                                    {renderProgressData(user.id)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-1" />
                                                    <span className={secondaryText}>User</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 mr-1" />
                                                    <span className={secondaryText}>Email</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    <span className={secondaryText}>Created</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span className={secondaryText}>Updated</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    <span className={secondaryText}>Progress</span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                <span className={secondaryText}>Details</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                        {users.map((user) => (
                                            <>
                                                <tr key={user.id} className={`hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
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
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className={`text-sm font-medium ${textColor}`}>
                                                                    {user.name}
                                                                </div>
                                                                <div className={`text-xs ${secondaryText}`}>
                                                                    ID: {user.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className={`text-sm ${secondaryText}`}>
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className={`text-sm ${secondaryText}`}>
                                                            {formatDate(user.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className={`text-sm ${secondaryText}`}>
                                                            {formatDate(user.updatedAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className={`text-sm ${userProgress[user.id] ? 'text-green-500' : secondaryText}`}>
                                                            {userProgress[user.id] ? 'Has progress' : 'No data'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
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
                                                    </td>
                                                </tr>
                                                {expandedUser === user.id && (
                                                    <tr>
                                                        <td colSpan="6" className="px-4 py-4">
                                                            {renderProgressData(user.id)}
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && users.length === 0 && (
                            <div className={`text-center py-8 ${secondaryText}`}>
                                <User size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No user data available</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}