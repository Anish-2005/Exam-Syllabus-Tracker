// Utility functions and types extracted from the main analytics page

export interface UserData {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface SyllabusModule {
  [key: string]: any;
}

export interface SyllabusInfo {
  name: string;
  code: string;
  year: number;
  semester: number;
  modules: SyllabusModule[];
  [key: string]: any;
}

export interface SyllabusDataMap {
  [subjectId: string]: SyllabusInfo;
}

export interface UserProgressData {
  [subjectKey: string]: any;
}

export interface UserProgressMap {
  [userId: string]: UserProgressData;
}

export interface KpiData {
  subjectId: string;
  name: string;
  code: string;
  progress: number;
  completed: number;
  total: number;
  year: number;
  semester: number;
}

export interface KraData {
  name: string;
  subjects: number;
  totalModules: number;
  completedModules: number;
  avgProgress: number;
}

export interface YearlyProgressData {
  name: string;
  subjects: number;
  totalModules: number;
  completedModules: number;
  progress: number;
}

export interface CalculateProgressResult {
  percentage: number;
  completedCount: number;
  totalModules: number;
}

export interface SubjectProgress {
  [moduleKey: string]: boolean;
}

export function calculateProgress(
  subjectProgress: SubjectProgress,
  subjectId: string,
  syllabusData: SyllabusDataMap
): CalculateProgressResult {
  const subjectInfo = syllabusData[subjectId];
  const totalModules = subjectInfo && subjectInfo.modules ? subjectInfo.modules.length : 0;
  let completedCount = 0;
  if (!subjectInfo || !subjectInfo.modules || totalModules === 0) {
    return {
      percentage: 0,
      completedCount: 0,
      totalModules: 0,
    };
  }
  for (let i = 0; i < totalModules; i++) {
    if (subjectProgress[`module_${i}`] === true) {
      completedCount++;
    }
  }
  return {
    percentage: Math.round((completedCount / totalModules) * 100),
    completedCount,
    totalModules,
  };
}
// Add more utility functions as needed
