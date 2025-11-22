// app/dashboard/exams/page.js
'use client'
import { Suspense } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useTheme } from '../../../context/ThemeContext';
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
        semester: '',
        location: '',
        notes: ''
    });
    const [editingExamId, setEditingExamId] = useState(null);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [expandedExamId, setExpandedExamId] = useState(null);

    const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
    const cardBg = isDark ? 'bg-gray-800/90 backdrop-blur-lg' : 'bg-white/80 backdrop-blur-lg';
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
    const borderColor = isDark ? 'border-gray-700' : 'border-purple-200';
    const inputBg = isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';

    useEffect(() => {
        if (!user) return;

        const fetchExams = async () => {
            setLoading(true);
            try {
                // Fetch exams
                const q = query(collection(db, 'userExams'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const examsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setExams(examsData);

                // Fetch enrolled subjects to get semesters
                const progressQuery = query(collection(db, 'userProgress'), where('userId', '==', user.uid));
                const progressSnapshot = await getDocs(progressQuery);
                const subjectIds = progressSnapshot.docs.map(doc => doc.data().subjectId);

                if (subjectIds.length > 0) {
                    const syllabusQuery = query(collection(db, 'syllabus'));
                    const syllabusSnapshot = await getDocs(syllabusQuery);
                    const subjects = syllabusSnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(subject => subjectIds.includes(subject.id));
                    setEnrolledSubjects(subjects);
                }

                // Fetch user's saved semester preference
                const userPrefsRef = doc(db, 'userPreferences', user.uid);
                const userPrefsDoc = await getDoc(userPrefsRef);
                if (userPrefsDoc.exists() && userPrefsDoc.data().defaultSemesterExams) {
                    setSelectedSemester(userPrefsDoc.data().defaultSemesterExams);
                }
            } catch (error) {
                console.error('Error fetching exams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [user]);

    const getAvailableSemesters = () => {
        // Get semesters from both exams and enrolled subjects
        const examSemesters = exams.map(exam => exam.semester).filter(Boolean);
        const subjectSemesters = enrolledSubjects.map(subject => subject.semester).filter(Boolean);
        const semesters = new Set([...examSemesters, ...subjectSemesters]);
        return Array.from(semesters).sort();
    };

    const handleSemesterChange = async (semester) => {
        setSelectedSemester(semester);
        try {
            await setDoc(doc(db, 'userPreferences', user.uid), {
                defaultSemesterExams: semester
            }, { merge: true });
        } catch (error) {
            console.error('Error saving semester preference:', error);
        }
    };

    const filteredExams = exams.filter(exam => {
        const now = new Date();
        const examDate = new Date(`${exam.date}T${exam.time || '00:00'}`);

        // Filter by time
        let timeMatch = true;
        if (filter === 'upcoming') timeMatch = examDate >= now;
        else if (filter === 'past') timeMatch = examDate < now;

        // Filter by semester
        let semesterMatch = true;
        if (selectedSemester !== 'all') {
            semesterMatch = exam.semester === selectedSemester;
        }

        return timeMatch && semesterMatch;
    }).sort((a, b) => {
        const now = new Date();
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        
        // Sort upcoming exams: nearest first (ascending)
        if (filter === 'upcoming') {
            return dateA - dateB;
        }
        // Sort past exams: most recent first (descending)
        else if (filter === 'past') {
            return dateB - dateA;
        }
        // Sort all exams: upcoming first (nearest), then past (most recent)
        else {
            const isAPast = dateA < now;
            const isBPast = dateB < now;
            
            if (isAPast && !isBPast) return 1; // B is upcoming, A is past
            if (!isAPast && isBPast) return -1; // A is upcoming, B is past
            if (!isAPast && !isBPast) return dateA - dateB; // Both upcoming, nearest first
            return dateB - dateA; // Both past, most recent first
        }
    });

    const handleAddExam = async () => {
        if (!newExam.name || !newExam.date || !newExam.semester) {
            alert('Exam name, date, and semester are required');
            return;
        }

        try {
            const examData = {
                ...newExam,
                userId: user.uid,
                semester: parseInt(newExam.semester),
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
            semester: exam.semester ? exam.semester.toString() : '',
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
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
                                            My Exams
                                        </h1>
                                        <p className={`text-xs ${secondaryText} hidden sm:block`}>Exam Schedule & Tracker</p>
                                    </div>
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

                    <main className={`max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8 ${textColor}`}>
                        <div className={`${cardBg} p-6 rounded-2xl shadow-xl mb-6 ${borderColor} border-2`}>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-40"></div>
                                            <div className="relative p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                                                <Calendar className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <h2 className={`text-xl font-bold ${textColor}`}>My Exam Schedule</h2>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <select
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className={`flex-1 sm:w-auto pl-3 pr-8 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} shadow-sm hover:shadow-md transition-shadow`}
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="past">Past</option>
                                            <option value="all">All Exams</option>
                                        </select>

                                        <button
                                            onClick={() => setShowAddExam(true)}
                                            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 font-medium"
                                        >
                                            <Plus size={18} />
                                            <span className="hidden sm:inline">Add Exam</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Semester Filter */}
                                {getAvailableSemesters().length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-sm font-medium ${secondaryText} self-center mr-2`}>Filter by Semester:</span>
                                        <button
                                            onClick={() => handleSemesterChange('all')}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                                                selectedSemester === 'all'
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                    : isDark
                                                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 shadow-sm'
                                                    : 'bg-white/80 text-gray-700 hover:bg-purple-50 shadow-sm border border-purple-200'
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
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                        : isDark
                                                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 shadow-sm'
                                                        : 'bg-white/80 text-gray-700 hover:bg-purple-50 shadow-sm border border-purple-200'
                                                }`}
                                            >
                                                Semester {semester}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add/Edit Exam Modal */}
                        <AnimatePresence>
                            {showAddExam && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`${cardBg} rounded-2xl shadow-2xl p-6 w-full max-w-md ${borderColor} border-2`}
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className={`text-xl font-bold ${textColor}`}>
                                                {editingExamId ? 'Edit Exam' : 'Add New Exam'}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowAddExam(false);
                                                setEditingExamId(null);
                                                setNewExam({
                                                    name: '',
                                                    date: '',
                                                    time: '',
                                                    subject: '',
                                                    semester: '',
                                                    location: '',
                                                    notes: ''
                                                });
                                            }}
                                            className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
                                                className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
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
                                                    className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Time</label>
                                                <input
                                                    type="time"
                                                    value={newExam.time}
                                                    onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                                                    className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Subject</label>
                                            <input
                                                type="text"
                                                value={newExam.subject}
                                                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                                                className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
                                                placeholder="e.g., Mathematics, Physics"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Semester*</label>
                                            <select
                                                value={newExam.semester}
                                                onChange={(e) => setNewExam({ ...newExam, semester: e.target.value })}
                                                className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
                                            >
                                                <option value="">Select Semester</option>
                                                {getAvailableSemesters().length > 0 ? (
                                                    getAvailableSemesters().map(sem => (
                                                        <option key={sem} value={sem}>Semester {sem}</option>
                                                    ))
                                                ) : (
                                                    Array.from({length: 8}, (_, i) => i + 1).map(sem => (
                                                        <option key={sem} value={sem}>Semester {sem}</option>
                                                    ))
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Location</label>
                                            <input
                                                type="text"
                                                value={newExam.location}
                                                onChange={(e) => setNewExam({ ...newExam, location: e.target.value })}
                                                className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
                                                placeholder="e.g., Room 101, Building A"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Notes</label>
                                            <textarea
                                                value={newExam.notes}
                                                onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                                                rows={3}
                                                className={`w-full pl-3 pr-10 py-2.5 text-base ${borderColor} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg ${inputBg} transition-shadow hover:shadow-md`}
                                                placeholder="Any additional notes..."
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setShowAddExam(false);
                                                    setEditingExamId(null);
                                                    setNewExam({
                                                        name: '',
                                                        date: '',
                                                        time: '',
                                                        subject: '',
                                                        semester: '',
                                                        location: '',
                                                        notes: ''
                                                    });
                                                }}
                                                className="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddExam}
                                                disabled={!newExam.name || !newExam.date || !newExam.semester}
                                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
                                            >
                                                {editingExamId ? 'Update Exam' : 'Save Exam'}
                                            </button>
                                        </div>
                                    </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Exams List */}
                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-indigo-600"></div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-xl"></div>
                                </div>
                                <p className={`text-sm font-medium ${secondaryText} animate-pulse`}>Loading exams...</p>
                            </div>
                        ) : filteredExams.length > 0 ? (
                            <div className="space-y-4">
                                {filteredExams.map((exam) => {
                                    const isPast = new Date(`${exam.date}T${exam.time || '00:00'}`) < new Date();
                                    const isExpanded = expandedExamId === exam.id;
                                    const daysRemainingText = getDaysRemaining(exam.date);
                                    
                                    return (
                                        <motion.div
                                            key={exam.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`${cardBg} rounded-xl shadow-lg hover:shadow-2xl ${borderColor} border-2 transition-all ${isPast ? 'opacity-75' : ''} overflow-hidden`}
                                        >
                                            {/* Brief View - Always Visible */}
                                            <div 
                                                className="p-5 cursor-pointer"
                                                onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-400" />
                                                        <div className="flex-1">
                                                            <h3 className={`text-lg font-semibold ${textColor}`}>{exam.name}</h3>
                                                            <p className={`text-sm font-medium mt-1 ${
                                                                isPast 
                                                                    ? 'text-gray-500 dark:text-gray-400' 
                                                                    : daysRemainingText === 'Today'
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : daysRemainingText === 'Tomorrow'
                                                                    ? 'text-orange-600 dark:text-orange-400'
                                                                    : 'text-indigo-600 dark:text-indigo-400'
                                                            }`}>
                                                                <Clock size={14} className="inline mr-1" />
                                                                {daysRemainingText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditExam(exam);
                                                            }}
                                                            className={`p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'}`}
                                                        >
                                                            <Edit size={18} className="text-blue-600 dark:text-blue-400" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteExam(exam.id);
                                                            }}
                                                            className={`p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'}`}
                                                        >
                                                            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                                                        </button>
                                                        <motion.div
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed View - Expandable */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className={`px-5 pb-5 border-t ${borderColor}`}>
                                                            {exam.subject && (
                                                                <div className="mt-4 mb-3">
                                                                    <p className={`text-sm ${secondaryText} flex items-center gap-2`}>
                                                                        <BookOpen size={14} />
                                                                        <span className="font-medium">Subject:</span> {exam.subject}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'} shadow-sm hover:shadow-md transition-all`}>
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
                                                    <div className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'} shadow-sm hover:shadow-md transition-all`}>
                                                        <Clock size={16} className="mt-0.5 text-indigo-600 dark:text-indigo-400" />
                                                        <div>
                                                            <p className={`text-sm ${secondaryText}`}>Time</p>
                                                            <p className={textColor}>{formatTime(exam.time)}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {exam.location && (
                                                    <div className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'} shadow-sm hover:shadow-md transition-all`}>
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
                                                    <div className={`col-span-1 sm:col-span-2 flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'} shadow-sm hover:shadow-md transition-all`}>
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
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={`${cardBg} p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center h-64 ${borderColor} border-2`}>
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                                    <div className={`relative p-4 rounded-2xl ${isDark ? 'bg-gray-700/50' : 'bg-white/80'}`}>
                                        <BookOpen size={40} className={`${secondaryText}`} />
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold ${textColor} mb-2`}>No Exams Found</h3>
                                <p className={`${secondaryText} mb-6 text-center`}>Get started by adding your first exam to track</p>
                                <button
                                    onClick={() => setShowAddExam(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
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