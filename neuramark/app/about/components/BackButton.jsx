import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BackButton({ isDark }) {
  return (
    <motion.div
      className="fixed top-5 left-5 z-50"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Link
        href="/"
        aria-label="Go back to home"
        className={`
          p-3 rounded-full flex items-center justify-center
          ${isDark ? 'bg-gray-700/90 hover:bg-gray-600/90' : 'bg-white shadow-sm hover:shadow-md'}
          border ${isDark ? 'border-gray-600' : 'border-gray-200'}
          transition-colors duration-200
          shadow-md
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${isDark ? 'focus:ring-indigo-400' : 'focus:ring-indigo-600'}
        `}
      >
        <ArrowLeft
          className={`w-6 h-6 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  )
}
