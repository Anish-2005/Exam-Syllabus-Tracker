// components/CreateRoomModal.jsx
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CreateRoomModalProps } from "../../../types"

export default function CreateRoomModal(props: CreateRoomModalProps) {
  const {
    isDark,
    textColor,
    secondaryText,
    borderColor,
    inputBg,
    cardBg,
    showCreateRoomModal,
    setShowCreateRoomModal,
    newRoomName,
    setNewRoomName,
    newRoomType,
    setNewRoomType,
    createNewRoom
  } = props
  return (
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
  )
}