// app/admin/subjects/page.js
'use client'
import { Suspense } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminSubject from './Subjects'

export default function AdminSubjects() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminSubject />
      </Suspense>
    </ProtectedRoute>
  )
}