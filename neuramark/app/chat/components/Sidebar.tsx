// components/Sidebar.jsx
"use client"

import { User, X, Users, Plus, Key, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarProps } from "../../../types"

export default function Sidebar(props: SidebarProps) {
  const {
    isDark,
    textColor,
    secondaryText,
    borderColor,
    hoverBg,
    cardBg,
    sidebarOpen,
    setSidebarOpen,
    user,
    logout,
    setShowJoinRoomModal,
    setShowCreateRoomModal,
    currentRoom,
    pendingRequests,
    setShowPendingRequestsModal,
    setShowMembersModal,
    canManageRequests,
    currentRoomMembers,
  } = props
  const pathname = usePathname()

  return (
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
                className={`flex items-center px-3 py-2 rounded-md ${hoverBg} ${pathname === "/dashboard" ? (isDark ? "bg-indigo-900 text-white" : "bg-indigo-100 text-indigo-700") : ""}`}
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className={`flex items-center px-3 py-2 rounded-md ${hoverBg} ${pathname === "/chat" ? (isDark ? "bg-indigo-900 text-white" : "bg-indigo-100 text-indigo-700") : ""}`}
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
                canManageRequests &&
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
  )
}