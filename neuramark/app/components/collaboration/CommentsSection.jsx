'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function CommentsSection({ subjectId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?subjectId=${subjectId}`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments)
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      }
    }

    fetchComments()
  }, [subjectId])

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId,
          text: newComment
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([...comments, data.comment])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium dark:text-white">Discussion</h3>
      
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <Avatar>
                <AvatarImage src={comment.userId.avatar} />
                <AvatarFallback>
                  {comment.userId.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium dark:text-white">{comment.userId.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm dark:text-gray-300">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Add a comment..."
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button 
          onClick={handleAddComment} 
          disabled={isLoading || !newComment.trim()}
          className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>
  )
}