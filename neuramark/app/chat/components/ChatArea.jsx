// components/ChatArea.jsx
"use client"

import { Send, ChevronLeft, Users, Shield, Clock, Copy, Check, EyeOff,MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function ChatArea({
  isDark,
  textColor,
  secondaryText,
  borderColor,
  hoverBg,
  inputBg,
  cardBg,
  currentRoom,
  messages,
  loading,
  newMessage,
  setNewMessage,
  handleSendMessage,
  user,
  messagesEndRef,
  formatTime,
  getRoleBadge,
  getUserRole,
  canManageRequests,
  pendingRequests,
  setShowPendingRequestsModal,
  setShowMembersModal,
  setShowRoomSettings,
  setShowRoomList,
  copiedCode,
  copyRoomCode,
  showRoomList
}) {
  return (
    <div className={`flex-1 ${cardBg} rounded-lg shadow ${borderColor} border overflow-hidden flex flex-col`}>
      {!currentRoom ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <MessageCircle className={`w-16 h-16 mb-6 ${secondaryText}`} />
          <h3 className={`text-xl font-medium ${textColor} mb-2`}>
            {showRoomList ? "Select a chat room" : "No room selected"}
          </h3>
          <p className={`max-w-md ${secondaryText} mb-6`}>
            {showRoomList
              ? "Choose from your available rooms or create a new one"
              : "Browse rooms to start chatting"}
          </p>
          <div className="flex space-x-3">
            {!showRoomList && (
              <button
                onClick={() => setShowRoomList(true)}
                className={`px-4 py-2 ${isDark ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-md`}
              >
                Browse Rooms
              </button>
            )}
            <button
              onClick={() => setShowCreateRoomModal(true)}
              className={`px-4 py-2 ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} rounded-md ${textColor}`}
            >
              Create Room
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Room Header */}
          <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
            <div className="flex items-center">
              <button
                onClick={() => setShowRoomList(true)}
                className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronLeft className={`w-5 h-5 ${textColor}`} />
              </button>
              <div>
                <div className="flex items-center">
                  <h2 className={`text-lg font-semibold ${textColor}`}>{currentRoom.name}</h2>
                  {currentRoom.isGlobal && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Global</span>
                  )}
                  {currentRoom.type === "private" && <EyeOff className={`ml-2 w-4 h-4 ${secondaryText}`} />}
                  {getRoleBadge(getUserRole())}
                </div>
                {currentRoom.code && (
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-mono ${secondaryText}`}>Code: {currentRoom.code}</span>
                    <button
                      onClick={() => copyRoomCode(currentRoom.code)}
                      className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {copiedCode ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              {canManageRequests() && currentRoom.type === "private" && pendingRequests.length > 0 && (
                <button
                  onClick={() => setShowPendingRequestsModal(true)}
                  className={`p-2 rounded-full ${isDark ? "bg-amber-800/30 hover:bg-amber-800/40" : "bg-amber-100 hover:bg-amber-200"} relative`}
                >
                  <Clock className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                </button>
              )}

              {!currentRoom.isGlobal && (
                <>
                  <button onClick={() => setShowMembersModal(true)} className={`p-2 rounded-full ${hoverBg}`}>
                    <Users className={`w-4 h-4 ${textColor}`} />
                  </button>
                  {getUserRole() !== "member" && (
                    <button
                      onClick={() => setShowRoomSettings(true)}
                      className={`p-2 rounded-full ${hoverBg}`}
                    >
                      <Shield className={`w-4 h-4 ${textColor}`} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className={`w-12 h-12 mb-4 ${secondaryText}`} />
                <p className={`text-lg ${textColor}`}>No messages yet</p>
                <p className={`text-sm ${secondaryText} mt-2`}>Send a message to start the conversation</p>
              </div>
            ) : (
              <div className="flex flex-col-reverse space-y-reverse space-y-4">
                <div ref={messagesEndRef} />
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-xs sm:max-w-md rounded-xl px-4 py-3 relative
                        ${message.userId === user?.uid
                          ? isDark
                            ? "bg-indigo-700"
                            : "bg-indigo-600 text-white"
                          : isDark
                            ? "bg-gray-700"
                            : "bg-gray-100"
                        }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          {message.photoURL ? (
                            <Image
                              src={message.photoURL || "/placeholder.svg"}
                              alt={message.displayName}
                              width={28}
                              height={28}
                              className="rounded-full"
                            />
                          ) : (
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center ${isDark ? "bg-gray-600" : "bg-gray-200"}`}
                            >
                              <span className="text-xs">{message.displayName.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span
                              className={`font-medium ${message.userId === user?.uid ? "text-white" : textColor}`}
                            >
                              {message.displayName}
                            </span>
                            {message.isAdmin && (
                              <span className="ml-1 text-xs bg-red-600 text-white px-1 rounded">ADMIN</span>
                            )}
                            {message.isModerator && !message.isAdmin && (
                              <span className="ml-1 text-xs bg-blue-600 text-white px-1 rounded">MOD</span>
                            )}
                          </div>
                          <span
                            className={`text-xs ${message.userId === user?.uid ? "text-gray-300" : secondaryText}`}
                          >
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className={`mt-2 ${message.userId === user?.uid ? "text-white" : textColor}`}>
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className={`border-t ${borderColor} p-4`}>
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-3 rounded-full ${inputBg} focus:outline-none focus:ring-2 ${isDark ? "focus:ring-indigo-500" : "focus:ring-indigo-300"} ${borderColor} border`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className={`p-3 rounded-full ${newMessage.trim() ? (isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700") : isDark ? "bg-gray-700" : "bg-gray-200"} text-white transition-colors`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}