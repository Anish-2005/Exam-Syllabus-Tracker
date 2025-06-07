"use client"

import {
  Users,
  EyeOff,
  MessageCircle,
  Plus,
  Key,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function RoomList({
  isDark,
  textColor,
  secondaryText,
  borderColor,
  hoverBg,
  inputBg,
  cardBg,
  filteredRooms,
  currentRoom,
  setCurrentRoom,
  setShowRoomList,
  setShowCreateRoomModal,
  setShowJoinRoomModal,
  searchQuery,
  setSearchQuery,
  showRoomList // only used for mobile
}) {
  const [collapsed, setCollapsed] = useState(false)

  const handleRoomClick = (room) => {
    setCurrentRoom(room)
    // On mobile, hide the room list after selecting a room
    if (window.innerWidth < 768) {
      setShowRoomList(false)
    }
  }

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev)
  }

  return (
    <>
      {/* Toggle Collapse Button - Desktop only */}
      <div className="hidden md:flex items-center">
        <button
          onClick={toggleCollapse}
          className={`mr-2 p-1 rounded-full border ${borderColor} ${hoverBg} transition`}
          title={collapsed ? "Expand Room List" : "Collapse Room List"}
        >
          {collapsed ? (
            <ChevronRight className={`${textColor} w-5 h-5`} />
          ) : (
            <ChevronLeft className={`${textColor} w-5 h-5`} />
          )}
        </button>
      </div>

      {/* Room List Panel - Shown on desktop unless collapsed */}
      {!collapsed && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`hidden md:flex w-72 flex-shrink-0 ${cardBg} rounded-xl shadow-lg ${borderColor} border mr-6 flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${borderColor}`}>
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

            {/* Search Box */}
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

          {/* Room List */}
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
              <ul className={`divide-y ${borderColor}`}>
                {filteredRooms.map((room) => (
                  <li key={room.id}>
                    <button
                      onClick={() => handleRoomClick(room)}
                      className={`w-full text-left p-3 rounded hover:${hoverBg} ${currentRoom?.id === room.id ? (isDark ? "bg-gray-700" : "bg-gray-100") : ""} transition-colors`}
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
    </>
  )
}
