// app/dashboard/page.js
'use client'
import { Suspense } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardContent from './DashboardContent';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}