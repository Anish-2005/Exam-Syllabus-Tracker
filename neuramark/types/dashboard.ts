import { User, AuthState, LoginCredentials, SignupData } from './auth';

export interface Module {
  id: string;
  name: string;
  topics: string[];
  completedTopics: number;
  totalTopics: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  syllabus?: string;
  modules: Module[];
  progress: number;
  totalTopics: number;
  completedTopics: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Semester {
  id: string;
  number: number;
  subjects: Subject[];
}

export interface Year {
  id: string;
  number: number;
  semesters: Semester[];
}

export interface Branch {
  id: string;
  name: string;
  years: Year[];
}

export interface Exam {
  id: string;
  name: string;
  date: Date;
  subjects: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ProgressData {
  subjectId: string;
  progress: number;
  lastStudied: Date;
}

export interface DashboardStats {
  totalSubjects: number;
  completedSubjects: number;
  upcomingExams: number;
  averageProgress: number;
}

export interface UserProgress {
  [subjectId: string]: {
    [moduleIndex: number]: {
      completedTopics: number[];
    };
  };
}

export interface SyllabusData {
  branches: Branch[];
  specializations: { [key: string]: string[] };
}