'use client'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/app/context/ThemeContext'

export default function ProgressEmptyState() {
  const { theme } = useTheme()
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'

  return (
    <div className={`text-center py-8 ${secondaryText}`}>
      <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
      <p className={textColor}>No progress data available</p>
      <p className="mt-2 text-sm">
        Your completed modules will appear here after you mark them in your subjects.
      </p>
      <Link 
        href="/dashboard" 
        className={`mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300`}
      >
        Go to Dashboard
      </Link>
    </div>
  )
}