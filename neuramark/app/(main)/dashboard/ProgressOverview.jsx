'use client'

import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function ProgressOverview({ progress }) {
  const overallProgress = progress?.overallCompletion || 0

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Overall Progress</h2>
      
      <div className="flex items-center justify-center">
        <div style={{ width: 150, height: 150 }}>
          <CircularProgressbar
            value={overallProgress}
            text={`${overallProgress}%`}
            styles={{
              path: {
                stroke: `rgba(79, 70, 229, ${overallProgress / 100})`,
              },
              text: {
                fill: '#4f46e5',
                fontSize: '20px',
              },
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-blue-50 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
          <p className="font-semibold dark:text-white">{progress?.subjects?.length || 0}</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="font-semibold dark:text-white">{progress?.completedSubjects || 0}</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
          <p className="font-semibold dark:text-white">{progress?.remainingSubjects || 0}</p>
        </div>
      </div>
    </div>
  )
}