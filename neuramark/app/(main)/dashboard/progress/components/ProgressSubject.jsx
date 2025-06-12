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
  const { theme } = useTheme()
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} overflow-hidden transition-all duration-200`}>
      <div
        className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
            <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={`p-4 pt-0 border-t ${borderColor} animate-fadeIn`}>
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
            <div className={`w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
              <div
                className={`h-2.5 rounded-full ${
                  progress.percentage === 100 ? 'bg-green-500' : 'bg-indigo-500'
                }`}
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