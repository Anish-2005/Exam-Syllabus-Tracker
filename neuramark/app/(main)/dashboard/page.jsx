// app/dashboard/page.js
'use client'
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../components/lib/firebase';
import SyllabusProgressCard from './SyllabusProgressCard';
import UpcomingExams from './UpcomingExams';
import RecentActivity from './RecentActivity';
import PerformanceChart from './PerformanceChart';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [syllabusData, setSyllabusData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedYear, setSelectedYear] = useState(1);

  useEffect(() => {
    const fetchSyllabusData = async () => {
      try {
        const q = query(
          collection(db, 'syllabus'),
          where('branch', '==', selectedBranch),
          where('year', '==', selectedYear)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSyllabusData(data);
      } catch (error) {
        console.error('Error fetching syllabus data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSyllabusData();
    }
  }, [user, selectedBranch, selectedYear]);

  const branches = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'AIML', 'DS'];
  const years = [1, 2, 3, 4];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Exam Syllabus Tracker</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.email}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Branch/Year Selector */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {years.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Subjects</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {loading ? '...' : syllabusData.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : syllabusData.filter(sub => sub.completed).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : 
                  syllabusData.length > 0 
                    ? `${Math.round((syllabusData.filter(sub => sub.completed).length / syllabusData.length * 100))}%` 
                    : '0%'
                }
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Syllabus Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedBranch} Year {selectedYear} Syllabus Progress
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {syllabusData.length > 0 ? (
                      syllabusData.map(subject => (
                        <SyllabusProgressCard 
                          key={subject.id}
                          subject={subject}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No syllabus data found for this branch/year</p>
                    )}
                  </div>
                )}
              </div>

              {/* Performance Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
                <PerformanceChart data={syllabusData} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Exams */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
                <UpcomingExams branch={selectedBranch} year={selectedYear} />
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <RecentActivity userId={user?.uid} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}