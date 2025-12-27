import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Branch, UserProgress } from '@/types/dashboard';

interface DashboardState {
  branches: Branch[];
  userProgress: UserProgress;
  selectedBranch: string;
  selectedYear: number;
  selectedSemester: number | null;
  selectedSubject: string | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;

  // Actions
  setBranches: (branches: Branch[]) => void;
  setUserProgress: (progress: UserProgress) => void;
  setSelectedBranch: (branch: string) => void;
  setSelectedYear: (year: number) => void;
  setSelectedSemester: (semester: number | null) => void;
  setSelectedSubject: (subject: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  updateProgress: (subjectId: string, moduleIndex: number, completedTopics: number[]) => void;
  reset: () => void;
}

const initialState = {
  branches: [],
  userProgress: {},
  selectedBranch: '',
  selectedYear: 1,
  selectedSemester: null,
  selectedSubject: null,
  loading: true,
  error: null,
  isAdmin: false,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setBranches: (branches) => set({ branches }),
      setUserProgress: (userProgress) => set({ userProgress }),
      setSelectedBranch: (selectedBranch) => set({ selectedBranch }),
      setSelectedYear: (selectedYear) => set({ selectedYear }),
      setSelectedSemester: (selectedSemester) => set({ selectedSemester }),
      setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),

      updateProgress: (subjectId, moduleIndex, completedTopics) => {
        const { userProgress } = get();
        const updatedProgress = {
          ...userProgress,
          [subjectId]: {
            ...userProgress[subjectId],
            [moduleIndex]: { completedTopics }
          }
        };
        set({ userProgress: updatedProgress });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'dashboard-store',
    }
  )
);