// app/dashboard/page.js
'use client'
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../components/lib/firebase';
import { useTheme } from '../../components/ThemeContext';
import { Moon, Sun, Plus, Trash2, Edit, Save, X, Copy,Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [syllabusData, setSyllabusData] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedYear, setSelectedYear] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [modules, setModules] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const { theme, toggleTheme, isDark } = useTheme();
    const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [branches, setBranches] = useState([]);
    const [years, setYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedCopySubjects, setSelectedCopySubjects] = useState([]);
    const [specializations, setSpecializations] = useState({});
    const [showAddSubject, setShowAddSubject] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [newSubject, setNewSubject] = useState({
        name: '',
        code: '',
        modules: []
    });
    const [newModule, setNewModule] = useState({
        name: '',
        topics: ''
    });
    const [editingBranch, setEditingBranch] = useState(false);
    const [newBranch, setNewBranch] = useState('');
    const [editingYear, setEditingYear] = useState(false);
    const [newYear, setNewYear] = useState('');
    const [editingSemester, setEditingSemester] = useState(false);
    const [newSemester, setNewSemester] = useState('');
    const [editingSubject, setEditingSubject] = useState(null);
    const [editingModuleIndex, setEditingModuleIndex] = useState(null);
    const [isEditingModule, setIsEditingModule] = useState(false);
    const [showCopyDialog, setShowCopyDialog] = useState(false);
    const [copyFromBranch, setCopyFromBranch] = useState('');
    const [copyFromYear, setCopyFromYear] = useState(1);
    const [copyFromSemester, setCopyFromSemester] = useState(null);
    const [copyToBranch, setCopyToBranch] = useState('');
    const [copyToYear, setCopyToYear] = useState(1);
    const [copyToSemester, setCopyToSemester] = useState(null);
    const [copySubjects, setCopySubjects] = useState([]);
    const [isCopying, setIsCopying] = useState(false);

    const getAvailableSemesters = () => {
        if (!selectedYear) return [];

        const yearToSemesters = {
            1: [1, 2],
            2: [3, 4],
            3: [5, 6],
            4: [7, 8]
        };

        return yearToSemesters[selectedYear] || [];
    };
    useEffect(() => {
        const subjectId = searchParams.get('subject');
        if (subjectId && syllabusData.length > 0) {
            const subject = syllabusData.find(sub => sub.id === subjectId);
            if (subject) {
                setSelectedSubject(subject);
                // Scroll to the subject details section
                setTimeout(() => {
                    const element = document.getElementById('subject-details');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        }
    }, [searchParams, syllabusData]);

    useEffect(() => {
        const loadUserProgress = async () => {
            if (!user || !selectedSubject) return;

            try {
                const progressRef = doc(db, 'userProgress', user.uid);
                const progressDoc = await getDoc(progressRef);

                if (progressDoc.exists()) {
                    setUserProgress(progressDoc.data());
                } else {
                    setUserProgress({});
                }
            } catch (error) {
                console.error('Error loading user progress:', error);
            }
        };

        loadUserProgress();
    }, [user, selectedSubject]);

    const editSubject = (subject) => {
        setEditingSubject(subject);
        setNewSubject({
            name: subject.name,
            code: subject.code,
            modules: [...subject.modules],
            semester: subject.semester
        });
        setShowAddSubject(true);
    };

    const editModule = (index) => {
        setEditingModuleIndex(index);
        setIsEditingModule(true);
        setNewModule({
            name: modules[index].name,
            topics: modules[index].topics.join(', ')
        });
    };

    const saveModuleEdit = async () => {
        if (editingModuleIndex === null || !newModule.name.trim()) return;

        const topicsArray = newModule.topics.split(',').map(t => t.trim()).filter(t => t);
        const updatedModules = [...modules];
        updatedModules[editingModuleIndex] = {
            name: newModule.name,
            topics: topicsArray
        };

        try {
            await updateDoc(doc(db, 'syllabus', selectedSubject.id), {
                modules: updatedModules
            });
            setModules(updatedModules);
            setSyllabusData(prev => prev.map(sub =>
                sub.id === selectedSubject.id ? { ...sub, modules: updatedModules } : sub
            ));
            setIsEditingModule(false);
            setEditingModuleIndex(null);
            setNewModule({ name: '', topics: '' });
        } catch (error) {
            console.error('Error updating module:', error);
        }
    };

    useEffect(() => {
        if (user && user.email === "anishseth0510@gmail.com") {
            setIsAdmin(true);
        }
    }, [user]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);

                const branchesSnapshot = await getDocs(collection(db, 'branches'));
                const branchesData = [];
                branchesSnapshot.forEach((doc) => {
                    if (doc.data().name) {
                        branchesData.push(doc.data().name);
                    }
                });
                setBranches(branchesData);
                if (branchesData.length > 0 && !selectedBranch) {
                    setSelectedBranch(branchesData[0]);
                }

                const yearsSnapshot = await getDocs(collection(db, 'years'));
                const yearsData = [];
                yearsSnapshot.forEach((doc) => {
                    const year = parseInt(doc.data().value || doc.id);
                    if (!isNaN(year)) {
                        yearsData.push(year);
                    }
                });
                setYears(yearsData.sort((a, b) => a - b));

                const specsSnapshot = await getDocs(collection(db, 'specializations'));
                const specsData = {};
                specsSnapshot.forEach(doc => {
                    specsData[doc.id] = doc.data().options || [];
                });
                setSpecializations(specsData);

            } catch (error) {
                console.error('Error fetching config:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchConfig();
    }, [user]);

    useEffect(() => {
        const fetchSyllabusData = async () => {
            try {
                setLoading(true);
                if (!selectedBranch) return;

                let q;
                if (selectedSemester) {
                    q = query(
                        collection(db, 'syllabus'),
                        where('branch', '==', selectedBranch),
                        where('year', '==', selectedYear),
                        where('semester', '==', selectedSemester)
                    );
                } else {
                    q = query(
                        collection(db, 'syllabus'),
                        where('branch', '==', selectedBranch),
                        where('year', '==', selectedYear)
                    );
                }

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSyllabusData(data);
            } catch (error) {
                console.error('Error fetching syllabus:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && selectedBranch && selectedYear) fetchSyllabusData();
    }, [user, selectedBranch, selectedYear, selectedSemester]);

    useEffect(() => {
        if (selectedSubject) {
            setModules(selectedSubject.modules || []);
        }
    }, [selectedSubject]);

    const updateModuleStatus = async (moduleIndex, completed) => {
        if (!user || !selectedSubject) return;

        try {
            const progressRef = doc(db, 'userProgress', user.uid);
            const subjectProgressKey = `subject_${selectedSubject.id}`;

            const progressDoc = await getDoc(progressRef);
            const currentProgress = progressDoc.exists() ? progressDoc.data() : {};

            const updatedModulesProgress = {
                ...(currentProgress[subjectProgressKey] || {}),
                [`module_${moduleIndex}`]: completed
            };

            const updateData = {
                ...currentProgress,
                [subjectProgressKey]: updatedModulesProgress,
                updatedAt: serverTimestamp()
            };

            await setDoc(progressRef, updateData, { merge: true });
            setUserProgress(updateData);

        } catch (error) {
            console.error('Error updating module status:', error);
        }
    };
    const toggleCopySubjectSelection = (subjectId) => {
        setSelectedCopySubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };
    const isModuleCompleted = (subjectId, moduleIndex) => {
        if (!userProgress || !subjectId) return false;
        const subjectKey = `subject_${subjectId}`;
        return userProgress[subjectKey]?.[`module_${moduleIndex}`] === true;
    };

    const calculateProgress = (subject) => {
        if (!subject?.modules || subject.modules.length === 0) return 0;
        if (!userProgress || !subject.id) return 0;

        const subjectKey = `subject_${subject.id}`;
        const subjectProgress = userProgress[subjectKey] || {};

        const completedCount = subject.modules.reduce((count, _, index) => {
            return count + (subjectProgress[`module_${index}`] ? 1 : 0);
        }, 0);

        return Math.round((completedCount / subject.modules.length) * 100);
    };

    useEffect(() => {
        if (user) {
            const userPrefRef = doc(db, 'userPreferences', user.uid);
            getDoc(userPrefRef).then((doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setSelectedBranch(data.defaultBranch || '');
                    setSelectedYear(data.defaultYear || 1);
                    setSelectedSemester(data.defaultSemester || null);
                }
            });
        }
    }, [user]);

    const saveUserPreferences = async () => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'userPreferences', user.uid), {
                defaultBranch: selectedBranch,
                defaultYear: selectedYear,
                defaultSemester: selectedSemester,
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

    useEffect(() => {
        if (user && selectedBranch && selectedYear) {
            saveUserPreferences();
        }
    }, [selectedBranch, selectedYear, selectedSemester]);

    const addBranch = async () => {
        if (!newBranch.trim()) return;
        try {
            await addDoc(collection(db, 'branches'), {
                name: newBranch,
                createdAt: serverTimestamp()
            });
            setBranches([...branches, newBranch]);
            setSelectedBranch(newBranch);
            setNewBranch('');
            setEditingBranch(false);
        } catch (error) {
            console.error('Error adding branch:', error);
        }
    };

    const deleteBranch = async (branch) => {
        try {
            const q = query(collection(db, 'branches'), where('name', '==', branch));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            const subjectsQuery = query(collection(db, 'syllabus'), where('branch', '==', branch));
            const subjectsSnapshot = await getDocs(subjectsQuery);
            subjectsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            setBranches(branches.filter(b => b !== branch));
            if (selectedBranch === branch) {
                setSelectedBranch(branches[0] || '');
            }
        } catch (error) {
            console.error('Error deleting branch:', error);
        }
    };

    const addYear = async () => {
        const yearNum = parseInt(newYear);
        if (isNaN(yearNum)) return;
        try {
            await addDoc(collection(db, 'years'), {
                value: yearNum,
                createdAt: serverTimestamp()
            });
            setYears([...years, yearNum].sort((a, b) => a - b));
            setNewYear('');
            setEditingYear(false);
        } catch (error) {
            console.error('Error adding year:', error);
        }
    };

    const deleteYear = async (year) => {
        try {
            const q = query(collection(db, 'years'), where('value', '==', year));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            const subjectsQuery = query(collection(db, 'syllabus'), where('year', '==', year));
            const subjectsSnapshot = await getDocs(subjectsQuery);
            subjectsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            setYears(years.filter(y => y !== year));
            if (selectedYear === year) {
                setSelectedYear(years[0] || 1);
            }
        } catch (error) {
            console.error('Error deleting year:', error);
        }
    };

    const addSpecialization = async (branch, spec) => {
        if (!spec.trim()) return;
        try {
            const specRef = doc(db, 'specializations', branch);
            const specDoc = await getDoc(specRef);

            if (specDoc.exists()) {
                await updateDoc(specRef, {
                    options: [...specDoc.data().options, spec]
                });
            } else {
                await setDoc(specRef, {
                    options: [spec]
                });
            }

            setSpecializations({
                ...specializations,
                [branch]: [...(specializations[branch] || []), spec]
            });
        } catch (error) {
            console.error('Error adding specialization:', error);
        }
    };

    const deleteSpecialization = async (branch, spec) => {
        try {
            const specRef = doc(db, 'specializations', branch);
            const specDoc = await getDoc(specRef);

            if (specDoc.exists()) {
                const updatedSpecs = specDoc.data().options.filter(s => s !== spec);
                await updateDoc(specRef, {
                    options: updatedSpecs
                });

                setSpecializations({
                    ...specializations,
                    [branch]: updatedSpecs
                });
            }
        } catch (error) {
            console.error('Error deleting specialization:', error);
        }
    };

    const addModule = () => {
        if (!newModule.name.trim()) return;

        const topicsArray = newModule.topics
            ? newModule.topics.split(',').map(t => t.trim()).filter(t => t)
            : [];

        setNewSubject({
            ...newSubject,
            modules: [...newSubject.modules, {
                name: newModule.name.trim(),
                topics: topicsArray
            }]
        });
        setNewModule({ name: '', topics: '' });
    };

    const removeModule = (index) => {
        const updatedModules = [...newSubject.modules];
        updatedModules.splice(index, 1);
        setNewSubject({ ...newSubject, modules: updatedModules });
    };

    const submitSubject = async () => {
        if (!newSubject.name.trim() || !newSubject.code.trim()) {
            alert('Subject name and code are required');
            return;
        }

        const semester = editingSubject ? newSubject.semester : selectedSemester;
        if (!semester) {
            alert('Please select a semester');
            return;
        }

        if (newSubject.modules.length === 0) {
            alert('Please add at least one module');
            return;
        }

        try {
            const modules = newSubject.modules.map(module => ({
                name: module.name.trim(),
                topics: Array.isArray(module.topics)
                    ? module.topics
                    : (module.topics || '').split(',').map(t => t.trim()).filter(t => t)
            }));

            const subjectData = {
                name: newSubject.name.trim(),
                code: newSubject.code.trim(),
                modules,
                branch: selectedBranch,
                year: selectedYear,
                semester: semester,
                updatedAt: serverTimestamp()
            };

            if (editingSubject) {
                await updateDoc(doc(db, 'syllabus', editingSubject.id), subjectData);

                setSyllabusData(prev => prev.map(sub =>
                    sub.id === editingSubject.id ? { ...sub, ...subjectData } : sub
                ));

                if (selectedSubject?.id === editingSubject.id) {
                    setSelectedSubject({ ...selectedSubject, ...subjectData });
                }
            } else {
                const docRef = await addDoc(collection(db, 'syllabus'), {
                    ...subjectData,
                    createdAt: serverTimestamp()
                });

                setSyllabusData(prev => [...prev, { id: docRef.id, ...subjectData }]);
            }

            setShowAddSubject(false);
            setEditingSubject(null);
            setNewSubject({
                name: '',
                code: '',
                modules: [],
                semester: null
            });
            setNewModule({
                name: '',
                topics: ''
            });

        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Failed to save subject. Please try again.');
        }
    };

    const deleteSubject = async (subjectId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this subject? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'syllabus', subjectId));
            setSyllabusData(syllabusData.filter(sub => sub.id !== subjectId));
            if (selectedSubject?.id === subjectId) {
                setSelectedSubject(null);
            }
            alert('Subject deleted successfully');
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert('Failed to delete subject');
        }
    };
    const fetchSubjectsForCopy = async () => {
        if (!copyFromBranch || !copyFromYear) return;

        try {
            setLoading(true);
            let q;
            if (copyFromSemester) {
                q = query(
                    collection(db, 'syllabus'),
                    where('branch', '==', copyFromBranch),
                    where('year', '==', copyFromYear),
                    where('semester', '==', copyFromSemester)
                );
            } else {
                q = query(
                    collection(db, 'syllabus'),
                    where('branch', '==', copyFromBranch),
                    where('year', '==', copyFromYear)
                );
            }

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCopySubjects(data);
        } catch (error) {
            console.error('Error fetching subjects for copy:', error);
            alert('Failed to fetch subjects for copying');
        } finally {
            setLoading(false);
        }
    };

    const copySubjectsToBranch = async () => {
        if (!copyToBranch || !copyToYear) {
            alert('Please select target branch and year');
            return;
        }

        // Determine which subjects to copy
        const subjectsToCopy = selectedCopySubjects.length > 0
            ? copySubjects.filter(subject => selectedCopySubjects.includes(subject.id))
            : copySubjects;

        if (subjectsToCopy.length === 0) {
            alert('No subjects selected for copying');
            return;
        }

        try {
            setIsCopying(true);

            for (const subject of subjectsToCopy) {
                const newSubjectData = {
                    name: subject.name,
                    code: subject.code,
                    modules: subject.modules,
                    branch: copyToBranch,
                    year: copyToYear,
                    semester: copyToSemester || subject.semester,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                await addDoc(collection(db, 'syllabus'), newSubjectData);
            }

            alert(`${subjectsToCopy.length} subject(s) copied successfully!`);
            setShowCopyDialog(false);
            setCopyFromBranch('');
            setCopyFromYear(1);
            setCopyFromSemester(null);
            setCopyToBranch('');
            setCopyToYear(1);
            setCopyToSemester(null);
            setCopySubjects([]);
            setSelectedCopySubjects([]);

            // Refresh the current view
            const q = query(
                collection(db, 'syllabus'),
                where('branch', '==', selectedBranch),
                where('year', '==', selectedYear)
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSyllabusData(data);
        } catch (error) {
            console.error('Error copying subjects:', error);
            alert('Failed to copy subjects');
        } finally {
            setIsCopying(false);
        }
    };

    // Add this function to select/deselect all subjects
    const toggleSelectAllCopySubjects = () => {
        if (selectedCopySubjects.length === copySubjects.length) {
            setSelectedCopySubjects([]);
        } else {
            setSelectedCopySubjects(copySubjects.map(subject => subject.id));
        }
    };


    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';

    return (
        <ProtectedRoute>
            <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                <nav className={`${cardBg} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20 flex-wrap gap-y-2">
                            <div className="flex items-center space-x-2 min-w-0">
                                <Image
                                    src="/emblem.png"
                                    alt="NeuraMark Logo"
                                    width={36}
                                    height={36}
                                    className="rounded-sm shadow-sm shrink-0"
                                    priority
                                />

                                <h1 className={`text-lg sm:text-2xl md:text-2xl font-bold ${textColor} tracking-tight truncate`}>
                                    NeuraMark
                                </h1>

                                {isAdmin && (
                                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs md:text-sm rounded-full shadow-sm">
                                        ADMIN
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6 min-w-0">
                                <span
                                    className={`hidden sm:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[100px] sm:max-w-[140px] md:max-w-[200px]`}
                                >
                                    {user?.email}
                                </span>

                                <button
                                    onClick={logout}
                                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 text-sm md:text-base shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    Logout
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    className={`
                                        p-2 rounded-full transition-all duration-300
                                        ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                                        shadow-md hover:shadow-lg
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}
                                    `}
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
                    <div className={`${cardBg} p-4 rounded-lg shadow mb-6 ${borderColor} border`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className={`block text-sm font-medium ${secondaryText}`}>Branch</label>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setEditingBranch(!editingBranch)}
                                            className="text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            {editingBranch ? <X size={14} /> : <Edit size={14} />}
                                        </button>
                                    )}
                                </div>
                                {editingBranch ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newBranch}
                                                onChange={(e) => setNewBranch(e.target.value)}
                                                placeholder="New branch name"
                                                className={`flex-1 pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                            />
                                            <button
                                                onClick={addBranch}
                                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {branches.length > 0 && (
                                            <div className="space-y-1">
                                                {branches.map(branch => (
                                                    <div
                                                        key={branch}
                                                        className={`
                                                            flex justify-between items-center p-2 rounded
                                                            ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                                                            transition-colors duration-200
                                                        `}
                                                    >
                                                        <span className="text-sm">{branch}</span>
                                                        <button
                                                            onClick={() => deleteBranch(branch)}
                                                            className={`
                                                                p-1 rounded-full 
                                                                ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-gray-600' : 'text-red-600 hover:text-red-800 hover:bg-gray-200'}
                                                                transition-colors duration-200
                                                            `}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => {
                                            setSelectedBranch(e.target.value);
                                            setSelectedSubject(null);
                                        }}
                                        className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                        disabled={branches.length === 0}
                                    >
                                        {branches.length === 0 ? (
                                            <option value="">No branches available</option>
                                        ) : (
                                            branches.map(branch => (
                                                <option key={branch} value={branch}>{branch}</option>
                                            ))
                                        )}
                                    </select>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className={`block text-sm font-medium ${secondaryText}`}>Year</label>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setEditingYear(!editingYear)}
                                            className="text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            {editingYear ? <X size={14} /> : <Edit size={14} />}
                                        </button>
                                    )}
                                </div>
                                {editingYear ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={newYear}
                                                onChange={(e) => setNewYear(e.target.value)}
                                                placeholder="New year"
                                                className={`flex-1 pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                            />
                                            <button
                                                onClick={addYear}
                                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {years.length > 0 && (
                                            <div className="space-y-1">
                                                {years.map(year => (
                                                    <div
                                                        key={year}
                                                        className={`
                                                            flex justify-between items-center p-2 rounded
                                                            ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                                                        `}
                                                    >
                                                        <span className="text-sm">Year {year}</span>
                                                        <button
                                                            onClick={() => deleteYear(year)}
                                                            className={`
                                                                p-1 rounded-full 
                                                                ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-gray-600' : 'text-red-600 hover:text-red-800 hover:bg-gray-200'}
                                                            `}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(Number(e.target.value));
                                            setSelectedSemester(null);
                                            setSelectedSubject(null);
                                        }}
                                        className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                        disabled={years.length === 0}
                                    >
                                        {years.length === 0 ? (
                                            <option value="">No years available</option>
                                        ) : (
                                            years.map(year => (
                                                <option key={year} value={year}>Year {year}</option>
                                            ))
                                        )}
                                    </select>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className={`block text-sm font-medium ${secondaryText}`}>Semester</label>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setEditingSemester(!editingSemester)}
                                            className="text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            {editingSemester ? <X size={14} /> : <Edit size={14} />}
                                        </button>
                                    )}
                                </div>
                                {editingSemester ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={newSemester}
                                                onChange={(e) => setNewSemester(e.target.value)}
                                                placeholder="New semester"
                                                className={`flex-1 pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                            />
                                            <button
                                                onClick={addSemester}
                                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedSemester || ''}
                                        onChange={(e) => {
                                            setSelectedSemester(e.target.value ? Number(e.target.value) : null);
                                            setSelectedSubject(null);
                                        }}
                                        className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                        disabled={!selectedYear}
                                    >
                                        <option value="">All Semesters</option>
                                        {getAvailableSemesters().map(semester => (
                                            <option key={semester} value={semester}>Semester {semester}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {specializations[selectedBranch] && (
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className={`block text-sm font-medium ${secondaryText}`}>Specialization</label>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    const newSpec = prompt('Enter new specialization:');
                                                    if (newSpec) {
                                                        addSpecialization(selectedBranch, newSpec);
                                                    }
                                                }}
                                                className="text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <select
                                        className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                    >
                                        {specializations[selectedBranch].map(spec => (
                                            <option key={spec} value={spec}>
                                                {spec}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {isAdmin && (
                             <div className="mt-4 flex justify-end gap-4">
        <Link 
            href="/admin/subjects"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
            <span>All Subjects</span>
        </Link>
        <Link 
            href="/admin/active-users"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
            <Activity size={16} />
            <span>Active Users</span>
        </Link>
        <button
            onClick={() => setShowCopyDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
            <Copy size={16} />
            <span>Copy Subjects</span>
        </button>
    </div>
                        )}
                    </div>

                    {showCopyDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className={`${cardBg} rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${borderColor} border`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={`text-xl font-bold ${textColor}`}>Copy Subjects Between Branches</h2>
                                    <button
                                        onClick={() => {
                                            setShowCopyDialog(false);
                                            setCopySubjects([]);
                                            setSelectedCopySubjects([]);
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className={`font-medium mb-3 ${textColor}`}>Source</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>From Branch</label>
                                                <select
                                                    value={copyFromBranch}
                                                    onChange={(e) => setCopyFromBranch(e.target.value)}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                >
                                                    <option value="">Select Branch</option>
                                                    {branches.map(branch => (
                                                        <option key={branch} value={branch}>{branch}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>From Year</label>
                                                <select
                                                    value={copyFromYear}
                                                    onChange={(e) => setCopyFromYear(Number(e.target.value))}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                >
                                                    {years.map(year => (
                                                        <option key={year} value={year}>Year {year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>From Semester (Optional)</label>
                                                <select
                                                    value={copyFromSemester || ''}
                                                    onChange={(e) => setCopyFromSemester(e.target.value ? Number(e.target.value) : null)}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                >
                                                    <option value="">All Semesters</option>
                                                    {copyFromYear && getAvailableSemesters().map(semester => (
                                                        <option key={semester} value={semester}>Semester {semester}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={fetchSubjectsForCopy}
                                                disabled={!copyFromBranch || !copyFromYear}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Loading...' : 'Load Subjects'}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className={`font-medium mb-3 ${textColor}`}>Destination</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>To Branch</label>
                                                <select
                                                    value={copyToBranch}
                                                    onChange={(e) => setCopyToBranch(e.target.value)}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                >
                                                    <option value="">Select Branch</option>
                                                    {branches.map(branch => (
                                                        <option key={branch} value={branch}>{branch}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>To Year</label>
                                                <select
                                                    value={copyToYear}
                                                    onChange={(e) => setCopyToYear(Number(e.target.value))}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                >
                                                    {years.map(year => (
                                                        <option key={year} value={year}>Year {year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>To Semester (Optional)</label>
                                                <select
                                                    value={copyToSemester || ''}
                                                    onChange={(e) => setCopyToSemester(e.target.value ? Number(e.target.value) : null)}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                >
                                                    <option value="">Same as source</option>
                                                    {copyToYear && getAvailableSemesters().map(semester => (
                                                        <option key={semester} value={semester}>Semester {semester}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {copySubjects.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className={`font-medium ${textColor}`}>
                                                Subjects to be copied ({selectedCopySubjects.length > 0 ? `${selectedCopySubjects.length} selected` : `${copySubjects.length} total`})
                                            </h3>
                                            <button
                                                onClick={toggleSelectAllCopySubjects}
                                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {selectedCopySubjects.length === copySubjects.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className={`max-h-60 overflow-y-auto ${borderColor} border rounded-md p-2`}>
                                            {copySubjects.map((subject, index) => (
                                                <div
                                                    key={index}
                                                    className={`
                  p-2 mb-2 rounded flex items-start
                  ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                  ${selectedCopySubjects.includes(subject.id) ? (theme === 'dark' ? 'ring-1 ring-indigo-500' : 'ring-1 ring-indigo-300') : ''}
                `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCopySubjects.includes(subject.id)}
                                                        onChange={() => toggleCopySubjectSelection(subject.id)}
                                                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <div className="ml-2 flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="font-medium">{subject.name}</span>
                                                                <span className={`text-xs block ${secondaryText}`}>
                                                                    {subject.code} (Sem {subject.semester})
                                                                </span>
                                                            </div>
                                                            <span className="text-sm">
                                                                {subject.modules.length} modules
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCopyDialog(false);
                                            setCopySubjects([]);
                                            setSelectedCopySubjects([]);
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={copySubjectsToBranch}
                                        disabled={!copyToBranch || !copyToYear || (selectedCopySubjects.length === 0 && copySubjects.length === 0) || isCopying}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isCopying
                                            ? 'Copying...'
                                            : selectedCopySubjects.length > 0
                                                ? `Copy ${selectedCopySubjects.length} Selected`
                                                : 'Copy All Subjects'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Two-column layout */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Subjects List */}
                        <div className="lg:w-1/3">
                            <div className={`${cardBg} p-6 rounded-lg shadow ${borderColor} border`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={`text-xl font-bold ${textColor}`}>
                                        {selectedBranch} Year {selectedYear}
                                        {selectedSemester ? ` Semester ${selectedSemester}` : ' All Semesters'} Subjects
                                    </h2>
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                setEditingSubject(null);
                                                setNewSubject({ name: '', code: '', modules: [] });
                                                setShowAddSubject(true);
                                            }}
                                            className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            disabled={!selectedBranch}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Add/Edit Subject Form */}
                                {showAddSubject && (
                                    <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <h3 className={`font-medium mb-2 ${textColor}`}>
                                            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Subject Name</label>
                                                <input
                                                    type="text"
                                                    value={newSubject.name}
                                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                                    className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Subject Code</label>
                                                <input
                                                    type="text"
                                                    value={newSubject.code}
                                                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                                    className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Semester</label>
                                                <select
                                                    value={editingSubject ? newSubject.semester : (selectedSemester || '')}
                                                    onChange={(e) => {
                                                        const semester = e.target.value ? Number(e.target.value) : null;
                                                        if (editingSubject) {
                                                            setNewSubject({ ...newSubject, semester });
                                                        } else {
                                                            setSelectedSemester(semester);
                                                        }
                                                    }}
                                                    className={`block w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                    disabled={!selectedYear}
                                                >
                                                    <option value="">Select Semester</option>
                                                    {getAvailableSemesters().map(semester => (
                                                        <option key={semester} value={semester}>Semester {semester}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Modules</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={newModule.name}
                                                        onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                                                        placeholder="Module name"
                                                        className={`flex-1 pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                    />
                                                    <button
                                                        onClick={addModule}
                                                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                        disabled={!newModule.name.trim()}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={newModule.topics}
                                                    onChange={(e) => setNewModule({ ...newModule, topics: e.target.value })}
                                                    placeholder="Topics (comma separated)"
                                                    className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                />
                                            </div>
                                            {newSubject.modules.length > 0 && (
                                                <div className="space-y-2">
                                                    {newSubject.modules.map((module, index) => (
                                                        <div
                                                            key={index}
                                                            className={`
                                                                flex justify-between items-center p-2 rounded
                                                                ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}
                                                            `}
                                                        >
                                                            <div>
                                                                <span className="font-medium">{module.name}</span>
                                                                <span className="text-xs block">{module.topics?.join(', ') || 'No topics'}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeModule(index)}
                                                                className="p-1 text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setShowAddSubject(false);
                                                        setEditingSubject(null);
                                                        setNewSubject({
                                                            name: '',
                                                            code: '',
                                                            modules: []
                                                        });
                                                        setNewModule({
                                                            name: '',
                                                            topics: ''
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={submitSubject}
                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                    disabled={!newSubject.name || !newSubject.code ||
                                                        (editingSubject ? !newSubject.semester : !selectedSemester) ||
                                                        newSubject.modules.length === 0}
                                                >
                                                    {editingSubject ? 'Update Subject' : 'Save Subject'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Subjects List */}
                                {loading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {syllabusData.length > 0 ? (
                                            syllabusData.map(subject => (
                                                <div
                                                    key={subject.id}
                                                    className={`
                                                        p-3 rounded-lg cursor-pointer transition-colors duration-200
                                                        ${selectedSubject?.id === subject.id
                                                            ? 'bg-blue-50 border border-blue-200 dark:bg-indigo-500 dark:border-indigo-700'
                                                            : `${theme === 'dark'
                                                                ? 'bg-gray-700 hover:bg-gray-600'
                                                                : 'bg-gray-50 hover:bg-gray-100'}`
                                                        }
                                                    `}
                                                    onClick={() => setSelectedSubject(subject)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className={`font-medium ${textColor}`}>{subject.name}</h3>
                                                            <p className={`text-sm ${secondaryText}`}>{subject.code} (Sem {subject.semester})</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-indigo-500 dark:text-indigo-400">
                                                                {calculateProgress(subject)}%
                                                            </span>
                                                            {isAdmin && (
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            editSubject(subject);
                                                                        }}
                                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteSubject(subject.id);
                                                                        }}
                                                                        className="p-1 text-red-600 hover:text-red-800"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className={secondaryText}>No subjects found</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modules and Progress */}
                        <div className="lg:w-2/3" id="subject-details">
                            {selectedSubject ? (
                                <div className={`${cardBg} p-6 rounded-lg shadow ${borderColor} border`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h2 className={`text-xl font-bold ${textColor}`}>
                                                {selectedSubject.name} Modules
                                            </h2>
                                            <p className={`${secondaryText}`}>{selectedSubject.code} (Semester {selectedSubject.semester})</p>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    const newModuleName = prompt('Enter new module name:');
                                                    if (newModuleName) {
                                                        const newModuleTopics = prompt('Enter topics (comma separated):');
                                                        const topicsArray = newModuleTopics.split(',').map(t => t.trim()).filter(t => t);

                                                        const updatedModules = [
                                                            ...modules,
                                                            {
                                                                name: newModuleName,
                                                                topics: topicsArray,
                                                                completed: false
                                                            }
                                                        ];

                                                        updateDoc(doc(db, 'syllabus', selectedSubject.id), {
                                                            modules: updatedModules
                                                        }).then(() => {
                                                            setModules(updatedModules);
                                                            setSyllabusData(prev => prev.map(sub =>
                                                                sub.id === selectedSubject.id ? { ...sub, modules: updatedModules } : sub
                                                            ));
                                                        });
                                                    }
                                                }}
                                                className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                                            <div
                                                className="bg-indigo-600 h-2.5 rounded-full"
                                                style={{ width: `${calculateProgress(selectedSubject)}%` }}
                                            ></div>
                                        </div>
                                        <div className={`flex justify-between text-sm mt-1 ${secondaryText}`}>
                                            <span>Progress</span>
                                            <span>{calculateProgress(selectedSubject)}%</span>
                                        </div>
                                    </div>

                                    {/* Module Edit Form */}
                                    {isEditingModule && (
                                        <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <h3 className={`font-medium mb-2 ${textColor}`}>Edit Module</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Module Name</label>
                                                    <input
                                                        type="text"
                                                        value={newModule.name}
                                                        onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                                                        className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Topics</label>
                                                    <input
                                                        type="text"
                                                        value={newModule.topics}
                                                        onChange={(e) => setNewModule({ ...newModule, topics: e.target.value })}
                                                        placeholder="Comma separated topics"
                                                        className={`w-full pl-3 pr-10 py-2 text-base ${borderColor} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${inputBg}`}
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingModule(false);
                                                            setEditingModuleIndex(null);
                                                            setNewModule({ name: '', topics: '' });
                                                        }}
                                                        className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={saveModuleEdit}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                        disabled={!newModule.name}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Modules List */}
                                    <div className="space-y-3">
                                        {modules.length > 0 ? (
                                            modules.map((module, index) => (
                                                <motion.div
                                                    key={index}
                                                    className={`
                                                        flex items-start p-3 rounded-lg border
                                                        ${isModuleCompleted(selectedSubject.id, index)
                                                            ? (theme === 'dark' ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-200')
                                                            : (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')
                                                        }
                                                        ${selectedModuleIndex === index
                                                            ? (theme === 'dark' ? 'ring-2 ring-indigo-500' : 'ring-2 ring-indigo-300')
                                                            : ''
                                                        }
                                                        transition-colors duration-200
                                                    `}
                                                >
                                                    {/* Checkbox Button */}
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            await updateModuleStatus(index, !isModuleCompleted(selectedSubject.id, index));
                                                        }}
                                                        className={`
                                                            mt-1 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center
                                                            ${isModuleCompleted(selectedSubject.id, index)
                                                                ? 'bg-indigo-600 border-indigo-600'
                                                                : `${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} bg-transparent`
                                                            }
                                                            transition-colors duration-200
                                                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                                        `}
                                                        aria-label={isModuleCompleted(selectedSubject.id, index) ? "Mark as incomplete" : "Mark as complete"}
                                                        role="checkbox"
                                                        aria-checked={isModuleCompleted(selectedSubject.id, index)}
                                                    >
                                                        {isModuleCompleted(selectedSubject.id, index) && (
                                                            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </button>

                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className={`text-sm font-medium ${textColor}`}>
                                                                    Module {index + 1}: {module.name}
                                                                </h3>
                                                                <p className={`text-xs ${secondaryText} mt-1`}>
                                                                    Topics: {module.topics?.join(', ')}
                                                                </p>
                                                            </div>

                                                            {isAdmin && (
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            editModule(index);
                                                                        }}
                                                                        className={`
                                                                            p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600
                                                                            text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300
                                                                        `}
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const confirmDelete = window.confirm("Are you sure you want to delete this module? This action cannot be undone.");
                                                                            if (!confirmDelete) return;

                                                                            const updatedModules = [...modules];
                                                                            updatedModules.splice(index, 1);

                                                                            updateDoc(doc(db, 'syllabus', selectedSubject.id), {
                                                                                modules: updatedModules
                                                                            }).then(() => {
                                                                                setModules(updatedModules);
                                                                                setSyllabusData(prev => prev.map(sub =>
                                                                                    sub.id === selectedSubject.id ? { ...sub, modules: updatedModules } : sub
                                                                                ));
                                                                            });
                                                                        }}
                                                                        className={`
        p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600
        text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300
    `}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className={secondaryText}>No modules defined for this subject</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={`${cardBg} p-6 rounded-lg shadow flex items-center justify-center h-64 ${borderColor} border`}>
                                    <p className={secondaryText}>
                                        {syllabusData.length > 0
                                            ? "Select a subject to view modules"
                                            : "No subjects available for selected branch/year/semester"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}