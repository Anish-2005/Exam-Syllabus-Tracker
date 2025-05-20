'use client'
import { Suspense, useEffect, useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/context/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { db } from '../components/lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, getDocs, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { User, Moon, Sun, Send, Trash2, Menu, MessageCircle, X } from 'lucide-react'; // Added X icon
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900';

    useEffect(() => {
        if (user && user.email === "anishseth0510@gmail.com") {
            setIsAdmin(true);
        }
    }, [user]);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                setLoading(true);
                // Get messages from the last 24 hours
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                
                const q = query(
                    collection(db, 'chatMessages'),
                    where('timestamp', '>', twentyFourHoursAgo),
                    orderBy('timestamp', 'desc')
                );

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

        if (user) loadMessages();
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            await addDoc(collection(db, 'chatMessages'), {
                text: newMessage,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || null,
                userId: user.uid,
                isAdmin: isAdmin,
                timestamp: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const deleteAllMessages = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete all chat messages? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            const messagesSnapshot = await getDocs(collection(db, 'chatMessages'));
            const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error deleting messages:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
                <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                    {/* Header */}
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
                    Study Chat
                </h1>

                {isAdmin && (
                    <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs rounded-full shadow-sm">
                        ADMIN
                    </span>
                )}
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
                {isAdmin && (
                    <button
                        onClick={deleteAllMessages}
                        className="flex items-center text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete all messages"
                    >
                        <Trash2 size={18} className="mr-1" />
                        <span>Clear Chat</span>
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

                <span className={`hidden sm:inline-block ${secondaryText} text-sm md:text-base truncate max-w-[200px]`}>
                    {user?.displayName || user?.email}
                </span>

                <Link
                    href="/chat"
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        router.pathname === '/chat'
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                            : ''
                    }`}
                    aria-label="Chat"
                >
                    <div className="relative">
                        <MessageCircle
                            size={23}
                            className={`text-blue-400 transition-transform duration-200 ${
                                router.pathname === '/chat'
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
                            Study Chat
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

                {isAdmin && (
                    <button
                        onClick={() => {
                            deleteAllMessages();
                            setSidebarOpen(false);
                        }}
                        className={`px-3 py-2 rounded-md text-base font-medium text-left flex items-center space-x-2 ${
                            isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                        }`}
                    >
                        <Trash2 size={18} />
                        <span>Clear Chat</span>
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

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`p-2 w-full rounded-md transition-all duration-300 flex justify-center items-center ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
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

                    <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className={`${cardBg} rounded-lg shadow ${borderColor} border overflow-hidden`}>
                            {/* Messages Container */}
                            <div className="h-[calc(100vh-220px)] overflow-y-auto p-4">
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
                        </div>
                    </main>
                </div>
            </Suspense>
        </ProtectedRoute>
    );
}