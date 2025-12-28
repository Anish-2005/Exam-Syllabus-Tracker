import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface UserSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fetchAllData: () => void;
  loading: boolean;
}

export default function UserSearchBar({ searchQuery, setSearchQuery, fetchAllData, loading }: UserSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        onClick={fetchAllData}
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
}
