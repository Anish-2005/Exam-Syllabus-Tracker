// components/RoomSettingsModal.jsx
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Shield } from "lucide-react"
import { RoomSettingsModalProps } from "../../../types"

export default function RoomSettingsModal(props: RoomSettingsModalProps) {
  const {
    isDark,
    textColor,
    borderColor,
    inputBg,
    cardBg,
    showRoomSettings,
    setShowRoomSettings,
    currentRoom,
    currentRoomMembers,
    user,
    isSuperAdmin,
    newAdminId,
    setNewAdminId,
    canManageRoles,
    transferAdmin,
    deleteRoom,
    leaveRoom
  } = props
  return (
    <AnimatePresence>
      {showRoomSettings && currentRoom && !currentRoom.isGlobal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRoomSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-md ${cardBg} rounded-2xl shadow-2xl border-2 ${borderColor} p-6 backdrop-blur-lg`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mr-3">
                <Shield className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-2xl font-black ${textColor} bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400`}>Room Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`text-lg font-bold mb-3 ${textColor}`}>Room Information</h4>
                <div className={`p-4 rounded-2xl ${isDark ? "bg-gray-700/50" : "bg-white/60"} backdrop-blur-sm border-2 ${borderColor} shadow-lg`}>
                  <div className="space-y-2">
                    <p className={`text-base ${textColor}`}>
                      <span className="font-bold text-purple-600 dark:text-purple-400">Name:</span> {currentRoom.name}
                    </p>
                    <p className={`text-base ${textColor}`}>
                      <span className="font-bold text-purple-600 dark:text-purple-400">Code:</span> {currentRoom.code}
                    </p>
                    <p className={`text-base ${textColor}`}>
                      <span className="font-bold text-purple-600 dark:text-purple-400">Type:</span> {currentRoom.type}
                    </p>
                    <p className={`text-base ${textColor}`}>
                      <span className="font-bold text-purple-600 dark:text-purple-400">Members:</span> {currentRoom.members?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {canManageRoles && (
                <div>
                  <h4 className={`text-lg font-bold mb-3 ${textColor}`}>Transfer Admin Rights</h4>
                  <select
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl ${inputBg} focus:outline-none focus:ring-4 ${isDark ? "focus:ring-purple-500/30" : "focus:ring-purple-300/50"} ${borderColor} border-2 text-base font-medium transition-all`}
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
              <div className="space-y-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                {(currentRoom.admin === user?.uid || isSuperAdmin) && (
                  <button
                    onClick={() => deleteRoom(currentRoom.id)}
                    className="w-full px-6 py-3 text-base font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    Delete Room
                  </button>
                )}
                <button
                  onClick={() => leaveRoom(currentRoom.id)}
                  className="w-full px-6 py-3 text-base font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  Leave Room
                </button>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowRoomSettings(false)}
                  className={`px-6 py-3 rounded-2xl text-base font-bold ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95`}
                >
                  Cancel
                </button>
                {canManageRoles && newAdminId && (
                  <button
                    type="button"
                    onClick={transferAdmin}
                    className="px-6 py-3 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
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
  )
}