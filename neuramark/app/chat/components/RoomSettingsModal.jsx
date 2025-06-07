// components/RoomSettingsModal.jsx
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, Shield } from "lucide-react"

export default function RoomSettingsModal({
  isDark,
  textColor,
  secondaryText,
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
}) {
  return (
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
            <div className="flex items-center mb-4">
              <Shield className={`w-5 h-5 mr-2 ${textColor}`} />
              <h3 className={`text-lg font-medium ${textColor}`}>Room Settings</h3>
            </div>
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

              {canManageRoles && (
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
                {(currentRoom.admin === user?.uid || isSuperAdmin) && (
                  <button
                    onClick={() => deleteRoom(currentRoom.id)}
                    className="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete Room
                  </button>
                )}
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
                {canManageRoles && newAdminId && (
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
  )
}