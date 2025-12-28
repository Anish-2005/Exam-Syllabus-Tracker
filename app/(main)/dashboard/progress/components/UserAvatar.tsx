// app/components/UserAvatar.js
'use client'
import Image from 'next/image'
import { User } from 'lucide-react'

interface UserAvatarProps {
  user: {
    photoURL?: string;
    displayName?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  return (
    <>
      {user?.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || 'User'}
          width={size === 'sm' ? 28 : size === 'md' ? 32 : 40}
          height={size === 'sm' ? 28 : size === 'md' ? 32 : 40}
          className={`rounded-full ${sizeClasses[size]}`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300`}>
          <User size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
        </div>
      )}
    </>
  )
}