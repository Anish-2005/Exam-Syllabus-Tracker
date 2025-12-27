// components/MobileRoomList.jsx
"use client"

import { Users, EyeOff, MessageCircle, Plus, Key, X, Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export default function MobileRoomList({
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
  showRoomList
}) {
  return (
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
  )
}