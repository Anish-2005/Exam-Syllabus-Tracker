// components/MembersModal.jsx
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, UserPlus, UserMinus } from "lucide-react"
import Image from "next/image"

export default function MembersModal({
  isDark,
  textColor,
  secondaryText,
  borderColor,
  cardBg,
  showMembersModal,
  setShowMembersModal,
  currentRoomMembers,
  currentRoom,
  user,
  canManageMembers,
  canManageRoles,
  makeUserModerator,
  removeUserModerator,
  removeUserFromRoom
}) {
  return (
    <AnimatePresence>
      {showMembersModal && currentRoom && !currentRoom.isGlobal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMembersModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-lg ${cardBg} rounded-2xl shadow-2xl border-2 ${borderColor} p-6 max-h-[80vh] overflow-hidden flex flex-col backdrop-blur-lg`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mr-3">
                  <UserPlus className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h3 className={`text-2xl font-black ${textColor} bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400`}>Room Members</h3>
                <span className={`ml-2 px-3 py-1 text-sm font-bold rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-purple-100 text-purple-800'} border-2 ${isDark ? 'border-gray-600' : 'border-purple-200'}`}>
                  {currentRoomMembers.length}
                </span>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-110 active:scale-95"
              >
                <X size={24} className={textColor} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {currentRoomMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-between p-4 rounded-2xl ${isDark ? "bg-gray-700/50" : "bg-white/60"} backdrop-blur-sm border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all`}
                  >
                    <div className="flex items-center space-x-3">
                      {member.photoURL ? (
                        <Image
                          src={member.photoURL || "/placeholder.svg"}
                          alt={member.displayName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                          <span className="text-sm">{member.displayName?.charAt(0) || member.email?.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className={`font-medium ${textColor}`}>{member.displayName || member.email}</p>
                        <div className="flex items-center space-x-2">
                          {member.role === "admin" && (
                            <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">Admin</span>
                          )}
                          {member.role === "moderator" && (
                            <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">Moderator</span>
                          )}
                          {member.role === "member" && <span className={`text-xs font-medium ${secondaryText}`}>Member</span>}
                        </div>
                      </div>
                    </div>
                    {canManageMembers && member.id !== user?.uid && member.role !== "admin" && (
                      <div className="flex space-x-2">
                        {canManageRoles && member.role === "member" && (
                          <button
                            onClick={() => makeUserModerator(member.id)}
                            className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                            title="Make moderator"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                        {canManageRoles && member.role === "moderator" && (
                          <button
                            onClick={() => removeUserModerator(member.id)}
                            className="p-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                            title="Remove moderator"
                          >
                            <UserMinus size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => removeUserFromRoom(member.id)}
                          className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                          title="Remove from room"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}