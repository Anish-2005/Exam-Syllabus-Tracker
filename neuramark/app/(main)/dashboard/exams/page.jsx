// app/dashboard/exams/page.js
'use client'
import { Suspense } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../components/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../components/lib/firebase';
import { useTheme } from '../../../components/ThemeContext';
import { User, Menu, Moon, Sun, Plus, Trash2, Edit, Save, X, Calendar, Clock, BookOpen, GraduationCap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExamsPage() {
    const { user } = useAuth();
    const router=useRouter();
    const { theme, toggleTheme, isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddExam, setShowAddExam] = useState(false);
    const [newExam, setNewExam] = useState({
        name: '',
        date: '',
        time: '',
        subject: '',
        location: '',
        notes: ''
    });
    const [editingExamId, setEditingExamId] = useState(null);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

    const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = isDark ? 'text-gray-300' : 'text-gray-600';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const inputBg = isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';

    useEffect(() => {
        if (!user) return;

        const fetchExams = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'userExams'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const examsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setExams(examsData);
            } catch (error) {
                console.error('Error fetching exams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [user]);

    const filteredExams = exams.filter(exam => {
        const now = new Date();
        const examDate = new Date(`${exam.date}T${exam.time || '00:00'}`);

        if (filter === 'upcoming') return examDate >= now;
        if (filter === 'past') return examDate < now;
        return true; // 'all'
    });

    const handleAddExam = async () => {
        if (!newExam.name || !newExam.date) {
            alert('Exam name and date are required');
            return;
        }

        try {
            const examData = {
                ...newExam,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (editingExamId) {
                await updateDoc(doc(db, 'userExams', editingExamId), examData);
                setExams(exams.map(exam =>
                    exam.id === editingExamId ? { ...exam, ...examData } : exam
                ));
            } else {
                const docRef = await addDoc(collection(db, 'userExams'), examData);
                setExams([...exams, { id: docRef.id, ...examData }]);
            }

            setShowAddExam(false);
            setNewExam({
                name: '',
                date: '',
                time: '',
                subject: '',
                location: '',
                notes: ''
            });
            setEditingExamId(null);
        } catch (error) {
            console.error('Error saving exam:', error);
            alert('Failed to save exam. Please try again.');
        }
    };

    const handleDeleteExam = async (examId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this exam?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'userExams', examId));
            setExams(exams.filter(exam => exam.id !== examId));
        } catch (error) {
            console.error('Error deleting exam:', error);
            alert('Failed to delete exam.');
        }
    };

    const handleEditExam = (exam) => {
        setEditingExamId(exam.id);
        setNewExam({
            name: exam.name,
            date: exam.date,
            time: exam.time || '',
            subject: exam.subject || '',
            location: exam.location || '',
            notes: exam.notes || ''
        });
        setShowAddExam(true);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getDaysRemaining = (dateString) => {
        const today = new Date();
        const examDate = new Date(dateString);
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays > 1) return `${diffDays} days remaining`;
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        return '';
    };

    return (
        <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
                <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                    <nav className={`${cardBg} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16 md:h-20">
                                {/* Left Section */}
                                <div className="flex items-center space-x-3 min-w-0">
                                    <Link
                                        href="/dashboard"
                                        className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                        My Exams
                                    </h1>
                                </div>

                                {/* Desktop Controls */}
                                <div className="hidden md:flex items-center space-x-4">
                                   

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
                                        <h2 className={`font-bold text-lg sm:text-xl ${textColor}`}>
                                            My Exams
                                        </h2>
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
                                        className={`px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/dashboard/progress'
                                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                                : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        Chat
                                    </Link>
                                </div>

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
                        <div className={`${cardBg} p-4 rounded-lg shadow mb-6 ${borderColor} border`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-xl font-bold">My Exam Schedule</h2>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className={`flex-1 sm:w-auto pl-3 pr-8 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="past">Past</option>
                                        <option value="all">All Exams</option>
                                    </select>

                                    <button
                                        onClick={() => setShowAddExam(true)}
                                        className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        <span className="hidden sm:inline">Add Exam</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add/Edit Exam Modal */}
                        {showAddExam && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className={`${cardBg} rounded-lg shadow-xl p-6 w-full max-w-md ${borderColor} border`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className={`text-xl font-bold ${textColor}`}>
                                            {editingExamId ? 'Edit Exam' : 'Add New Exam'}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowAddExam(false);
                                                setEditingExamId(null);
                                                setNewExam({
                                                    name: '',
                                                    date: '',
                                                    time: '',
                                                    subject: '',
                                                    location: '',
                                                    notes: ''
                                                });
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Exam Name*</label>
                                            <input
                                                type="text"
                                                value={newExam.name}
                                                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                                                className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                placeholder="e.g., Midterm, Final Exam"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Date*</label>
                                                <input
                                                    type="date"
                                                    value={newExam.date}
                                                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                                    className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Time</label>
                                                <input
                                                    type="time"
                                                    value={newExam.time}
                                                    onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                                                    className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Subject</label>
                                            <input
                                                type="text"
                                                value={newExam.subject}
                                                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                                                className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                placeholder="e.g., Mathematics, Physics"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Location</label>
                                            <input
                                                type="text"
                                                value={newExam.location}
                                                onChange={(e) => setNewExam({ ...newExam, location: e.target.value })}
                                                className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                placeholder="e.g., Room 101, Building A"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Notes</label>
                                            <textarea
                                                value={newExam.notes}
                                                onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                                                rows={3}
                                                className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                placeholder="Any additional notes..."
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                onClick={() => {
                                                    setShowAddExam(false);
                                                    setEditingExamId(null);
                                                    setNewExam({
                                                        name: '',
                                                        date: '',
                                                        time: '',
                                                        subject: '',
                                                        location: '',
                                                        notes: ''
                                                    });
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddExam}
                                                disabled={!newExam.name || !newExam.date}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {editingExamId ? 'Update Exam' : 'Save Exam'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Exams List */}
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : filteredExams.length > 0 ? (
                            <div className="space-y-4">
                                {filteredExams.map((exam) => {
                                    const isPast = new Date(`${exam.date}T${exam.time || '00:00'}`) < new Date();
                                    return (
                                        <div
                                            key={exam.id}
                                            className={`${cardBg} p-4 rounded-lg shadow ${borderColor} border ${isPast ? 'opacity-80' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" />
                                                        <h3 className={`text-lg font-medium ${textColor}`}>{exam.name}</h3>
                                                    </div>
                                                    {exam.subject && (
                                                        <p className={`text-sm ${secondaryText} mt-1`}>
                                                            <BookOpen size={14} className="inline mr-1" />
                                                            {exam.subject}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditExam(exam)}
                                                        className={`p-1.5 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                    >
                                                        <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExam(exam.id)}
                                                        className={`p-1.5 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                    >
                                                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className={`flex items-start gap-2 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                    <Calendar size={16} className="mt-0.5 text-indigo-600 dark:text-indigo-400" />
                                                    <div>
                                                        <p className={`text-sm ${secondaryText}`}>Date</p>
                                                        <p className={textColor}>{formatDate(exam.date)}</p>
                                                        {!isPast && (
                                                            <p className={`text-xs mt-1 ${isPast ? 'text-gray-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                                {getDaysRemaining(exam.date)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {exam.time && (
                                                    <div className={`flex items-start gap-2 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                        <Clock size={16} className="mt-0.5 text-indigo-600 dark:text-indigo-400" />
                                                        <div>
                                                            <p className={`text-sm ${secondaryText}`}>Time</p>
                                                            <p className={textColor}>{formatTime(exam.time)}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {exam.location && (
                                                    <div className={`flex items-start gap-2 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="mt-0.5 text-indigo-600 dark:text-indigo-400"
                                                        >
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        <div>
                                                            <p className={`text-sm ${secondaryText}`}>Location</p>
                                                            <p className={textColor}>{exam.location}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {exam.notes && (
                                                    <div className={`col-span-1 sm:col-span-2 flex items-start gap-2 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="mt-0.5 text-indigo-600 dark:text-indigo-400"
                                                        >
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                            <line x1="16" y1="13" x2="8" y2="13" />
                                                            <line x1="16" y1="17" x2="8" y2="17" />
                                                            <polyline points="10 9 9 9 8 9" />
                                                        </svg>
                                                        <div>
                                                            <p className={`text-sm ${secondaryText}`}>Notes</p>
                                                            <p className={textColor}>{exam.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={`${cardBg} p-6 rounded-lg shadow flex flex-col items-center justify-center h-64 ${borderColor} border`}>
                                <BookOpen size={32} className="text-gray-400 mb-4" />
                                <p className={secondaryText}>No exams found</p>
                                <button
                                    onClick={() => setShowAddExam(true)}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Add Your First Exam
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </Suspense>
        </ProtectedRoute>
    );
}