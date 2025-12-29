import React from 'react';
import type { JSX } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface UserMobileCardProps {
  user: any;
  expandedUser: string | null;
  toggleUserExpand: (id: string) => void;
  formatDate: (date: Date | null) => string;
  renderProgressData: (userId: string) => JSX.Element;
}

export default function UserMobileCard({ user, expandedUser, toggleUserExpand, formatDate, renderProgressData }: UserMobileCardProps) {
  return (
    <div
      key={user.id}
      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
            />
          ) : (
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => toggleUserExpand(user.id)}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {expandedUser === user.id ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Joined</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Last Active</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</p>
        </div>
      </div>
      {expandedUser === user.id && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {renderProgressData(user.id)}
        </div>
      )}
    </div>
  );
}
