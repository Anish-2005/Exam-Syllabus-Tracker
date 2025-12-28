import React from 'react';
import { User, CheckCircle, BookOpen, Calendar } from 'lucide-react';

interface AdminStatsCardsProps {
  usersCount: number;
  activeLearners: number;
  subjectsCount: number;
  newThisWeek: number;
}

export default function AdminStatsCards({ usersCount, activeLearners, subjectsCount, newThisWeek }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{usersCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Learners</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeLearners}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects Available</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{subjectsCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{newThisWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
