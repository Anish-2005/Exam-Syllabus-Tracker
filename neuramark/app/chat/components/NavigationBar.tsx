// components/NavigationBar.jsx
"use client"

import { useAuth } from "@/app/context/AuthContext"
import { Moon, Sun, Users, Clock, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { NavigationBarProps } from "../../../types"

export default function NavigationBar(props: NavigationBarProps) {
  const {
    isDark,
    textColor,
    secondaryText,
    borderColor,
    toggleTheme,
    isSuperAdmin,
    currentRoom,
    pendingRequests,
    canManageRequests,
    setSidebarOpen,
    setShowPendingRequestsModal,
    setShowMembersModal,
  } = props
  const { user } = useAuth()

  return (
    <nav className={`${isDark ? "bg-gray-900" : "bg-white"} shadow-md ${borderColor} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
             <Link
                                    href="/dashboard"
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Back to Dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
            <div className="flex items-center space-x-3">
              <Image src="/emblem.png" alt="Logo" width={32} height={32} className="rounded" />
              <div className="flex flex-col">
                <h1 className={`text-lg font-semibold ${textColor}`}>Study Chat</h1>
                {currentRoom && (
                  <p className={`text-xs ${secondaryText}`}>{currentRoom.name}</p>
                )}
              </div>
              {isSuperAdmin && (
                <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
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
                  className={`flex items-center text-sm px-3 py-1.5 rounded-md ${isDark ? "text-amber-400 hover:text-amber-300 bg-amber-900/20 hover:bg-amber-900/30" : "text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200"} transition-colors relative`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Requests</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                </button>
              )}

            {currentRoom && !currentRoom.isGlobal && (
              <button
                onClick={() => setShowMembersModal(true)}
                className={`flex items-center text-sm px-3 py-1.5 rounded-md ${isDark ? "text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/30" : "text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200"} transition-colors`}
              >
                <Users className="w-4 h-4 mr-2" />
                <span>Members</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <div className="flex items-center space-x-2 ml-4 pl-3 border-l border-gray-300 dark:border-gray-600">
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"} text-sm font-medium`}
                >
                  {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`text-sm ${textColor} hidden lg:inline`}>
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-md ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}>
              <Menu className={`w-5 h-5 ${textColor}`} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}