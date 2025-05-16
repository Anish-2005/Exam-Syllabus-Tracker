'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function ShareProgress({ subjectId }) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view')
  const [isLoading, setIsLoading] = useState(false)

  const handleShare = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subjectId,
          permission
        }),
      })

      if (response.ok) {
        toast.success('Progress shared successfully!')
        setEmail('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to share progress')
      }
    } catch (error) {
      toast.error('An error occurred while sharing')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium dark:text-white">Share Progress</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="friend@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Permission
        </label>
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="view">View Only</option>
          <option value="comment">View and Comment</option>
        </select>
      </div>

      <button
        onClick={handleShare}
        disabled={isLoading}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Sharing...' : 'Share Progress'}
      </button>
    </div>
  )
}