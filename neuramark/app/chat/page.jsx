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
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Components
import NavigationBar from "./components/NavigationBar"
import Sidebar from "./components/Sidebar"
import RoomList from "./components/RoomList"
import MobileRoomList from "./components/MobileRoomList"
import ChatArea from "./components/ChatArea"
import CreateRoomModal from "./components/CreateRoomModal"
import JoinRoomModal from "./components/JoinRoomModal"
import MembersModal from "./components/MembersModal"
import PendingRequestsModal from "./components/PendingRequestsModal"
import RoomSettingsModal from "./components/RoomSettingsModal"

// Icons
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
                isAdmin: !!(isSuperAdmin || currentRoom.admin === user.uid),
                isModerator: !!currentRoom.moderators?.includes(user.uid),
                role: userRole || "member",
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
                moderators: arrayRemove(userId),
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
                moderators: arrayRemove(newAdminId),
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
                    <NavigationBar
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        hoverBg={hoverBg}
                        toggleTheme={toggleTheme}
                        isSuperAdmin={isSuperAdmin}
                        currentRoom={currentRoom}
                        pendingRequests={pendingRequests}
                        canManageRequests={canManageRequests}
                        showRoomList={showRoomList}
                        setShowRoomList={setShowRoomList}
                        setSidebarOpen={setSidebarOpen}
                        setShowPendingRequestsModal={setShowPendingRequestsModal}
                        setShowMembersModal={setShowMembersModal}
                    />

                    <Sidebar
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        hoverBg={hoverBg}
                        cardBg={cardBg}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        user={user}
                        logout={logout}
                        setShowJoinRoomModal={setShowJoinRoomModal}
                        setShowCreateRoomModal={setShowCreateRoomModal}
                        currentRoom={currentRoom}
                        pendingRequests={pendingRequests}
                        setShowPendingRequestsModal={setShowPendingRequestsModal}
                        setShowMembersModal={setShowMembersModal}
                        canManageRequests={canManageRequests}
                    />

                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex h-[calc(100vh-80px)]">
                            <RoomList
                                isDark={isDark}
                                textColor={textColor}
                                secondaryText={secondaryText}
                                borderColor={borderColor}
                                hoverBg={hoverBg}
                                inputBg={inputBg}
                                cardBg={cardBg}
                                filteredRooms={filteredRooms}
                                currentRoom={currentRoom}
                                setCurrentRoom={setCurrentRoom}
                                setShowRoomList={setShowRoomList}
                                setShowCreateRoomModal={setShowCreateRoomModal}
                                setShowJoinRoomModal={setShowJoinRoomModal}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                showRoomList={showRoomList}
                            />

                            <MobileRoomList
                                isDark={isDark}
                                textColor={textColor}
                                secondaryText={secondaryText}
                                borderColor={borderColor}
                                hoverBg={hoverBg}
                                inputBg={inputBg}
                                cardBg={cardBg}
                                filteredRooms={filteredRooms}
                                currentRoom={currentRoom}
                                setCurrentRoom={setCurrentRoom}
                                setShowRoomList={setShowRoomList}
                                setShowCreateRoomModal={setShowCreateRoomModal}
                                setShowJoinRoomModal={setShowJoinRoomModal}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                showRoomList={showRoomList}
                            />

                            <ChatArea
                                isDark={isDark}
                                textColor={textColor}
                                secondaryText={secondaryText}
                                borderColor={borderColor}
                                hoverBg={hoverBg}
                                inputBg={inputBg}
                                cardBg={cardBg}
                                currentRoom={currentRoom}
                                messages={messages}
                                loading={loading}
                                newMessage={newMessage}
                                setNewMessage={setNewMessage}
                                handleSendMessage={handleSendMessage}
                                user={user}
                                messagesEndRef={messagesEndRef}
                                formatTime={formatTime}
                                getRoleBadge={getRoleBadge}
                                getUserRole={getUserRole}
                                canManageRequests={canManageRequests}
                                pendingRequests={pendingRequests}
                                setShowPendingRequestsModal={setShowPendingRequestsModal}
                                setShowMembersModal={setShowMembersModal}
                                setShowRoomSettings={setShowRoomSettings}
                                setShowRoomList={setShowRoomList}
                                copiedCode={copiedCode}
                                copyRoomCode={copyRoomCode}
                            />
                        </div>
                    </main>

                    <CreateRoomModal
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        inputBg={inputBg}
                        cardBg={cardBg}
                        showCreateRoomModal={showCreateRoomModal}
                        setShowCreateRoomModal={setShowCreateRoomModal}
                        newRoomName={newRoomName}
                        setNewRoomName={setNewRoomName}
                        newRoomType={newRoomType}
                        setNewRoomType={setNewRoomType}
                        createNewRoom={createNewRoom}
                    />

                    <JoinRoomModal
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        inputBg={inputBg}
                        cardBg={cardBg}
                        showJoinRoomModal={showJoinRoomModal}
                        setShowJoinRoomModal={setShowJoinRoomModal}
                        joinRoomCode={joinRoomCode}
                        setJoinRoomCode={setJoinRoomCode}
                        joinRoomByCode={joinRoomByCode}
                    />

                    <MembersModal
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        cardBg={cardBg}
                        showMembersModal={showMembersModal}
                        setShowMembersModal={setShowMembersModal}
                        currentRoomMembers={currentRoomMembers}
                        currentRoom={currentRoom}
                        user={user}
                        canManageMembers={canManageMembers}
                        canManageRoles={canManageRoles}
                        makeUserModerator={makeUserModerator}
                        removeUserModerator={removeUserModerator}
                        removeUserFromRoom={removeUserFromRoom}
                    />

                    <PendingRequestsModal
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        cardBg={cardBg}
                        showPendingRequestsModal={showPendingRequestsModal}
                        setShowPendingRequestsModal={setShowPendingRequestsModal}
                        pendingRequests={pendingRequests}
                        handleJoinRequest={handleJoinRequest}
                    />

                    <RoomSettingsModal
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                        borderColor={borderColor}
                        inputBg={inputBg}
                        cardBg={cardBg}
                        showRoomSettings={showRoomSettings}
                        setShowRoomSettings={setShowRoomSettings}
                        currentRoom={currentRoom}
                        currentRoomMembers={currentRoomMembers}
                        user={user}
                        isSuperAdmin={isSuperAdmin}
                        newAdminId={newAdminId}
                        setNewAdminId={setNewAdminId}
                        canManageRoles={canManageRoles}
                        transferAdmin={transferAdmin}
                        deleteRoom={deleteRoom}
                        leaveRoom={leaveRoom}
                    />
                </div>
            </Suspense>
        </ProtectedRoute>
    )
}