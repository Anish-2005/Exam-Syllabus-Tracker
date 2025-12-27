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
import { RoomListProps } from "../../../types"

export default function RoomList(props: RoomListProps) {
  const {
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
  } = props

  const [collapsed, setCollapsed] = useState(false)

  const handleRoomClick = (room: any) => { // TODO: Use proper ChatRoom type
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
          className={`hidden md:flex w-80 flex-shrink-0 ${cardBg} rounded-2xl shadow-2xl ${borderColor} border-2 mr-4 flex-col overflow-hidden backdrop-blur-lg`}
        >
          {/* Header */}
          <div className={`p-6 border-b-2 ${borderColor} bg-gradient-to-r ${isDark ? 'from-gray-800 to-gray-700' : 'from-purple-50 to-pink-50'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-black ${textColor} flex items-center gap-2`}>
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Chat Rooms
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowJoinRoomModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                  title="Join room"
                >
                  <Key className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowCreateRoomModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                  title="Create room"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className={`absolute left-4 top-3.5 ${secondaryText} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${inputBg} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 ${borderColor} border-2 text-sm font-medium transition-all duration-200`}
              />
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className={`w-16 h-16 mb-4 ${secondaryText}`} />
                <p className={`${textColor} mb-2 font-bold text-lg`}>No rooms found</p>
                <p className={`text-sm ${secondaryText} mb-6`}>Create or join a room to get started</p>
                <div className="flex flex-col space-y-3 w-full">
                  <button
                    onClick={() => setShowCreateRoomModal(true)}
                    className="py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => setShowJoinRoomModal(true)}
                    className="py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredRooms.map((room) => (
                  <li key={room.id}>
                    <button
                      onClick={() => handleRoomClick(room)}
                      className={`w-full text-left p-4 rounded-xl ${currentRoom?.id === room.id ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-400 dark:border-purple-500 shadow-lg' : `${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white/80 hover:bg-white'} border-2 ${borderColor} hover:border-purple-300 dark:hover:border-purple-700`} transition-all duration-200 transform hover:scale-[1.02]`}
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
