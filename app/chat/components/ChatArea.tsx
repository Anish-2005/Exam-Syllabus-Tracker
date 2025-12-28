// components/ChatArea.jsx
"use client"

import React from "react";
import { Send, ChevronLeft, Users, Shield, Clock, Copy, Check, EyeOff,MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

type ChatAreaProps = {
  isDark: boolean;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  hoverBg: string;
  inputBg: string;
  cardBg: string;
  currentRoom: any;
  messages: any[];
  loading: boolean;
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  user: any;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  formatTime: (timestamp: any) => string;
  getRoleBadge: (role: string) => React.ReactNode;
  getUserRole: () => string;
  canManageRequests: () => boolean;
  pendingRequests: any[];
  setShowPendingRequestsModal: (show: boolean) => void;
  setShowMembersModal: (show: boolean) => void;
  setShowRoomSettings: (show: boolean) => void;
  setShowRoomList: (show: boolean) => void;
  copiedCode: boolean;
  copyRoomCode: (code: string) => void;
  showRoomList: boolean;
};

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
}: ChatAreaProps) {
  // State for showing the Create Room modal
  const [showCreateRoomModal, setShowCreateRoomModal] = React.useState(false);

  return (
    <div className={`flex-1 ${cardBg} rounded-2xl shadow-2xl ${borderColor} border-2 overflow-hidden flex flex-col backdrop-blur-lg`}>
      {!currentRoom ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30"></div>
            <MessageCircle className={`relative w-24 h-24 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h3 className={`text-3xl font-black ${textColor} mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400`}>
            {showRoomList ? "Select a chat room" : "No room selected"}
          </h3>
          <p className={`max-w-md ${secondaryText} mb-8 text-lg`}>
            {showRoomList
              ? "Choose from your available rooms or create a new one"
              : "Browse rooms to start chatting"}
          </p>
          <div className="flex space-x-3">
            {!showRoomList && (
              <button
                onClick={() => setShowRoomList(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
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
          <div className={`p-6 border-b-2 ${borderColor} flex justify-between items-center bg-gradient-to-r ${isDark ? 'from-gray-800 to-gray-700' : 'from-purple-50 to-pink-50'}`}>
            <div className="flex items-center">
              <button
                onClick={() => setShowRoomList(true)}
                className="md:hidden mr-3 p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <ChevronLeft className={`w-6 h-6 ${textColor}`} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-2xl font-black ${textColor}`}>{currentRoom.name}</h2>
                  {currentRoom.isGlobal && (
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">Global</span>
                  )}
                  {currentRoom.type === "private" && <EyeOff className={`w-5 h-5 ${secondaryText}`} />}
                  {getRoleBadge(getUserRole())}
                </div>
                {currentRoom.code && (
                  <div className="flex items-center mt-2 gap-2">
                    <span className={`text-sm font-mono font-bold ${isDark ? 'text-gray-300 bg-gray-700' : 'text-purple-900 bg-purple-100'} px-3 py-1 rounded-lg border-2 ${isDark ? 'border-gray-600' : 'border-purple-200'}`}>Code: {currentRoom.code}</span>
                    <button
                      onClick={() => copyRoomCode(currentRoom.code)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-110 active:scale-95"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              {canManageRequests() && currentRoom.type === "private" && pendingRequests.length > 0 && (
                <button
                  onClick={() => setShowPendingRequestsModal(true)}
                  className={`p-3 rounded-xl ${isDark ? "bg-amber-800/30 hover:bg-amber-800/40" : "bg-amber-100 hover:bg-amber-200"} relative shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95`}
                >
                  <Clock className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {pendingRequests.length}
                  </span>
                </button>
              )}

              {!currentRoom.isGlobal && (
                <>
                  <button onClick={() => setShowMembersModal(true)} className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95">
                    <Users className={`w-5 h-5 ${textColor}`} />
                  </button>
                  {getUserRole() !== "member" && (
                    <button
                      onClick={() => setShowRoomSettings(true)}
                      className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 hover:from-indigo-200 hover:to-blue-200 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
                    >
                      <Shield className={`w-5 h-5 ${textColor}`} />
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
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20"></div>
                  <MessageCircle className={`relative w-20 h-20 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <p className={`text-2xl font-bold ${textColor} mb-2`}>No messages yet</p>
                <p className={`text-base ${secondaryText}`}>Send a message to start the conversation</p>
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
          <div className={`border-t-2 ${borderColor} p-6 bg-gradient-to-r ${isDark ? 'from-gray-800 to-gray-700' : 'from-purple-50 to-pink-50'}`}>
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 px-6 py-4 rounded-2xl ${inputBg} focus:outline-none focus:ring-4 ${isDark ? "focus:ring-purple-500/30" : "focus:ring-purple-300/50"} ${borderColor} border-2 text-base font-medium transition-all`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className={`p-4 rounded-2xl ${newMessage.trim() ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl" : isDark ? "bg-gray-700" : "bg-gray-200"} text-white transition-all transform hover:scale-110 active:scale-95 disabled:transform-none disabled:opacity-50`}
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}