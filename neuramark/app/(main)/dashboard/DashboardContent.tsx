// app/dashboard/page.js
'use client'
import { Suspense } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { Upload,MessageCircle, ChevronDown, ChevronUp, BarChart2, Bookmark, User, Menu, Moon, Sun, Plus, Trash2, Edit, X, Copy, Activity, Clipboard, PieChart, BookOpen, Zap, FileText, Download } from 'lucide-react'
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [branches, setBranches] = useState([]);
    const [initialPrefsLoaded, setInitialPrefsLoaded] = useState(false);
    const [years, setYears] = useState([]);
    const [selectedCopySubjects, setSelectedCopySubjects] = useState([]);
    const [specializations, setSpecializations] = useState({});
    const [showAddSubject, setShowAddSubject] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pageTitle = "NeuraMark";
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
    }, [user, selectedBranch]);

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
        if (user && user.uid && db) {
            const userPrefRef = doc(db, 'userPreferences', user.uid);
            getDoc(userPrefRef).then((doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setSelectedBranch(data.defaultBranch || '');
                    setSelectedYear(data.defaultYear || 1);
                    setSelectedSemester(data.defaultSemester || null);
                }
            }).catch((error) => {
                console.error('Error fetching user preferences:', error);
            });
        }
    }, [user]);

    // Replace your current useEffect for loading preferences with this:
    useEffect(() => {
        if (!user) return;

        const loadUserPreferences = async () => {
            try {
                const userPrefRef = doc(db, 'userPreferences', user.uid);
                const prefDoc = await getDoc(userPrefRef);

                if (prefDoc.exists()) {
                    const data = prefDoc.data();
                    // Only update if we have values and they're different from current
                    if (data.defaultBranch && data.defaultBranch !== selectedBranch) {
                        setSelectedBranch(data.defaultBranch);
                    }
                    if (data.defaultYear && data.defaultYear !== selectedYear) {
                        setSelectedYear(data.defaultYear);
                    }
                    if (data.defaultSemester && data.defaultSemester !== selectedSemester) {
                        setSelectedSemester(data.defaultSemester);
                    }
                }
                setInitialPrefsLoaded(true);
            } catch (error) {
                console.error('Error loading user preferences:', error);
                setInitialPrefsLoaded(true); // Still mark as loaded even if error
            }
        };

        loadUserPreferences();
    }, [user, selectedBranch, selectedYear, selectedSemester]); // Only depend on user

    // Replace your current save preferences useEffect with this:
    useEffect(() => {
        if (!user || !initialPrefsLoaded) return;

        const saveUserPreferences = async () => {
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

        // Debounce the save to prevent too many writes
        const debounceTimer = setTimeout(() => {
            saveUserPreferences();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [selectedBranch, selectedYear, selectedSemester, user, initialPrefsLoaded]);
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


    const exportSyllabusToPDF = (subject) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to download the PDF');
            return;
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${subject.name} - Syllabus</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #1a202c;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            font-size: 32px;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .header .meta {
            font-size: 16px;
            color: #718096;
            margin-top: 8px;
        }
        .subject-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .subject-info h2 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .subject-info .details {
            font-size: 14px;
            opacity: 0.9;
        }
        .module {
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 12px;
            border-left: 4px solid #667eea;
            page-break-inside: avoid;
        }
        .module-header {
            font-size: 20px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 12px;
        }
        .topics-label {
            font-size: 14px;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 8px;
        }
        .topics {
            list-style: none;
            padding: 0;
        }
        .topics li {
            padding: 8px 0;
            padding-left: 20px;
            position: relative;
            color: #4a5568;
            line-height: 1.6;
        }
        .topics li:before {
            content: "▸";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #a0aec0;
        }
        @media print {
            body {
                background: white;
                padding: 20px;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Course Syllabus</h1>
            <div class="meta">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="meta">Generated by ${user?.displayName || user?.email}</div>
        </div>
        
        <div class="subject-info">
            <h2>${subject.name}</h2>
            <div class="details">
                <strong>Code:</strong> ${subject.code} | 
                <strong>Branch:</strong> ${subject.branch} | 
                <strong>Year:</strong> ${subject.year} | 
                <strong>Semester:</strong> ${subject.semester}
            </div>
        </div>
        
        ${subject.modules.map((module, index) => `
            <div class="module">
                <div class="module-header">Module ${index + 1}: ${module.name}</div>
                <div class="topics-label">Topics Covered:</div>
                <ul class="topics">
                    ${module.topics && module.topics.length > 0 
                        ? module.topics.map(topic => `<li>${topic}</li>`).join('')
                        : '<li>No topics specified</li>'
                    }
                </ul>
            </div>
        `).join('')}
        
        <div class="footer">
            <p>This syllabus was generated from NeuraMark - Your Academic Companion</p>
            <p>Total Modules: ${subject.modules.length}</p>
        </div>
    </div>
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 100);
            }, 250);
        };
    </script>
</body>
</html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white/60 backdrop-blur-sm';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-purple-300';
    const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white/90 text-gray-900';

    return (

        <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
                <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                    <nav className={`${theme === 'dark' ? cardBg : 'bg-white/70 backdrop-blur-xl'} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16 md:h-20">
                                {/* Left Section */}
                                <div className="flex items-center space-x-3 min-w-0">
                                    <Image
                                        src="/emblem.png"
                                        alt="NeuraMark Logo"
                                        width={36}
                                        height={36}
                                        className="rounded-sm shadow-sm shrink-0"
                                        priority
                                    />
                                    <h1 className={`text-lg sm:text-2xl font-bold ${textColor} tracking-tight truncate max-w-[140px] sm:max-w-xs`}>
                                        {pageTitle}
                                    </h1>

                                    {isAdmin && (
                                        <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs rounded-full shadow-sm">
                                            ADMIN
                                        </span>
                                    )}
                                </div>

                                {/* Desktop Controls */}
                                <div className="hidden md:flex items-center space-x-4">

                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            width={28}
                                            height={28}
                                            className="rounded-full"
                                            key={user.uid} // Add key to force re-render when user changes
                                        />
                                    ) : (
                                        <div className="h-7 w-7 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                            <User size={16} />
                                        </div>
                                    )}
                                    <span className={`hidden sm:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[200px]`}>
                                        {user?.displayName || user?.email}
                                    </span>
                                    <Link
                                        href="/chat"
                                        className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all ${router.pathname === '/chat'
                                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                            : ''
                                            }`}
                                        aria-label="Chat"
                                    >
                                        <div className="relative">
                                            <MessageCircle
                                                size={23}
                                                className={`text-blue-400 transition-transform duration-200 ${router.pathname === '/chat'
                                                    ? 'scale-110 text-blue-500 dark:text-blue-300'
                                                    : 'hover:scale-110'
                                                    }`}
                                            />
                                            <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                Chat
                                            </span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={logout}
                                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 text-sm shadow-md transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        Logout
                                    </button>

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
                                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-200"
                                    >
                                        <Menu className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Sidebar for Mobile */}
                    {/* Sidebar for Mobile */}
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
                                                {pageTitle}
                                            </h2>
                                            {isAdmin && (
                                                <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-full shadow">
                                                    ADMIN
                                                </span>
                                            )}
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

                                    {/* Add more navigation links as needed */}
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

                                {/* Theme Toggle with Icon */}
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


                    <main className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${textColor} relative`}>
                        {/* Subtle background gradient */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"></div>
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"></div>
                        </div>
                        <div className={`${cardBg} p-6 rounded-2xl shadow-2xl mb-8 ${borderColor} border-2`}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={`block text-sm font-bold ${textColor}`}>Branch</label>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setEditingBranch(!editingBranch)}
                                                className={`text-xs p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
                                            className={`block w-full px-4 py-3 text-base border-2 ${borderColor} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 rounded-xl ${inputBg} font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={`block text-sm font-bold ${textColor}`}>Year</label>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setEditingYear(!editingYear)}
                                                className={`text-xs p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
                                            className={`block w-full px-4 py-3 text-base border-2 ${borderColor} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 rounded-xl ${inputBg} font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={`block text-sm font-bold ${textColor}`}>Semester</label>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setEditingSemester(!editingSemester)}
                                                className={`text-xs p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
                                            className={`block w-full px-4 py-3 text-base border-2 ${borderColor} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 rounded-xl ${inputBg} font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
                                        <Zap className="w-6 h-6" />
                                        Quick Actions
                                    </h3>
                                    <button
                                        onClick={() => setShowActions(!showActions)}
                                        className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'}`}
                                    >
                                        {showActions ? (
                                            <>
                                                Hide <ChevronUp size={16} />
                                            </>
                                        ) : (
                                            <>
                                                Show <ChevronDown size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <AnimatePresence>
                                {showActions && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-x-auto sm:overflow-x-visible"
                                    >
                                        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[500px] sm:min-w-0">
                                            {/* Shared Action Button Component */}
                                            {[
                                                {
                                                    href: '/dashboard/progress',
                                                    label: 'My Progress',
                                                    colors: ['from-violet-600', 'to-violet-800'],
                                                    hover: ['from-violet-700', 'to-violet-900'],
                                                    bar: 'bg-violet-400',
                                                    icon: <Bookmark size={20} />,
                                                },
                                                {
                                                    href: '/dashboard/exams',
                                                    label: 'My Exams',
                                                    colors: ['from-blue-600', 'to-blue-800'],
                                                    hover: ['from-blue-700', 'to-blue-900'],
                                                    bar: 'bg-blue-400',
                                                    icon: <Clipboard size={20} />,
                                                },
                                                {
                                                    href: '/dashboard/kra-kpi',
                                                    label: 'Performance',
                                                    colors: ['from-orange-600', 'to-orange-700'],
                                                    hover: ['from-orange-700', 'to-orange-800'],
                                                    bar: 'bg-orange-400',
                                                    icon: <BarChart2 size={20} />,
                                                },
                                                ...(isAdmin
                                                    ? [
                                                        {
                                                            href: '/admin/analytics',
                                                            label: 'Analytics',
                                                            colors: ['from-cyan-600', 'to-cyan-700'],
                                                            hover: ['from-cyan-700', 'to-cyan-800'],
                                                            bar: 'bg-cyan-400',
                                                            icon: <PieChart size={20} />,
                                                        },
                                                        {
                                                            href: '/admin/subjects',
                                                            label: 'All Subjects',
                                                            colors: ['from-indigo-600', 'to-indigo-700'],
                                                            hover: ['from-indigo-700', 'to-indigo-800'],
                                                            bar: 'bg-indigo-400',
                                                            icon: <BookOpen size={20} />,
                                                        },
                                                        {
                                                            href: '/admin/active-users',
                                                            label: 'Active Users',
                                                            colors: ['from-green-600', 'to-green-700'],
                                                            hover: ['from-green-700', 'to-green-800'],
                                                            bar: 'bg-green-400',
                                                            icon: <Activity size={20} />,
                                                        },
                                                        {
                                                            href: '/admin/pdf-upload',
                                                            label: 'PDF Upload',
                                                            colors: ['from-red-600', 'to-red-700'],
                                                            hover: ['from-red-700', 'to-red-800'],
                                                            bar: 'bg-red-400',
                                                            icon: <Upload size={20} />,
                                                        },
                                                    ]
                                                    : []),
                                            ].map((item, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                >
                                                    <Link
                                                        href={item.href}
                                                        className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br ${item.colors.join(
                                                            ' '
                                                        )} text-white overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.05] active:scale-95 min-w-[150px]`}
                                                    >
                                                        <div
                                                            className={`absolute inset-0 bg-gradient-to-br ${item.hover.join(
                                                                ' '
                                                            )} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                        />
                                                        <div className="relative z-10 flex flex-col items-center">
                                                            <div className="transform group-hover:scale-110 transition-transform duration-200">
                                                                {item.icon}
                                                            </div>
                                                            <span className="mt-3 text-sm font-bold">{item.label}</span>
                                                        </div>
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 h-1 ${item.bar} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300`}
                                                        />
                                                    </Link>
                                                </motion.div>
                                            ))}

                                            {/* Copy Subjects button (only admin) */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setShowCopyDialog(true)}
                                                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] min-w-[150px]"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    <div className="relative z-10 flex flex-col items-center">
                                                        <Copy size={20} className="group-hover:scale-110 transition-transform duration-300" />
                                                        <span className="mt-2 text-sm font-medium">Copy Subjects</span>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>

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
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Subjects List */}
                            <div className="lg:w-1/3">
                                <div className={`${cardBg} px-2 py-8 rounded-2xl shadow-2xl ${borderColor} border-2`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className={`text-2xl font-black ${textColor} mb-1`}>
                                                {selectedBranch}
                                            </h2>
                                            <p className={`text-sm font-semibold ${secondaryText}`}>
                                                Year {selectedYear}{selectedSemester ? ` • Semester ${selectedSemester}` : ' • All Semesters'}
                                            </p>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    setEditingSubject(null);
                                                    setNewSubject({ name: '', code: '', modules: [] });
                                                    setShowAddSubject(true);
                                                }}
                                                className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                                                disabled={!selectedBranch}
                                            >
                                                <Plus size={20} />
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
                                        <div className="space-y-3">
                                            {syllabusData.length > 0 ? (
                                                syllabusData.map(subject => (
                                                    <motion.div
                                                        key={subject.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`
                                                        p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
                                                        ${selectedSubject?.id === subject.id
                                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-400 dark:from-purple-900/30 dark:to-pink-900/30 dark:border-purple-500 shadow-lg'
                                                                : `${theme === 'dark'
                                                                    ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600 hover:border-gray-500'
                                                                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'} shadow-sm hover:shadow-md`
                                                            }
                                                    `}
                                                        onClick={() => setSelectedSubject(subject)}
                                                    >
                                                        <div className="flex justify-between items-center gap-4">
                                                            <div className="flex-2 min-w-40 pl-1">
                                                                <h3 className={`font-bold text-lg ${textColor}`}>{subject.name}</h3>
                                                                <p className={`text-sm font-medium ${secondaryText} mt-1 flex items-center gap-1 whitespace-nowrap`}>
                                                                    <BookOpen className="w-4 h-4 shrink-0" />
                                                                    <span className="truncate">{subject.code} • Semester {subject.semester}</span>
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <span className={`text-sm font-bold min-w-[3rem] text-right ${selectedSubject?.id === subject.id ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-500 dark:text-indigo-400'}`}>
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
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className={`text-center py-12 ${cardBg} rounded-xl border-2 border-dashed ${borderColor}`}>
                                                    <BookOpen className={`w-12 h-12 mx-auto mb-3 ${secondaryText}`} />
                                                    <p className={`${secondaryText} text-lg font-medium`}>No subjects found</p>
                                                    <p className={`${secondaryText} text-sm mt-2`}>Select a branch, year, and semester to view subjects</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modules and Progress */}
                            <div className="lg:w-2/3" id="subject-details">
                                {selectedSubject ? (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`${cardBg} p-8 rounded-2xl shadow-xl ${borderColor} border-2`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className={`text-3xl font-black ${textColor} mb-2 flex items-center gap-2`}>
                                                    <BookOpen className="w-8 h-8" />
                                                    {selectedSubject.name}
                                                </h2>
                                                <p className={`${secondaryText} font-semibold text-lg`}>
                                                    {selectedSubject.code} • Semester {selectedSubject.semester}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => exportSyllabusToPDF(selectedSubject)}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                                    title="Download Syllabus PDF"
                                                >
                                                    <Download size={16} />
                                                    <span className="hidden sm:inline">Download Syllabus</span>
                                                </button>
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
                                                <div className={`text-center py-12 ${cardBg} rounded-xl border-2 border-dashed ${borderColor}`}>
                                                    <FileText className={`w-12 h-12 mx-auto mb-3 ${secondaryText}`} />
                                                    <p className={`${secondaryText} text-lg font-medium`}>No modules defined for this subject</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`${cardBg} p-12 rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[400px] ${borderColor} border-2 border-dashed`}
                                    >
                                        <div className="text-center">
                                            <BookOpen className={`w-24 h-24 mx-auto mb-6 ${secondaryText}`} />
                                            <p className={`${textColor} text-2xl font-bold mb-2`}>
                                                {syllabusData.length > 0
                                                    ? "Select a subject to view modules"
                                                    : "No subjects available"}
                                            </p>
                                            <p className={`${secondaryText} text-sm`}>
                                                {syllabusData.length > 0
                                                    ? "Choose a subject from the list to see its modules and track your progress"
                                                    : "No subjects found for the selected branch, year, and semester"}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </Suspense>
        </ProtectedRoute>

    );
}