import { useState, useEffect, useCallback } from 'react';
import { Branch, UserProgress, Subject } from '@/types/dashboard';
import { DashboardService } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';

export const useDashboard = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [syllabusData, progress, adminStatus] = await Promise.all([
        DashboardService.getSyllabusData(),
        DashboardService.getUserProgress(user.id),
        DashboardService.checkAdminStatus(user.id)
      ]);

      setBranches(syllabusData);
      setUserProgress(progress);
      setIsAdmin(adminStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProgress = useCallback(async (
    subjectId: string,
    moduleIndex: number,
    completedTopics: number[]
  ) => {
    if (!user) return;

    try {
      await DashboardService.updateUserProgress(user.id, subjectId, moduleIndex, completedTopics);
      setUserProgress(prev => ({
        ...prev,
        [subjectId]: {
          ...prev[subjectId],
          [moduleIndex]: { completedTopics }
        }
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      setError(message);
      console.error('Error updating progress:', err);
    }
  }, [user]);

  const addSubject = useCallback(async (
    branchId: string,
    yearId: string,
    semesterId: string,
    subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const subjectId = await DashboardService.addSubject(branchId, yearId, semesterId, subjectData);
      await loadDashboardData(); // Reload data to get the new subject
      return subjectId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add subject';
      setError(message);
      throw err;
    }
  }, [loadDashboardData]);

  const updateSubject = useCallback(async (
    branchId: string,
    yearId: string,
    semesterId: string,
    subjectId: string,
    subjectData: Partial<Subject>
  ) => {
    try {
      await DashboardService.updateSubject(branchId, yearId, semesterId, subjectId, subjectData);
      await loadDashboardData(); // Reload data to reflect changes
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update subject';
      setError(message);
      throw err;
    }
  }, [loadDashboardData]);

  const deleteSubject = useCallback(async (
    branchId: string,
    yearId: string,
    semesterId: string,
    subjectId: string
  ) => {
    try {
      await DashboardService.deleteSubject(branchId, yearId, semesterId, subjectId);
      await loadDashboardData(); // Reload data to reflect changes
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete subject';
      setError(message);
      throw err;
    }
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    branches,
    userProgress,
    loading,
    error,
    isAdmin,
    updateProgress,
    addSubject,
    updateSubject,
    deleteSubject,
    reloadData: loadDashboardData
  };
};