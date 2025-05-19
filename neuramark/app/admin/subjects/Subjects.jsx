'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/components/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/components/lib/firebase';
import { useTheme } from '@/app/components/ThemeContext';
import { Moon, Sun, Trash2, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
export default function AdminSubjects() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allSubjects, setAllSubjects] = useState([]);
    const { theme, toggleTheme, isDark } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

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
                <nav className={`${cardBg} ${borderColor} border-b shadow-lg sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">

                            {/* Left Section: Back + Logo + Title */}
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/dashboard"
                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Back to Dashboard"
                                >
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

                                <h1 className={`text-lg sm:text-2xl font-bold tracking-tight ${textColor}`}>
                                    Admin – All Subjects
                                </h1>
                            </div>

                            {/* Right Section: Theme Toggle */}
                            <div className="flex items-center">
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


                <main className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${textColor}`}>
                    <div className={`${cardBg} p-6 rounded-lg shadow ${borderColor} border`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-xl font-bold ${textColor}`}>
                                All Subjects ({allSubjects.length})
                            </h2>
                            <button
                                onClick={fetchAllSubjects}
                                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Subject
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Code
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Branch
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Year
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Semester
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Modules
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${secondaryText} uppercase tracking-wider`}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                        {allSubjects.map((subject) => (
                                            <tr key={subject.id} className={`hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleViewSubject(subject)}
                                                            className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300`}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSubject(subject.id)}
                                                            className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300`}
                                                        >
                                                            Delete
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
                            <div className={`text-center py-8 ${secondaryText}`}>
                                No subjects found in the database.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}