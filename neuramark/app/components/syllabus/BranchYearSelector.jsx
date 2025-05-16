'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const branches = [
  { id: 'cse', name: 'Computer Science & Engineering' },
  { id: 'ece', name: 'Electronics & Communication' },
  { id: 'ee', name: 'Electrical Engineering' },
  { id: 'me', name: 'Mechanical Engineering' },
  { id: 'ce', name: 'Civil Engineering' },
  { id: 'aiml', name: 'Artificial Intelligence & Machine Learning' },
  { id: 'ds', name: 'Data Science' },
]

const specializations = {
  cse: [
    { id: 'general', name: 'General' },
    { id: 'aiml', name: 'AI & ML' },
    { id: 'cyber', name: 'Cyber Security' },
  ],
  aiml: [
    { id: 'general', name: 'General' },
    { id: 'robotics', name: 'Robotics' },
  ],
  ds: [
    { id: 'general', name: 'General' },
    { id: 'analytics', name: 'Analytics' },
  ],
}

export default function BranchYearSelector() {
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedBranch && selectedYear) {
      router.push(`/dashboard?branch=${selectedBranch}&year=${selectedYear}&specialization=${selectedSpecialization}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Select Branch
        </label>
        <select
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value)
            setSelectedSpecialization('')
          }}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          <option value="">Select your branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBranch && specializations[selectedBranch] && (
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Select Specialization
          </label>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">None (General)</option>
            {specializations[selectedBranch].map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Select Year
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`p-2 rounded-md border ${selectedYear === year ? 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900 dark:border-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Year {year}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!selectedBranch || !selectedYear}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  )
}