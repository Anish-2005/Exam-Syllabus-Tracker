'use client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ProgressModule from './ProgressModule'
import { useTheme } from '@/app/context/ThemeContext'

export default function ProgressSubject({ 
  subject, 
  progress, 
  isExpanded, 
  onToggle, 
  modules 
}) {
  const { theme, isDark } = useTheme()
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600'
  const borderColor = isDark ? 'border-gray-700' : 'border-purple-200'
  const bgColor = isDark ? 'bg-gray-700/50' : 'bg-white/60'

  return (
    <div className={`rounded-xl ${bgColor} border-2 ${borderColor} overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm`}>
      <div
        className={`p-5 cursor-pointer transition-all ${isDark ? 'hover:bg-gray-600/70' : 'hover:bg-purple-50/80'}`}
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`font-medium ${textColor}`}>
              {subject.name}
              <span className={`text-sm ml-2 ${secondaryText}`}>
                ({subject.code})
              </span>
            </h3>
            <div className={`text-xs ${secondaryText} mt-1`}>
              {subject.branch} • Year {subject.year} • Semester {subject.semester}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-sm font-medium ${
                progress.percentage === 100 ? 'text-green-500' : 'text-indigo-500'
              }`}>
                {progress.percentage}% Complete
              </div>
              <div className={`text-xs ${secondaryText}`}>
                {progress.completedCount} of {progress.totalModules} modules
              </div>
            </div>
            <button className={`p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 ${isDark ? 'bg-gray-600/50 hover:bg-gray-600' : 'bg-purple-100 hover:bg-purple-200'}`}>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={`p-5 pt-0 border-t-2 ${borderColor} animate-fadeIn`}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${secondaryText}`}>
                {progress.completedCount} completed of {progress.totalModules} modules
              </span>
              <span className={`text-sm font-medium ${
                progress.percentage === 100 ? 'text-green-500' : 'text-indigo-500'
              }`}>
                {progress.percentage}%
              </span>
            </div>
            <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-3 shadow-inner`}>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  progress.percentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                } shadow-lg`}
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            {modules.map((module, index) => (
              <ProgressModule 
                key={index} 
                module={module} 
                index={index} 
                isCompleted={progress.completedModules.includes(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}