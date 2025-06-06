"use client"
import { Suspense, useEffect, useState, useRef } from "react"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../components/context/AuthContext"
import { useTheme } from "../components/ThemeContext"
import { db } from "../components/lib/firebase"
import {
    collection,
    query,
    orderBy,
    addDoc,
    serverTimestamp,
    deleteDoc,
    getDocs,
    where,
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
} from "firebase/firestore"
import Link from "next/link"
import {
    User,
    Moon,
    Sun,
    Send,
    Menu,
    MessageCircle,
    X,
    Users,
    Plus,
    Search,
    ChevronLeft,
    Copy,
    Check,
    Shield,
    UserPlus,
    UserMinus,
    Clock,
    EyeOff,
    Key,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Generate random room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function ChatPage() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { theme, toggleTheme, isDark } = useTheme()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const messagesEndRef = useRef(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [rooms, setRooms] = useState([])
    const [currentRoom, setCurrentRoom] = useState(null)
    const [showRoomList, setShowRoomList] = useState(true)
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
    const [showJoinRoomModal, setShowJoinRoomModal] = useState(false)
    const [showMembersModal, setShowMembersModal] = useState(false)
    const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false)
    const [newRoomName, setNewRoomName] = useState("")
    const [newRoomType, setNewRoomType] = useState("public")
    const [joinRoomCode, setJoinRoomCode] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [roomMembers, setRoomMembers] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [showRoomSettings, setShowRoomSettings] = useState(false)
    const [newAdminId, setNewAdminId] = useState("")
    const [copiedCode, setCopiedCode] = useState(false)
    const [pendingRequests, setPendingRequests] = useState([])
    const [currentRoomMembers, setCurrentRoomMembers] = useState([])

    // Enhanced color scheme
    const bgColor = isDark ? "bg-gray-900" : "bg-gray-50"
    const cardBg = isDark ? "bg-gray-800" : "bg-white"
    const textColor = isDark ? "text-gray-100" : "text-gray-900"
    const secondaryText = isDark ? "text-gray-400" : "text-gray-500"
    const borderColor = isDark ? "border-gray-700" : "border-gray-200"
    const inputBg = isDark ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"
    const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
    const activeBg = isDark ? "active:bg-gray-600" : "active:bg-gray-200"

    // Check if user is super admin
    useEffect(() => {
        if (user && user.email === "anishseth0510@gmail.com") {
            setIsSuperAdmin(true)
        }
    }, [user])
    // Load all chat rooms the user is part of or has access to
    useEffect(() => {
        const loadRooms = async () => {
            if (!user) return

            try {
                let q
                if (isSuperAdmin) {
                    // Super admin can see all rooms
                    q = query(collection(db, "chatRooms"))
                } else {
                    // Regular users see only rooms they're members of
                    q = query(collection(db, "chatRooms"), where("members", "array-contains", user.uid))
                }

                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const loadedRooms = []
                    querySnapshot.forEach((doc) => {
                        loadedRooms.push({
                            id: doc.id,
                            ...doc.data(),
                        })
                    })

                    // Add global room if not exists
                    if (!loadedRooms.some((room) => room.id === "global")) {
                        loadedRooms.unshift({
                            id: "global",
                            name: "Global Chat",
                            isGlobal: true,
                            members: ["all"],
                            admin: "superadmin",
                            type: "public",
                        })
                    }

                    setRooms(loadedRooms)

                    if (!currentRoom && loadedRooms.length > 0) {
                        setCurrentRoom(loadedRooms[0])
                    }
                })

                return () => unsubscribe()
            } catch (error) {
                console.error("Error loading rooms:", error)
            }
        }

        loadRooms()
    }, [user, isSuperAdmin])

    // Load messages for the current room
    useEffect(() => {
        const loadMessages = async () => {
            if (!currentRoom) return

            try {
                setLoading(true)
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

                let q
                if (currentRoom.id === "global") {
                    q = query(
                        collection(db, "globalMessages"),
                        where("timestamp", ">", thirtyDaysAgo),
                        orderBy("timestamp", "desc"),
                    )
                } else {
                    q = query(
                        collection(db, "chatRooms", currentRoom.id, "messages"),
                        where("timestamp", ">", thirtyDaysAgo),
                        orderBy("timestamp", "desc"),
                    )
                }

                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const loadedMessages = []
                    querySnapshot.forEach((doc) => {
                        loadedMessages.push({
                            id: doc.id,
                            ...doc.data(),
                        })
                    })
                    setMessages(loadedMessages)
                    setLoading(false)
                })

                return () => unsubscribe()
            } catch (error) {
                console.error("Error loading messages:", error)
                setLoading(false)
            }
        }

        if (currentRoom) loadMessages()
    }, [currentRoom])

    // Load current room members
    useEffect(() => {
        const loadCurrentRoomMembers = async () => {
            if (!currentRoom || currentRoom.isGlobal) return

            try {
                const memberDetails = []
                for (const memberId of currentRoom.members || []) {
                    const userDoc = await getDoc(doc(db, "users", memberId))
                    if (userDoc.exists()) {
                        memberDetails.push({
                            id: memberId,
                            ...userDoc.data(),
                            role:
                                currentRoom.admin === memberId
                                    ? "admin"
                                    : currentRoom.moderators?.includes(memberId)
                                        ? "moderator"
                                        : "member",
                        })
                    }
                }
                setCurrentRoomMembers(memberDetails)
            } catch (error) {
                console.error("Error loading room members:", error)
            }
        }

        loadCurrentRoomMembers()
    }, [currentRoom])

    // Load pending requests for current room
    useEffect(() => {
        const loadPendingRequests = async () => {
            if (!currentRoom || currentRoom.isGlobal || currentRoom.type !== "private") return

            try {
                const q = query(
                    collection(db, "joinRequests"),
                    where("roomId", "==", currentRoom.id),
                    where("status", "==", "pending"),
                )

                const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                    const requests = []
                    for (const docSnap of querySnapshot.docs) {
                        const requestData = docSnap.data()
                        const userDoc = await getDoc(doc(db, "users", requestData.userId))
                        if (userDoc.exists()) {
                            requests.push({
                                id: docSnap.id,
                                ...requestData,
                                userDetails: userDoc.data(),
                            })
                        }
                    }
                    setPendingRequests(requests)
                })

                return () => unsubscribe()
            } catch (error) {
                console.error("Error loading pending requests:", error)
            }
        }

        loadPendingRequests()
    }, [currentRoom])

    // Load all users for room creation
    useEffect(() => {
        const loadAllUsers = async () => {
            try {
                const q = query(collection(db, "users"))
                const querySnapshot = await getDocs(q)
                const users = []
                querySnapshot.forEach((doc) => {
                    users.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                setAllUsers(users)
            } catch (error) {
                console.error("Error loading users:", error)
            }
        }

        if (showCreateRoomModal) loadAllUsers()
    }, [showCreateRoomModal])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !currentRoom) return;

        try {
            const userRole = getUserRole();

            const messageData = {
                text: newMessage,
                displayName: user.displayName || "Anonymous",
                photoURL: user.photoURL || null,
                userId: user.uid,
                timestamp: serverTimestamp(),
                isAdmin: !!(isSuperAdmin || currentRoom.admin === user.uid),  // always boolean
                isModerator: !!currentRoom.moderators?.includes(user.uid),    // always boolean
                role: userRole || "member",                                   // always string
            };

            const targetCollection =
                currentRoom.id === "global"
                    ? collection(db, "globalMessages")
                    : collection(db, "chatRooms", currentRoom.id, "messages");

            await addDoc(targetCollection, messageData);
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };



    const createNewRoom = async () => {
        if (!newRoomName.trim() || !user) return

        try {
            const roomCode = generateRoomCode()
            const newRoom = {
                name: newRoomName,
                code: roomCode,
                type: newRoomType,
                admin: user.uid,
                moderators: [],
                members: [user.uid],
                createdAt: serverTimestamp(),
            }

            const docRef = await addDoc(collection(db, "chatRooms"), newRoom)

            setNewRoomName("")
            setNewRoomType("public")
            setRoomMembers([])
            setShowCreateRoomModal(false)
            setCurrentRoom({ id: docRef.id, ...newRoom })
            setShowRoomList(false)
        } catch (error) {
            console.error("Error creating room:", error)
        }
    }

    const joinRoomByCode = async () => {
        if (!joinRoomCode.trim() || !user) return

        try {
            const q = query(collection(db, "chatRooms"), where("code", "==", joinRoomCode.toUpperCase()))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                alert("Room not found. Please check the room code.")
                return
            }

            const roomDoc = querySnapshot.docs[0]
            const roomData = roomDoc.data()

            // Check if user is already a member
            if (roomData.members?.includes(user.uid)) {
                alert("You are already a member of this room.")
                setJoinRoomCode("")
                setShowJoinRoomModal(false)
                return
            }

            if (roomData.type === "public") {
                // Join public room directly
                await updateDoc(doc(db, "chatRooms", roomDoc.id), {
                    members: arrayUnion(user.uid),
                })
                alert("Successfully joined the room!")
            } else {
                // Request to join private room
                await addDoc(collection(db, "joinRequests"), {
                    roomId: roomDoc.id,
                    userId: user.uid,
                    status: "pending",
                    requestedAt: serverTimestamp(),
                })
                alert("Join request sent! Wait for approval from room admin or moderator.")
            }

            setJoinRoomCode("")
            setShowJoinRoomModal(false)
        } catch (error) {
            console.error("Error joining room:", error)
            alert("Error joining room. Please try again.")
        }
    }

    const handleJoinRequest = async (requestId, action) => {
        try {
            const requestDoc = await getDoc(doc(db, "joinRequests", requestId))
            if (!requestDoc.exists()) return

            const requestData = requestDoc.data()

            if (action === "approve") {
                await updateDoc(doc(db, "chatRooms", requestData.roomId), {
                    members: arrayUnion(requestData.userId),
                })
            }

            await updateDoc(doc(db, "joinRequests", requestId), {
                status: action === "approve" ? "approved" : "rejected",
                handledAt: serverTimestamp(),
                handledBy: user.uid,
            })
        } catch (error) {
            console.error("Error handling join request:", error)
        }
    }

    const makeUserModerator = async (userId) => {
        if (!currentRoom || !canManageRoles()) return

        try {
            await updateDoc(doc(db, "chatRooms", currentRoom.id), {
                moderators: arrayUnion(userId),
            })
        } catch (error) {
            console.error("Error making user moderator:", error)
        }
    }

    const removeUserModerator = async (userId) => {
        if (!currentRoom || !canManageRoles()) return

        try {
            await updateDoc(doc(db, "chatRooms", currentRoom.id), {
                moderators: arrayRemove(userId),
            })
        } catch (error) {
            console.error("Error removing user moderator:", error)
        }
    }

    const removeUserFromRoom = async (userId) => {
        if (!currentRoom || !canManageMembers()) return

        const confirmRemove = window.confirm("Are you sure you want to remove this user from the room?")
        if (!confirmRemove) return

        try {
            await updateDoc(doc(db, "chatRooms", currentRoom.id), {
                members: arrayRemove(userId),
                moderators: arrayRemove(userId), // Also remove from moderators if they were one
            })
        } catch (error) {
            console.error("Error removing user from room:", error)
        }
    }

    const deleteRoom = async (roomId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this room? This action cannot be undone.")
        if (!confirmDelete) return

        try {
            await deleteDoc(doc(db, "chatRooms", roomId))
            if (currentRoom && currentRoom.id === roomId) {
                setCurrentRoom(null)
            }
        } catch (error) {
            console.error("Error deleting room:", error)
        }
    }

    const leaveRoom = async (roomId) => {
        const confirmLeave = window.confirm("Are you sure you want to leave this room?")
        if (!confirmLeave) return

        try {
            await updateDoc(doc(db, "chatRooms", roomId), {
                members: arrayRemove(user.uid),
                moderators: arrayRemove(user.uid),
            })

            if (currentRoom && currentRoom.id === roomId) {
                setCurrentRoom(null)
            }
        } catch (error) {
            console.error("Error leaving room:", error)
        }
    }

    const transferAdmin = async () => {
        if (!newAdminId || !currentRoom) return

        try {
            await updateDoc(doc(db, "chatRooms", currentRoom.id), {
                admin: newAdminId,
                moderators: arrayRemove(newAdminId), // Remove from moderators if they were one
            })

            setShowRoomSettings(false)
            setNewAdminId("")
        } catch (error) {
            console.error("Error transferring admin:", error)
        }
    }

    const copyRoomCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code)
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 2000)
        } catch (error) {
            console.error("Error copying room code:", error)
        }
    }

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return ""
        const date = timestamp.toDate()
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const getUserRole = () => {
        if (!currentRoom || currentRoom.isGlobal) return "member"
        if (isSuperAdmin) return "superadmin"
        if (currentRoom.admin === user?.uid) return "admin"
        if (currentRoom.moderators?.includes(user?.uid)) return "moderator"
        return "member"
    }

    const canManageRoles = () => {
        const role = getUserRole()
        return role === "superadmin" || role === "admin"
    }

    const canManageMembers = () => {
        const role = getUserRole()
        return role === "superadmin" || role === "admin" || role === "moderator"
    }

    const canManageRequests = () => {
        const role = getUserRole()
        return role === "superadmin" || role === "admin" || role === "moderator"
    }

    const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const getRoleBadge = (role) => {
        switch (role) {
            case "superadmin":
                return <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">SUPER ADMIN</span>
            case "admin":
                return <span className="ml-1 text-xs bg-green-700 text-white px-1.5 py-0.5 rounded">ADMIN</span>
            case "moderator":
                return <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">MOD</span>
            default:
                return null
        }
    }

    return (
        <ProtectedRoute>
            <Suspense
                fallback={
                    <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                }
            >
                <div className={`min-h-screen ${bgColor} transition-colors duration-200`}>
                    {/* Enhanced Header */}
                    <nav className={`${isDark ? "bg-gray-800" : "bg-white"} shadow-sm ${borderColor} border-b sticky top-0 z-50`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <div className="flex items-center space-x-3">
                                    {!showRoomList && (
                                        <button
                                            onClick={() => setShowRoomList(true)}
                                            className={`p-2 rounded-full ${hoverBg} transition-colors`}
                                            aria-label="Back to Rooms"
                                        >
                                            <ChevronLeft className={`w-5 h-5 ${textColor}`} />
                                        </button>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Image src="/emblem.png" alt="Logo" width={32} height={32} className="rounded-sm" />
                                        <h1 className={`text-xl font-bold ${textColor}`}>Study Chat</h1>
                                        {isSuperAdmin && (
                                            <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs rounded-full">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Controls */}
                                <div className="hidden md:flex items-center space-x-4">
                                    {currentRoom &&
                                        canManageRequests() &&
                                        currentRoom.type === "private" &&
                                        pendingRequests.length > 0 && (
                                            <button
                                                onClick={() => setShowPendingRequestsModal(true)}
                                                className={`flex items-center text-sm ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700"} px-3 py-1 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-amber-50"} transition-colors`}
                                            >
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span>Requests ({pendingRequests.length})</span>
                                            </button>
                                        )}

                                    {currentRoom && !currentRoom.isGlobal && (
                                        <button
                                            onClick={() => setShowMembersModal(true)}
                                            className={`flex items-center text-sm ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} px-3 py-1 rounded-md ${isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"} transition-colors`}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>Members</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={toggleTheme}
                                        className={`p-2 rounded-full ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
                                    >
                                        {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                                    </button>

                                    <div className="flex items-center space-x-2 ml-2">
                                        {user?.photoURL ? (
                                            <Image
                                                src={user.photoURL || "/placeholder.svg"}
                                                alt={user.displayName || "User"}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}
                                            >
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className={`text-sm ${textColor} hidden lg:inline`}>
                                            {user?.displayName || user?.email?.split("@")[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile Controls */}
                                <div className="flex md:hidden items-center space-x-3">
                                    <button
                                        onClick={toggleTheme}
                                        className={`p-2 rounded-full ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
                                    >
                                        {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                                    </button>

                                    <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-full ${hoverBg}`}>
                                        <Menu className={`w-5 h-5 ${textColor}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Mobile Sidebar */}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                                    onClick={() => setSidebarOpen(false)}
                                />

                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "-100%" }}
                                    transition={{ type: "tween", duration: 0.3 }}
                                    className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] ${cardBg} shadow-xl flex flex-col`}
                                >
                                    <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
                                        <div className="flex items-center space-x-2">
                                            <Image src="/emblem.png" alt="Logo" width={32} height={32} className="rounded-sm" />
                                            <h2 className={`text-lg font-bold ${textColor}`}>Menu</h2>
                                        </div>
                                        <button onClick={() => setSidebarOpen(false)} className={`p-1 rounded-full ${hoverBg}`}>
                                            <X className={`w-5 h-5 ${textColor}`} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                        <Link
                                            href="/dashboard"
                                            className={`flex items-center px-3 py-2 rounded-md ${hoverBg} ${router.pathname === "/dashboard" ? (isDark ? "bg-indigo-900 text-white" : "bg-indigo-100 text-indigo-700") : ""}`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/chat"
                                            className={`flex items-center px-3 py-2 rounded-md ${hoverBg} ${router.pathname === "/chat" ? (isDark ? "bg-indigo-900 text-white" : "bg-indigo-100 text-indigo-700") : ""}`}
                                        >
                                            Chat
                                        </Link>

                                        {/* Mobile-only Room Controls */}
                                        <button
                                            onClick={() => {
                                                setShowJoinRoomModal(true)
                                                setSidebarOpen(false)
                                            }}
                                            className={`flex items-center w-full px-3 py-2 rounded-md ${isDark ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
                                        >
                                            <Key className="w-4 h-4 mr-2" />
                                            Join Room
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowCreateRoomModal(true)
                                                setSidebarOpen(false)
                                            }}
                                            className={`flex items-center w-full px-3 py-2 rounded-md ${isDark ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Room
                                        </button>

                                        {currentRoom &&
                                            canManageRequests() &&
                                            currentRoom.type === "private" &&
                                            pendingRequests.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setShowPendingRequestsModal(true)
                                                        setSidebarOpen(false)
                                                    }}
                                                    className={`flex items-center w-full px-3 py-2 rounded-md ${hoverBg}`}
                                                >
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span>Requests ({pendingRequests.length})</span>
                                                </button>
                                            )}

                                        {currentRoom && !currentRoom.isGlobal && (
                                            <button
                                                onClick={() => {
                                                    setShowMembersModal(true)
                                                    setSidebarOpen(false)
                                                }}
                                                className={`flex items-center w-full px-3 py-2 rounded-md ${hoverBg}`}
                                            >
                                                <Users className="w-4 h-4 mr-2" />
                                                <span>Members ({currentRoomMembers.length})</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className={`p-4 border-t ${borderColor}`}>
                                        <div className="flex items-center space-x-3 mb-4">
                                            {user?.photoURL ? (
                                                <Image
                                                    src={user.photoURL || "/placeholder.svg"}
                                                    alt={user.displayName || "User"}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}
                                                >
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <p className={`font-medium ${textColor}`}>{user?.displayName || user?.email?.split("@")[0]}</p>
                                                <p className={`text-xs ${secondaryText}`}>{user?.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-md hover:from-red-700 hover:to-rose-600 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex h-[calc(100vh-80px)]">
                            {/* Room List Sidebar - Desktop */}
                            {showRoomList && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`hidden md:flex w-72 flex-shrink-0 ${cardBg} rounded-lg shadow ${borderColor} border mr-6 flex-col overflow-hidden`}
                                >
                                    <div className="p-4 border-b ${borderColor}">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className={`text-lg font-semibold ${textColor}`}>Chat Rooms</h2>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setShowJoinRoomModal(true)}
                                                    className={`p-2 rounded-full ${isDark ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
                                                    title="Join room"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowCreateRoomModal(true)}
                                                    className={`p-2 rounded-full ${isDark ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
                                                    title="Create room"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Search className={`absolute left-3 top-3 ${secondaryText} w-4 h-4`} />
                                            <input
                                                type="text"
                                                placeholder="Search rooms..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2 rounded-lg ${inputBg} focus:outline-none focus:ring-2 ${isDark ? "focus:ring-indigo-500" : "focus:ring-indigo-300"} ${borderColor} border text-sm`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        {filteredRooms.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                                <MessageCircle className={`w-10 h-10 mb-4 ${secondaryText}`} />
                                                <p className={`${textColor} mb-2`}>No rooms found</p>
                                                <p className={`text-sm ${secondaryText} mb-4`}>Create or join a room to get started</p>
                                                <div className="flex space-x-3 w-full">
                                                    <button
                                                        onClick={() => setShowCreateRoomModal(true)}
                                                        className={`flex-1 py-2 ${isDark ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-md text-sm`}
                                                    >
                                                        Create
                                                    </button>
                                                    <button
                                                        onClick={() => setShowJoinRoomModal(true)}
                                                        className={`flex-1 py-2 ${isDark ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"} text-white rounded-md text-sm`}
                                                    >
                                                        Join
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <ul className="divide-y ${borderColor}">
                                                {filteredRooms.map((room) => (
                                                    <li key={room.id}>
                                                        <button
                                                            onClick={() => {
                                                                setCurrentRoom(room)
                                                                setShowRoomList(false)
                                                            }}
                                                            className={`w-full text-left p-3 ${hoverBg} ${currentRoom?.id === room.id ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""} transition-colors`}
                                                        >
                                                            <div className="flex items-start">
                                                                <div
                                                                    className={`flex-shrink-0 h-10 w-10 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"} flex items-center justify-center`}
                                                                >
                                                                    <Users className={`${isDark ? "text-gray-400" : "text-gray-500"} w-5 h-5`} />
                                                                </div>
                                                                <div className="ml-3 flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className={`text-sm font-medium ${textColor} truncate`}>{room.name}</p>
                                                                        {room.isGlobal && (
                                                                            <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                                                Global
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center mt-1 space-x-2">
                                                                        <span className={`text-xs ${secondaryText}`}>
                                                                            {room.members?.length || 0} members
                                                                        </span>
                                                                        {room.code && (
                                                                            <span className={`text-xs font-mono ${secondaryText}`}>{room.code}</span>
                                                                        )}
                                                                        {room.type === "private" && <EyeOff className={`w-3 h-3 ${secondaryText}`} />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </motion.div>
                            )}

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
                                            initial={{ y: "100%" }}
                                            animate={{ y: 0 }}
                                            exit={{ y: "100%" }}
                                            transition={{ type: "spring", damping: 30 }}
                                            className={`absolute bottom-0 left-0 right-0 ${cardBg} rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="p-4 border-b ${borderColor}">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h2 className={`text-lg font-semibold ${textColor}`}>Chat Rooms</h2>
                                                    <button onClick={() => setShowRoomList(false)} className={`p-1 rounded-full ${hoverBg}`}>
                                                        <X className={`w-5 h-5 ${textColor}`} />
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <Search className={`absolute left-3 top-3 ${secondaryText} w-4 h-4`} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search rooms..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${inputBg} focus:outline-none focus:ring-2 ${isDark ? "focus:ring-indigo-500" : "focus:ring-indigo-300"} ${borderColor} border text-sm`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-2">
                                                {filteredRooms.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                                                        <MessageCircle className={`w-12 h-12 mb-4 ${secondaryText}`} />
                                                        <p className={`${textColor} mb-2`}>No rooms available</p>
                                                        <p className={`text-sm ${secondaryText} mb-6`}>Create a new room or join with a code</p>
                                                        <div className="flex space-x-3 w-full">
                                                            <button
                                                                onClick={() => {
                                                                    setShowCreateRoomModal(true)
                                                                    setShowRoomList(false)
                                                                }}
                                                                className={`flex-1 py-2 ${isDark ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-md text-sm`}
                                                            >
                                                                Create Room
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowJoinRoomModal(true)
                                                                    setShowRoomList(false)
                                                                }}
                                                                className={`flex-1 py-2 ${isDark ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"} text-white rounded-md text-sm`}
                                                            >
                                                                Join Room
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y ${borderColor}">
                                                        {filteredRooms.map((room) => (
                                                            <li key={room.id}>
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentRoom(room)
                                                                        setShowRoomList(false)
                                                                    }}
                                                                    className={`w-full text-left p-3 ${hoverBg} ${currentRoom?.id === room.id ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""} transition-colors`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div
                                                                            className={`flex-shrink-0 h-10 w-10 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"} flex items-center justify-center`}
                                                                        >
                                                                            <Users className={`${isDark ? "text-gray-400" : "text-gray-500"} w-5 h-5`} />
                                                                        </div>
                                                                        <div className="ml-3 flex-1 min-w-0">
                                                                            <p className={`text-sm font-medium ${textColor} truncate`}>{room.name}</p>
                                                                            <div className="flex items-center mt-1 space-x-2">
                                                                                <span className={`text-xs ${secondaryText}`}>
                                                                                    {room.members?.length || 0} members
                                                                                </span>
                                                                                {room.code && (
                                                                                    <span className={`text-xs font-mono ${secondaryText}`}>{room.code}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {room.isGlobal && (
                                                                            <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                                                Global
                                                                            </span>
                                                                        )}
                                                                    </div>
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
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <MessageCircle className={`w-16 h-16 mb-6 ${secondaryText}`} />
                                        <h3 className={`text-xl font-medium ${textColor} mb-2`}>
                                            {showRoomList ? "Select a chat room" : "No room selected"}
                                        </h3>
                                        <p className={`max-w-md ${secondaryText} mb-6`}>
                                            {showRoomList
                                                ? "Choose from your available rooms or create a new one"
                                                : "Browse rooms to start chatting"}
                                        </p>
                                        <div className="flex space-x-3">
                                            {!showRoomList && (
                                                <button
                                                    onClick={() => setShowRoomList(true)}
                                                    className={`px-4 py-2 ${isDark ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-md`}
                                                >
                                                    Browse Rooms
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowCreateRoomModal(true)}
                                                className={`px-4 py-2 ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} rounded-md ${textColor}`}
                                            >
                                                Create Room
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Room Header */}
                                        <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => setShowRoomList(true)}
                                                    className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <ChevronLeft className={`w-5 h-5 ${textColor}`} />
                                                </button>
                                                <div>
                                                    <div className="flex items-center">
                                                        <h2 className={`text-lg font-semibold ${textColor}`}>{currentRoom.name}</h2>
                                                        {currentRoom.isGlobal && (
                                                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Global</span>
                                                        )}
                                                        {currentRoom.type === "private" && <EyeOff className={`ml-2 w-4 h-4 ${secondaryText}`} />}
                                                        {getRoleBadge(getUserRole())}
                                                    </div>
                                                    {currentRoom.code && (
                                                        <div className="flex items-center mt-1">
                                                            <span className={`text-xs font-mono ${secondaryText}`}>Code: {currentRoom.code}</span>
                                                            <button
                                                                onClick={() => copyRoomCode(currentRoom.code)}
                                                                className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                                            >
                                                                {copiedCode ? (
                                                                    <Check className="w-3 h-3 text-green-500" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3 text-gray-500" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                {canManageRequests() && currentRoom.type === "private" && pendingRequests.length > 0 && (
                                                    <button
                                                        onClick={() => setShowPendingRequestsModal(true)}
                                                        className={`p-2 rounded-full ${isDark ? "bg-amber-800/30 hover:bg-amber-800/40" : "bg-amber-100 hover:bg-amber-200"} relative`}
                                                    >
                                                        <Clock className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                            {pendingRequests.length}
                                                        </span>
                                                    </button>
                                                )}

                                                {!currentRoom.isGlobal && (
                                                    <>
                                                        <button onClick={() => setShowMembersModal(true)} className={`p-2 rounded-full ${hoverBg}`}>
                                                            <Users className={`w-4 h-4 ${textColor}`} />
                                                        </button>
                                                        {getUserRole() !== "member" && (
                                                            <button
                                                                onClick={() => setShowRoomSettings(true)}
                                                                className={`p-2 rounded-full ${hoverBg}`}
                                                            >
                                                                <Shield className={`w-4 h-4 ${textColor}`} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Messages Container */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {loading ? (
                                                <div className="flex justify-center items-center h-full">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center">
                                                    <MessageCircle className={`w-12 h-12 mb-4 ${secondaryText}`} />
                                                    <p className={`text-lg ${textColor}`}>No messages yet</p>
                                                    <p className={`text-sm ${secondaryText} mt-2`}>Send a message to start the conversation</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col-reverse space-y-reverse space-y-4">
                                                    <div ref={messagesEndRef} />
                                                    {messages.map((message) => (
                                                        <motion.div
                                                            key={message.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}
                                                        >
                                                            <div
                                                                className={`flex max-w-xs sm:max-w-md rounded-xl px-4 py-3 relative
                                  ${message.userId === user?.uid
                                                                        ? isDark
                                                                            ? "bg-indigo-700"
                                                                            : "bg-indigo-600 text-white"
                                                                        : isDark
                                                                            ? "bg-gray-700"
                                                                            : "bg-gray-100"
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center space-x-2">
                                                                        {message.photoURL ? (
                                                                            <Image
                                                                                src={message.photoURL || "/placeholder.svg"}
                                                                                alt={message.displayName}
                                                                                width={28}
                                                                                height={28}
                                                                                className="rounded-full"
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                className={`h-7 w-7 rounded-full flex items-center justify-center ${isDark ? "bg-gray-600" : "bg-gray-200"}`}
                                                                            >
                                                                                <span className="text-xs">{message.displayName.charAt(0).toUpperCase()}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center">
                                                                            <span
                                                                                className={`font-medium ${message.userId === user?.uid ? "text-white" : textColor}`}
                                                                            >
                                                                                {message.displayName}
                                                                            </span>
                                                                            {message.isAdmin && (
                                                                                <span className="ml-1 text-xs bg-red-600 text-white px-1 rounded">ADMIN</span>
                                                                            )}
                                                                            {message.isModerator && !message.isAdmin && (
                                                                                <span className="ml-1 text-xs bg-blue-600 text-white px-1 rounded">MOD</span>
                                                                            )}
                                                                        </div>
                                                                        <span
                                                                            className={`text-xs ${message.userId === user?.uid ? "text-gray-300" : secondaryText}`}
                                                                        >
                                                                            {formatTime(message.timestamp)}
                                                                        </span>
                                                                    </div>
                                                                    <p className={`mt-2 ${message.userId === user?.uid ? "text-white" : textColor}`}>
                                                                        {message.text}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Input */}
                                        <div className={`border-t ${borderColor} p-4`}>
                                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className={`flex-1 px-4 py-3 rounded-full ${inputBg} focus:outline-none focus:ring-2 ${isDark ? "focus:ring-indigo-500" : "focus:ring-indigo-300"} ${borderColor} border`}
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim() || loading}
                                                    className={`p-3 rounded-full ${newMessage.trim() ? (isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700") : isDark ? "bg-gray-700" : "bg-gray-200"} text-white transition-colors`}
                                                >
                                                    <Send className="w-5 h-5" />
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
                                            <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>Room Type</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="public"
                                                        checked={newRoomType === "public"}
                                                        onChange={(e) => setNewRoomType(e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <span className={textColor}>Public</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="private"
                                                        checked={newRoomType === "private"}
                                                        onChange={(e) => setNewRoomType(e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <span className={textColor}>Private</span>
                                                </label>
                                            </div>
                                            <p className={`text-xs mt-1 ${secondaryText}`}>
                                                {newRoomType === "public"
                                                    ? "Anyone can join with the room code"
                                                    : "Users need approval to join"}
                                            </p>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateRoomModal(false)}
                                                className={`px-4 py-2 rounded-md ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} text-sm`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={createNewRoom}
                                                disabled={!newRoomName.trim()}
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

                    {/* Join Room Modal */}
                    <AnimatePresence>
                        {showJoinRoomModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowJoinRoomModal(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className={`w-full max-w-md ${cardBg} rounded-lg shadow-xl p-6`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Join Room with Code</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="roomCode" className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                                                Room Code
                                            </label>
                                            <input
                                                type="text"
                                                id="roomCode"
                                                value={joinRoomCode}
                                                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                                                className={`w-full px-3 py-2 rounded-md ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border font-mono text-center`}
                                                placeholder="Enter 6-character code"
                                                maxLength={6}
                                            />
                                            <p className={`text-xs mt-1 ${secondaryText}`}>Enter the 6-character room code to join</p>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowJoinRoomModal(false)}
                                                className={`px-4 py-2 rounded-md ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} text-sm`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={joinRoomByCode}
                                                disabled={joinRoomCode.length !== 6}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                Join Room
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Members Modal */}
                    <AnimatePresence>
                        {showMembersModal && currentRoom && !currentRoom.isGlobal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowMembersModal(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className={`w-full max-w-lg ${cardBg} rounded-lg shadow-xl p-6 max-h-[80vh] overflow-hidden flex flex-col`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`text-lg font-medium ${textColor}`}>Room Members ({currentRoomMembers.length})</h3>
                                        <button
                                            onClick={() => setShowMembersModal(false)}
                                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="space-y-2">
                                            {currentRoomMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {member.photoURL ? (
                                                            <Image
                                                                src={member.photoURL || "/placeholder.svg"}
                                                                alt={member.displayName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                                                <User size={20} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className={`font-medium ${textColor}`}>{member.displayName || member.email}</p>
                                                            <div className="flex items-center space-x-1">
                                                                {member.role === "admin" && (
                                                                    <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded">Admin</span>
                                                                )}
                                                                {member.role === "moderator" && (
                                                                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Moderator</span>
                                                                )}
                                                                {member.role === "member" && <span className={`text-xs ${secondaryText}`}>Member</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {canManageMembers() && member.id !== user?.uid && member.role !== "admin" && (
                                                        <div className="flex space-x-1">
                                                            {canManageRoles() && member.role === "member" && (
                                                                <button
                                                                    onClick={() => makeUserModerator(member.id)}
                                                                    className="p-1.5 rounded text-xs bg-blue-500 text-white hover:bg-blue-600"
                                                                    title="Make moderator"
                                                                >
                                                                    <UserPlus size={14} />
                                                                </button>
                                                            )}
                                                            {canManageRoles() && member.role === "moderator" && (
                                                                <button
                                                                    onClick={() => removeUserModerator(member.id)}
                                                                    className="p-1.5 rounded text-xs bg-gray-500 text-white hover:bg-gray-600"
                                                                    title="Remove moderator"
                                                                >
                                                                    <UserMinus size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => removeUserFromRoom(member.id)}
                                                                className="p-1.5 rounded text-xs bg-red-500 text-white hover:bg-red-600"
                                                                title="Remove from room"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pending Requests Modal */}
                    <AnimatePresence>
                        {showPendingRequestsModal && currentRoom && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowPendingRequestsModal(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className={`w-full max-w-lg ${cardBg} rounded-lg shadow-xl p-6 max-h-[80vh] overflow-hidden flex flex-col`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`text-lg font-medium ${textColor}`}>
                                            Pending Join Requests ({pendingRequests.length})
                                        </h3>
                                        <button
                                            onClick={() => setShowPendingRequestsModal(false)}
                                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {pendingRequests.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                                <Clock size={32} className="text-gray-400 mb-2" />
                                                <p className={`${secondaryText}`}>No pending requests</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {pendingRequests.map((request) => (
                                                    <div
                                                        key={request.id}
                                                        className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            {request.userDetails.photoURL ? (
                                                                <Image
                                                                    src={request.userDetails.photoURL || "/placeholder.svg"}
                                                                    alt={request.userDetails.displayName}
                                                                    width={40}
                                                                    height={40}
                                                                    className="rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                                                    <User size={20} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className={`font-medium ${textColor}`}>
                                                                    {request.userDetails.displayName || request.userDetails.email}
                                                                </p>
                                                                <p className={`text-xs ${secondaryText}`}>
                                                                    Requested {request.requestedAt?.toDate?.()?.toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleJoinRequest(request.id, "approve")}
                                                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleJoinRequest(request.id, "reject")}
                                                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                            <h4 className={`text-sm font-medium mb-2 ${secondaryText}`}>Room Information</h4>
                                            <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                                                <p className={`text-sm ${textColor}`}>
                                                    <span className="font-medium">Name:</span> {currentRoom.name}
                                                </p>
                                                <p className={`text-sm ${textColor}`}>
                                                    <span className="font-medium">Code:</span> {currentRoom.code}
                                                </p>
                                                <p className={`text-sm ${textColor}`}>
                                                    <span className="font-medium">Type:</span> {currentRoom.type}
                                                </p>
                                                <p className={`text-sm ${textColor}`}>
                                                    <span className="font-medium">Members:</span> {currentRoom.members?.length || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {canManageRoles() && (
                                            <div>
                                                <h4 className={`text-sm font-medium mb-2 ${secondaryText}`}>Transfer Admin Rights</h4>
                                                <select
                                                    value={newAdminId}
                                                    onChange={(e) => setNewAdminId(e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-md ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border`}
                                                >
                                                    <option value="">Select new admin</option>
                                                    {currentRoomMembers
                                                        ?.filter((member) => member.id !== user?.uid)
                                                        .map((member) => (
                                                            <option key={member.id} value={member.id}>
                                                                {member.displayName || member.email}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            {currentRoom.admin === user?.uid || isSuperAdmin ? (
                                                <button
                                                    onClick={() => deleteRoom(currentRoom.id)}
                                                    className="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                >
                                                    Delete Room
                                                </button>
                                            ) : null}

                                            <button
                                                onClick={() => leaveRoom(currentRoom.id)}
                                                className="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                            >
                                                Leave Room
                                            </button>
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowRoomSettings(false)}
                                                className={`px-4 py-2 rounded-md ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} text-sm`}
                                            >
                                                Cancel
                                            </button>
                                            {canManageRoles() && newAdminId && (
                                                <button
                                                    type="button"
                                                    onClick={transferAdmin}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                                >
                                                    Transfer Admin
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Suspense>
        </ProtectedRoute>
    )
}
