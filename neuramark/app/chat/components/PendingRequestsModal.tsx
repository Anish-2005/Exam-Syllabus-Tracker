// components/PendingRequestsModal.jsx
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, Clock } from "lucide-react"
import Image from "next/image"
import { PendingRequestsModalProps } from "../../../types"

export default function PendingRequestsModal(props: PendingRequestsModalProps) {
  const {
    isDark,
    textColor,
    secondaryText,
    cardBg,
    showPendingRequestsModal,
    setShowPendingRequestsModal,
    pendingRequests,
    handleJoinRequest
  } = props
  return (
    <AnimatePresence>
      {showPendingRequestsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPendingRequestsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-lg ${cardBg} rounded-lg shadow-xl p-6 max-h-[80vh] overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Clock className={`w-5 h-5 mr-2 ${textColor}`} />
                <h3 className={`text-lg font-medium ${textColor}`}>
                  Pending Join Requests ({pendingRequests.length})
                </h3>
              </div>
              <button
                onClick={() => setShowPendingRequestsModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Clock size={32} className="text-gray-400 mb-2" />
                  <p className={`${secondaryText}`}>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center space-x-3">
                        {request.userDetails.photoURL ? (
                          <Image
                            src={request.userDetails.photoURL || "/placeholder.svg"}
                            alt={request.userDetails.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                            <span className="text-sm">{request.userDetails.name?.charAt(0) || request.userDetails.email?.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${textColor}`}>
                            {request.userDetails.name || request.userDetails.email}
                          </p>
                          <p className={`text-xs ${secondaryText}`}>
                            Requested {request.requestedAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleJoinRequest(request.id, "approve")}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleJoinRequest(request.id, "reject")}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}