'use client'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/context/AuthContext'
import { useTheme } from '@/app/context/ThemeContext'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { useRouter } from 'next/navigation'
import ProgressHeader from './components/ProgressHeader'
import ProgressSidebar from './components/ProgressSidebar'
import ProgressSubject from './components/ProgressSubject'
import ProgressSkeleton from './components/ProgressSkeleton'
import ProgressEmptyState from './components/ProgressEmptyState'

export default function MyProgressPage() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [syllabusData, setSyllabusData] = useState({})
  const [expandedSubjects, setExpandedSubjects] = useState([])
  const router = useRouter()

  // Theme styles
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Fetch user progress
      const progressDoc = await getDoc(doc(db, 'userProgress', user.uid))
      if (progressDoc.exists()) {
        setUserProgress(progressDoc.data())
      } else {
        setUserProgress(null)
      }

      // Fetch syllabus data for all subjects in progress
      if (progressDoc.exists()) {
        const progressData = progressDoc.data()
        const subjectIds = Object.keys(progressData)
          .filter(key => key.startsWith('subject_'))
          .map(key => key.replace('subject_', ''))

        const syllabusMap = {}
        for (const subjectId of subjectIds) {
          const subjectDoc = await getDoc(doc(db, 'syllabus', subjectId))
          if (subjectDoc.exists()) {
            syllabusMap[subjectId] = subjectDoc.data()
          }
        }
        setSyllabusData(syllabusMap)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSubjectExpand = (subjectId) => {
    setExpandedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const calculateProgress = (subjectProgress, subjectId) => {
    const subjectInfo = syllabusData[subjectId]
    if (!subjectInfo || !subjectInfo.modules) return {
      percentage: 0,
      completedCount: 0,
      totalModules: 0,
      completedModules: []
    }

    const totalModules = subjectInfo.modules.length
    if (totalModules === 0) return {
      percentage: 0,
      completedCount: 0,
      totalModules: 0,
      completedModules: []
    }

    let completedCount = 0
    const completedModules = []

    for (let i = 0; i < totalModules; i++) {
      if (subjectProgress[`module_${i}`] === true) {
        completedCount++
        completedModules.push(i)
      }
    }

    return {
      percentage: Math.round((completedCount / totalModules) * 100),
      completedCount,
      totalModules,
      completedModules
    }
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${bgColor} transition-colors duration-200 pb-8`}>
        <ProgressHeader 
          user={user} 
          loading={loading} 
          onRefresh={fetchUserData} 
          onMenuOpen={() => setSidebarOpen(true)} 
        />

        <ProgressSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          user={user} 
          loading={loading} 
          onRefresh={fetchUserData} 
          logout={logout}
        />

        <main className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ${textColor}`}>
          <div className={`${cardBg} p-4 sm:p-6 rounded-lg shadow ${borderColor} border mt-4`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className={`text-xl font-bold ${textColor} mb-1`}>
                  Your Learning Progress
                </h2>
                <div className={`flex items-center space-x-2 ${secondaryText} text-sm`}>
                  {user?.email}
                </div>
              </div>
            </div>

            {loading ? (
              <ProgressSkeleton />
            ) : !userProgress ? (
              <ProgressEmptyState />
            ) : (
              <div className="space-y-4">
                {Object.entries(userProgress).map(([key, value]) => {
                  if (key === 'updatedAt') return null

                  const subjectId = key.replace('subject_', '')
                  const subjectInfo = syllabusData[subjectId]
                  if (!subjectInfo) return null

                  const progress = calculateProgress(value, subjectId)
                  const isExpanded = expandedSubjects.includes(subjectId)

                  return (
                    <ProgressSubject
                      key={key}
                      subject={subjectInfo}
                      progress={progress}
                      isExpanded={isExpanded}
                      onToggle={() => toggleSubjectExpand(subjectId)}
                      modules={subjectInfo.modules || []}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}