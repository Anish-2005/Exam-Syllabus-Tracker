'use client'
import { Suspense, useEffect, useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/context/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { db } from '../components/lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, getDocs, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Link from 'next/link';
import { User, Moon, Sun, Send, Trash2, Menu, MessageCircle, X, Users, Plus, Search, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme, isDark } = useTheme();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [showRoomList, setShowRoomList] = useState(true);
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roomMembers, setRoomMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showRoomSettings, setShowRoomSettings] = useState(false);
    const [newAdminId, setNewAdminId] = useState('');

    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';

    // Check if user is super admin
    useEffect(() => {
        if (user && user.email === "anishseth0510@gmail.com") {
            setIsSuperAdmin(true);
        }
    }, [user]);

    // Load all chat rooms the user is part of
    useEffect(() => {
        const loadRooms = async () => {
            if (!user) return;
            
            try {
                const q = query(
                    collection(db, 'chatRooms'),
                    where('members', 'array-contains', user.uid)
                );
                
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const loadedRooms = [];
                    querySnapshot.forEach((doc) => {
                        loadedRooms.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    // Add global room if not exists
                    if (!loadedRooms.some(room => room.id === 'global')) {
                        loadedRooms.unshift({
                            id: 'global',
                            name: 'Global Chat',
                            isGlobal: true,
                            members: ['all'], // Special marker for global room
                            admin: 'superadmin' // Super admin controls global room
                        });
                    }
                    
                    setRooms(loadedRooms);
                    
                    // If no room is selected, select the first one
                    if (!currentRoom && loadedRooms.length > 0) {
                        setCurrentRoom(loadedRooms[0]);
                    }
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error loading rooms:', error);
            }
        };

        loadRooms();
    }, [user]);

    // Load messages for the current room
    useEffect(() => {
        const loadMessages = async () => {
            if (!currentRoom) return;
            
            try {
                setLoading(true);
                // Messages auto-delete after 30 days
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                
                let q;
                if (currentRoom.id === 'global') {
                    q = query(
                        collection(db, 'globalMessages'),
                        where('timestamp', '>', thirtyDaysAgo),
                        orderBy('timestamp', 'desc')
                    );
                } else {
                    q = query(
                        collection(db, 'chatRooms', currentRoom.id, 'messages'),
                        where('timestamp', '>', thirtyDaysAgo),
                        orderBy('timestamp', 'desc')
                    );
                }

                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const loadedMessages = [];
                    querySnapshot.forEach((doc) => {
                        loadedMessages.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    setMessages(loadedMessages);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error loading messages:', error);
                setLoading(false);
            }
        };

        if (currentRoom) loadMessages();
    }, [currentRoom]);

    // Load all users for room creation
    useEffect(() => {
        const loadAllUsers = async () => {
            try {
                const q = query(collection(db, 'users'));
                const querySnapshot = await getDocs(q);
                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setAllUsers(users);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };

        if (showCreateRoomModal) loadAllUsers();
    }, [showCreateRoomModal]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !currentRoom) return;

        try {
            const messageData = {
                text: newMessage,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || null,
                userId: user.uid,
                isAdmin: isSuperAdmin || currentRoom.admin === user.uid,
                timestamp: serverTimestamp()
            };

            if (currentRoom.id === 'global') {
                await addDoc(collection(db, 'globalMessages'), messageData);
            } else {
                await addDoc(collection(db, 'chatRooms', currentRoom.id, 'messages'), messageData);
            }
            
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const createNewRoom = async () => {
        if (!newRoomName.trim() || roomMembers.length === 0 || !user) return;

        try {
            const newRoom = {
                name: newRoomName,
                admin: user.uid,
                members: [...roomMembers, user.uid], // Include creator as member
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'chatRooms'), newRoom);
            
            // Add the room to the user's rooms list
            await updateDoc(doc(db, 'users', user.uid), {
                rooms: arrayUnion(docRef.id)
            });

            setNewRoomName('');
            setRoomMembers([]);
            setShowCreateRoomModal(false);
            setCurrentRoom({ id: docRef.id, ...newRoom });
            setShowRoomList(false);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const deleteRoom = async (roomId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this room? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'chatRooms', roomId));
            if (currentRoom && currentRoom.id === roomId) {
                setCurrentRoom(null);
            }
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const leaveRoom = async (roomId) => {
        const confirmLeave = window.confirm("Are you sure you want to leave this room?");
        if (!confirmLeave) return;

        try {
            await updateDoc(doc(db, 'chatRooms', roomId), {
                members: arrayRemove(user.uid)
            });
            
            if (currentRoom && currentRoom.id === roomId) {
                setCurrentRoom(null);
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    };

    const transferAdmin = async () => {
        if (!newAdminId || !currentRoom) return;

        try {
            // Update room admin
            await updateDoc(doc(db, 'chatRooms', currentRoom.id), {
                admin: newAdminId
            });

            setShowRoomSettings(false);
            setNewAdminId('');
        } catch (error) {
            console.error('Error transferring admin:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isRoomAdmin = () => {
        if (!currentRoom) return false;
        return isSuperAdmin || currentRoom.admin === user?.uid;
    };

    const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute>
        <Suspense fallback={<div>Loading...</div>}>
            <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                {/* Header */}
                <nav className={`${cardBg} shadow-lg ${borderColor} border-b sticky top-0 z-50`}>
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
                            {/* Left Section */}
                            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                {!showRoomList && (
                                    <button
                                        onClick={() => setShowRoomList(true)}
                                        className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0"
                                        aria-label="Back to Rooms"
                                    >
                                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                                    </button>
                                )}
                                <Link
                                    href="/dashboard"
                                    className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0"
                                    aria-label="Back to Dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                                <Image
                                    src="/emblem.png"
                                    alt="NeuraMark Logo"
                                    width={28}
                                    height={28}
                                    className="rounded-sm shadow-sm shrink-0 sm:w-9 sm:h-9"
                                    priority
                                />
                                <h1 className={`text-base sm:text-lg md:text-2xl font-bold ${textColor} tracking-tight truncate max-w-[100px] sm:max-w-[140px] md:max-w-xs`}>
                                    Study Chat
                                </h1>

                                {isSuperAdmin && (
                                    <span className="ml-1 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-[10px] sm:text-xs rounded-full shadow-sm shrink-0">
                                        <span className="hidden sm:inline">SUPER ADMIN</span>
                                        <span className="sm:hidden">ADMIN</span>
                                    </span>
                                )}
                            </div>

                            {/* Desktop Controls */}
                            <div className="hidden lg:flex items-center space-x-4">
                                {currentRoom && isRoomAdmin() && (
                                    <button
                                        onClick={() => setShowRoomSettings(true)}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        title="Room settings"
                                    >
                                        <Users size={18} className="mr-1" />
                                        <span>Manage Room</span>
                                    </button>
                                )}

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

                                <span className={`hidden xl:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[200px]`}>
                                    {user?.displayName || user?.email}
                                </span>

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

                            {/* Mobile/Tablet Controls */}
                            <div className="flex lg:hidden items-center space-x-2">
                                {/* Mobile Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className={`p-1.5 sm:p-2 rounded-full transition-all duration-300
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
                                                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>

                                {/* Hamburger Menu */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    aria-label="Open Menu"
                                    className="p-1.5 sm:p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                            
                            {/* Sidebar */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'tween', duration: 0.3 }}
                                className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] p-4 flex flex-col gap-4 shadow-lg ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} lg:hidden`}
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
                                                Study Chat
                                            </h2>
                                            {isSuperAdmin && (
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
                                        className={`px-3 py-2 rounded-md text-base font-medium ${
                                            router.pathname === '/dashboard'
                                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                                : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        href="/chat"
                                        onClick={() => setSidebarOpen(false)}
                                        className={`px-3 py-2 rounded-md text-base font-medium ${
                                            router.pathname === '/chat'
                                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                                : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        Chat
                                    </Link>

                                    {/* Mobile Room Settings */}
                                    {currentRoom && isRoomAdmin() && (
                                        <button
                                            onClick={() => {
                                                setShowRoomSettings(true);
                                                setSidebarOpen(false);
                                            }}
                                            className="px-3 py-2 rounded-md text-base font-medium text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Users size={18} className="inline mr-2" />
                                            Manage Room
                                        </button>
                                    )}
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
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8">
                    <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
                        {/* Room List Sidebar - Desktop Only */}
                        <AnimatePresence>
                            {showRoomList && (
                                <motion.div
                                    initial={{ x: -300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -300, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className={`hidden md:flex w-64 lg:w-80 flex-shrink-0 ${cardBg} rounded-lg shadow ${borderColor} border mr-4 flex-col`}
                                >
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <h2 className={`text-lg font-semibold ${textColor}`}>Chat Rooms</h2>
                                        <button
                                            onClick={() => setShowCreateRoomModal(true)}
                                            className="p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                            title="Create new room"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search rooms..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={`w-full pl-8 pr-4 py-2 rounded-lg ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border`}
                                            />
                                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredRooms.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                <p className={`text-lg ${secondaryText}`}>No rooms found</p>
                                                <button
                                                    onClick={() => setShowCreateRoomModal(true)}
                                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                                >
                                                    Create Room
                                                </button>
                                            </div>
                                        ) : (
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredRooms.map((room) => (
                                                    <li key={room.id}>
                                                        <button
                                                            onClick={() => {
                                                                setCurrentRoom(room);
                                                                setShowRoomList(false);
                                                            }}
                                                            className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center ${
                                                                currentRoom?.id === room.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                            }`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-medium truncate ${textColor}`}>
                                                                    {room.name}
                                                                    {room.isGlobal && (
                                                                        <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                                            Global
                                                                        </span>
                                                                    )}
                                                                    {room.admin === user?.uid && !room.isGlobal && (
                                                                        <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                                                                            Admin
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className={`text-xs truncate ${secondaryText}`}>
                                                                    {room.members?.length || 0} members
                                                                </p>
                                                            </div>
                                                            {isSuperAdmin && !room.isGlobal && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteRoom(room.id);
                                                                    }}
                                                                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                                    title="Delete room"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile Room List Overlay */}
                        <AnimatePresence>
                            {showRoomList && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                                    onClick={() => setShowRoomList(false)}
                                >
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '-100%' }}
                                        transition={{ type: 'tween', duration: 0.3 }}
                                        className={`w-80 max-w-[85vw] h-full ${cardBg} shadow-lg flex flex-col`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                            <h2 className={`text-lg font-semibold ${textColor}`}>Chat Rooms</h2>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setShowCreateRoomModal(true)}
                                                    className="p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                                    title="Create new room"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setShowRoomList(false)}
                                                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search rooms..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className={`w-full pl-8 pr-4 py-2 rounded-lg ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border text-sm`}
                                                />
                                                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto">
                                            {filteredRooms.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                    <p className={`text-base ${secondaryText}`}>No rooms found</p>
                                                    <button
                                                        onClick={() => setShowCreateRoomModal(true)}
                                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                                    >
                                                        Create Room
                                                    </button>
                                                </div>
                                            ) : (
                                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {filteredRooms.map((room) => (
                                                        <li key={room.id}>
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentRoom(room);
                                                                    setShowRoomList(false);
                                                                }}
                                                                className={`w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center ${
                                                                    currentRoom?.id === room.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                                }`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${textColor}`}>
                                                                        {room.name}
                                                                        {room.isGlobal && (
                                                                            <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                                                Global
                                                                            </span>
                                                                        )}
                                                                        {room.admin === user?.uid && !room.isGlobal && (
                                                                            <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                                                                                Admin
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className={`text-xs truncate ${secondaryText}`}>
                                                                        {room.members?.length || 0} members
                                                                    </p>
                                                                </div>
                                                                {isSuperAdmin && !room.isGlobal && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteRoom(room.id);
                                                                        }}
                                                                        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                                        title="Delete room"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                            {/* Chat Area */}
                            <div className={`flex-1 ${cardBg} rounded-lg shadow ${borderColor} border overflow-hidden flex flex-col`}>
                                {!currentRoom ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <MessageCircle size={48} className="text-gray-400 mb-4" />
                                        <h3 className={`text-xl font-medium ${textColor} mb-2`}>
                                            {showRoomList ? 'Select a room' : 'No room selected'}
                                        </h3>
                                        <p className={`max-w-md ${secondaryText} mb-6`}>
                                            {showRoomList ? 'Select a chat room from the list or create a new one' : 'Go back to room list to select a chat room'}
                                        </p>
                                        {!showRoomList && (
                                            <button
                                                onClick={() => setShowRoomList(true)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                            >
                                                Browse Rooms
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Room Header */}
                                        <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => setShowRoomList(true)}
                                                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <h2 className={`text-lg font-semibold ${textColor}`}>
                                                    {currentRoom.name}
                                                    {currentRoom.isGlobal && (
                                                        <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                            Global
                                                        </span>
                                                    )}
                                                    {!currentRoom.isGlobal && isRoomAdmin() && (
                                                        <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                                                            Admin
                                                        </span>
                                                    )}
                                                </h2>
                                            </div>
                                            {!currentRoom.isGlobal && (
                                                <div className="flex space-x-2">
                                                    {isRoomAdmin() && (
                                                        <button
                                                            onClick={() => setShowRoomSettings(true)}
                                                            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                            title="Room settings"
                                                        >
                                                            <Users size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => leaveRoom(currentRoom.id)}
                                                        className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                        title="Leave room"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Messages Container */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {loading ? (
                                                <div className="flex justify-center items-center h-full">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center">
                                                    <p className={`text-lg ${secondaryText}`}>No messages yet</p>
                                                    <p className={`text-sm ${secondaryText} mt-2`}>Be the first to start the conversation!</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col-reverse space-y-reverse space-y-4">
                                                    <div ref={messagesEndRef} />
                                                    {messages.map((message) => (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${message.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div
                                                                className={`flex max-w-xs sm:max-w-md md:max-w-lg rounded-lg px-4 py-2 relative
                                                                    ${message.userId === user?.uid
                                                                        ? isDark
                                                                            ? 'bg-indigo-600'
                                                                            : 'bg-indigo-500 text-white'
                                                                        : message.isAdmin
                                                                            ? isDark
                                                                                ? 'bg-yellow-700'
                                                                                : 'bg-yellow-500 text-white'
                                                                            : isDark
                                                                                ? 'bg-gray-700'
                                                                                : 'bg-gray-100'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center space-x-2">
                                                                        {message.photoURL ? (
                                                                            <Image
                                                                                src={message.photoURL}
                                                                                alt={message.displayName}
                                                                                width={24}
                                                                                height={24}
                                                                                className="rounded-full"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                                                                                <span className="text-xs">
                                                                                    {message.displayName.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <span className={`font-medium ${message.userId === user?.uid || message.isAdmin ? 'text-white' : secondaryText}`}>
                                                                            {message.displayName}
                                                                            {message.isAdmin && (
                                                                                <span className="ml-1 text-xs bg-yellow-600 text-white px-1 rounded">
                                                                                    ADMIN
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                        <span className={`text-xs ${message.userId === user?.uid || message.isAdmin ? 'text-gray-200' : secondaryText}`}>
                                                                            {formatTime(message.timestamp)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-1 text-sm break-words">{message.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Input */}
                                        <div className={`border-t ${borderColor} p-4`}>
                                            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className={`flex-1 px-4 py-2 rounded-full ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border`}
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim() || loading}
                                                    className={`p-2 rounded-full ${newMessage.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-colors duration-200`}
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Create Room Modal */}
                    <AnimatePresence>
                        {showCreateRoomModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowCreateRoomModal(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className={`w-full max-w-md ${cardBg} rounded-lg shadow-xl p-6`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Create New Room</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="roomName" className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                                                Room Name
                                            </label>
                                            <input
                                                type="text"
                                                id="roomName"
                                                value={newRoomName}
                                                onChange={(e) => setNewRoomName(e.target.value)}
                                                className={`w-full px-3 py-2 rounded-md ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border`}
                                                placeholder="Enter room name"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                                                Add Members
                                            </label>
                                            <div className={`max-h-60 overflow-y-auto p-2 rounded-md ${borderColor} border`}>
                                                {allUsers.filter(u => u.id !== user?.uid).map((userItem) => (
                                                    <div key={userItem.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                        <div className="flex items-center space-x-2">
                                                            {userItem.photoURL ? (
                                                                <Image
                                                                    src={userItem.photoURL}
                                                                    alt={userItem.displayName}
                                                                    width={32}
                                                                    height={32}
                                                                    className="rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                                                    <User size={16} />
                                                                </div>
                                                            )}
                                                            <span className={textColor}>
                                                                {userItem.displayName || userItem.email}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if (roomMembers.includes(userItem.id)) {
                                                                    setRoomMembers(roomMembers.filter(id => id !== userItem.id));
                                                                } else {
                                                                    setRoomMembers([...roomMembers, userItem.id]);
                                                                }
                                                            }}
                                                            className={`px-2 py-1 rounded text-xs ${
                                                                roomMembers.includes(userItem.id)
                                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                            }`}
                                                        >
                                                            {roomMembers.includes(userItem.id) ? 'Remove' : 'Add'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateRoomModal(false)}
                                               className={`px-4 py-2 rounded-md ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-sm`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={createNewRoom}
                                                disabled={!newRoomName.trim() || roomMembers.length === 0}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                Create Room
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Room Settings Modal */}
                    <AnimatePresence>
                        {showRoomSettings && currentRoom && !currentRoom.isGlobal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowRoomSettings(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className={`w-full max-w-md ${cardBg} rounded-lg shadow-xl p-6`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Room Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className={`text-sm font-medium mb-2 ${secondaryText}`}>Transfer Admin Rights</h4>
                                            <select
                                                value={newAdminId}
                                                onChange={(e) => setNewAdminId(e.target.value)}
                                                className={`w-full px-3 py-2 rounded-md ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border`}
                                            >
                                                <option value="">Select new admin</option>
                                                {currentRoom.members?.filter(memberId => memberId !== user?.uid).map((memberId) => {
                                                    const member = allUsers.find(u => u.id === memberId);
                                                    return member ? (
                                                        <option key={memberId} value={memberId}>
                                                            {member.displayName || member.email}
                                                        </option>
                                                    ) : null;
                                                })}
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowRoomSettings(false)}
                                                className={`px-4 py-2 rounded-md ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-sm`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={transferAdmin}
                                                disabled={!newAdminId}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                Transfer Admin
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Suspense>
        </ProtectedRoute>
    );
}