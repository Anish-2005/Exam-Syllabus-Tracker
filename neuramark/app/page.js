'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
          Exam Syllabus Tracker
        </h1>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          Track your B.Tech syllabus progress from 1st to 4th year across all branches including CSE, ECE, AIML, DS, EE, ME and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/about" 
            className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  )
}