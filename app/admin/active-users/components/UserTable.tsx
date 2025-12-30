import React from 'react';
import Image from 'next/image';
import { User, Mail, Calendar, Clock, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface UserTableProps {
  filteredUsers: any[];
  expandedUser: string | null;
  toggleUserExpand: (id: string) => void;
  formatDate: (date: Date | null) => string;
  userProgress: any;
  renderProgressData: (userId: string) => React.ReactElement;
}

export default function UserTable({ filteredUsers, expandedUser, toggleUserExpand, formatDate, userProgress, renderProgressData }: UserTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              User
            </div>
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </div>
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Joined
            </div>
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Last Active
            </div>
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Progress
            </div>
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            Details
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredUsers.map((user) => (
          <React.Fragment key={user.id}>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {user.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.createdAt)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  userProgress[user.id] && Object.keys(userProgress[user.id]).length > 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {userProgress[user.id] && Object.keys(userProgress[user.id]).length > 0 ? 'Active' : 'No Progress'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => toggleUserExpand(user.id)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  {expandedUser === user.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>
            {expandedUser === user.id && (
              <tr>
                <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30">
                  {renderProgressData(user.id)}
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
