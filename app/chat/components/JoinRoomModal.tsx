// components/JoinRoomModal.jsx
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Key } from "lucide-react"

type JoinRoomModalProps = {
  isDark: boolean;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  inputBg: string;
  cardBg: string;
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (show: boolean) => void;
  joinRoomCode: string;
  setJoinRoomCode: (code: string) => void;
  joinRoomByCode: () => void;
};

export default function JoinRoomModal({
  isDark,
  textColor,
  secondaryText,
  borderColor,
  inputBg,
  cardBg,
  showJoinRoomModal,
  setShowJoinRoomModal,
  joinRoomCode,
  setJoinRoomCode,
  joinRoomByCode
}: JoinRoomModalProps) {
  return (
    <AnimatePresence>
      {showJoinRoomModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowJoinRoomModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-md ${cardBg} rounded-lg shadow-xl p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <Key className={`w-5 h-5 mr-2 ${textColor}`} />
              <h3 className={`text-lg font-medium ${textColor}`}>Join Room with Code</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="roomCode" className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 rounded-md ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${borderColor} border font-mono text-center`}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                />
                <p className={`text-xs mt-1 ${secondaryText}`}>Enter the 6-character room code to join</p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinRoomModal(false)}
                  className={`px-4 py-2 rounded-md ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} text-sm`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={joinRoomByCode}
                  disabled={joinRoomCode.length !== 6}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Join Room
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}