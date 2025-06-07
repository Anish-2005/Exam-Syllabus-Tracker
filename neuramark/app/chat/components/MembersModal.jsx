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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMembersModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-lg ${cardBg} rounded-lg shadow-xl p-6 max-h-[80vh] overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${textColor}`}>Room Members ({currentRoomMembers.length})</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {currentRoomMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
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
                        <div className="flex items-center space-x-1">
                          {member.role === "admin" && (
                            <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded">Admin</span>
                          )}
                          {member.role === "moderator" && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Moderator</span>
                          )}
                          {member.role === "member" && <span className={`text-xs ${secondaryText}`}>Member</span>}
                        </div>
                      </div>
                    </div>
                    {canManageMembers && member.id !== user?.uid && member.role !== "admin" && (
                      <div className="flex space-x-1">
                        {canManageRoles && member.role === "member" && (
                          <button
                            onClick={() => makeUserModerator(member.id)}
                            className="p-1.5 rounded text-xs bg-blue-500 text-white hover:bg-blue-600"
                            title="Make moderator"
                          >
                            <UserPlus size={14} />
                          </button>
                        )}
                        {canManageRoles && member.role === "moderator" && (
                          <button
                            onClick={() => removeUserModerator(member.id)}
                            className="p-1.5 rounded text-xs bg-gray-500 text-white hover:bg-gray-600"
                            title="Remove moderator"
                          >
                            <UserMinus size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => removeUserFromRoom(member.id)}
                          className="p-1.5 rounded text-xs bg-red-500 text-white hover:bg-red-600"
                          title="Remove from room"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}