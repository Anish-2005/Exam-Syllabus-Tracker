'use client'
import { useTheme } from '@/app/context/ThemeContext'

interface ModuleProp {
  name: string
  topics: string[] | string
}

interface ProgressModuleProps {
  module: ModuleProp
  index: number
  isCompleted: boolean
}

export default function ProgressModule({ module, index, isCompleted }: ProgressModuleProps) {
  const { theme } = useTheme()
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'

  return (
    <div
      className={`p-3 rounded border transition-colors ${
        isCompleted
          ? theme === 'dark'
            ? 'bg-green-900/30 border-green-700'
            : 'bg-green-100 border-green-200'
          : theme === 'dark'
          ? 'bg-gray-700 border-gray-600'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${textColor}`}>
            Module {index + 1}: {module.name}
          </h4>
          {isCompleted && (
            <div className={`text-xs mt-1 text-green-600 dark:text-green-400`}>
              Status: Completed
            </div>
          )}
          {(Array.isArray(module.topics) ? module.topics.length > 0 : !!module.topics) && (
            <div className="mt-2">
              <div className={`text-xs ${secondaryText} font-medium`}>Topics:</div>
              <ul className="list-disc list-inside ml-4">
                {(Array.isArray(module.topics) ? module.topics : [module.topics]).map((topic, i) => (
                  <li key={i} className={`text-xs ${secondaryText}`}>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}