// components/NavigationBar.jsx
"use client"

import { useTheme } from "@/app/components/ThemeContext"
import { useAuth } from "@/app/components/context/AuthContext"
import { Moon, Sun, Users, Clock, ChevronLeft, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NavigationBar({
  isDark,
  textColor,
  secondaryText,
  borderColor,
  hoverBg,
  toggleTheme,
  isSuperAdmin,
  currentRoom,
  pendingRequests,
  canManageRequests,
  showRoomList,
  setShowRoomList,
  setSidebarOpen,
  setShowPendingRequestsModal,
  setShowMembersModal,
}) {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <nav className={`${isDark ? "bg-gray-800" : "bg-white"} shadow-sm ${borderColor} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
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
              canManageRequests &&
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
  )
}