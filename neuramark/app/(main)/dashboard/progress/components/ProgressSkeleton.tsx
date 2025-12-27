'use client'
import { useTheme } from '@/app/context/ThemeContext'

export default function ProgressSkeleton() {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'

  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 shadow animate-pulse`}>
          <div className="flex justify-between">
            <div className="space-y-2 w-2/3">
              <div className={`h-4 ${bgColor} rounded w-3/4`}></div>
              <div className={`h-3 ${bgColor} rounded w-1/2`}></div>
            </div>
            <div className="space-y-2 w-1/4">
              <div className={`h-4 ${bgColor} rounded w-full`}></div>
              <div className={`h-3 ${bgColor} rounded w-3/4`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}