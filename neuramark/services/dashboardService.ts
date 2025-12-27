import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Branch, Subject, UserProgress, Module } from '@/types/dashboard';

export class DashboardService {
  static async getSyllabusData(): Promise<Branch[]> {
    try {
      const branchesRef = collection(db, 'branches');
      const branchesSnapshot = await getDocs(branchesRef);

      const branches: Branch[] = [];

      for (const branchDoc of branchesSnapshot.docs) {
        const branchData = branchDoc.data();
        const yearsRef = collection(db, 'branches', branchDoc.id, 'years');
        const yearsSnapshot = await getDocs(yearsRef);

        const years = await Promise.all(yearsSnapshot.docs.map(async (yearDoc) => {
          const yearData = yearDoc.data();
          const semestersRef = collection(db, 'branches', branchDoc.id, 'years', yearDoc.id, 'semesters');
          const semestersSnapshot = await getDocs(semestersRef);

          const semesters = await Promise.all(semestersSnapshot.docs.map(async (semesterDoc) => {
            const semesterData = semesterDoc.data();
            const subjectsRef = collection(db, 'branches', branchDoc.id, 'years', yearDoc.id, 'semesters', semesterDoc.id, 'subjects');
            const subjectsSnapshot = await getDocs(subjectsRef);

            const subjects = subjectsSnapshot.docs.map(subjectDoc => ({
              id: subjectDoc.id,
              ...subjectDoc.data(),
              createdAt: subjectDoc.data().createdAt?.toDate() || new Date(),
              updatedAt: subjectDoc.data().updatedAt?.toDate() || new Date(),
            })) as Subject[];

            return {
              id: semesterDoc.id,
              number: semesterData.number,
              subjects,
            };
          }));

          return {
            id: yearDoc.id,
            number: yearData.number,
            semesters,
          };
        }));

        branches.push({
          id: branchDoc.id,
          name: branchData.name,
          years,
        });
      }

      return branches;
    } catch (error) {
      console.error('Error fetching syllabus data:', error);
      throw error;
    }
  }

  static async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        return progressDoc.data() as UserProgress;
      }

      return {};
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return {};
    }
  }

  static async updateUserProgress(userId: string, subjectId: string, moduleIndex: number, completedTopics: number[]): Promise<void> {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const progressDoc = await getDoc(progressRef);

      const currentProgress = progressDoc.exists() ? progressDoc.data() as UserProgress : {};

      if (!currentProgress[subjectId]) {
        currentProgress[subjectId] = {};
      }

      currentProgress[subjectId][moduleIndex] = { completedTopics };

      await setDoc(progressRef, currentProgress, { merge: true });
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  static async addSubject(branchId: string, yearId: string, semesterId: string, subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const subjectsRef = collection(db, 'branches', branchId, 'years', yearId, 'semesters', semesterId, 'subjects');
      const docRef = await addDoc(subjectsRef, {
        ...subjectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  }

  static async updateSubject(branchId: string, yearId: string, semesterId: string, subjectId: string, subjectData: Partial<Subject>): Promise<void> {
    try {
      const subjectRef = doc(db, 'branches', branchId, 'years', yearId, 'semesters', semesterId, 'subjects', subjectId);
      await updateDoc(subjectRef, {
        ...subjectData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  static async deleteSubject(branchId: string, yearId: string, semesterId: string, subjectId: string): Promise<void> {
    try {
      const subjectRef = doc(db, 'branches', branchId, 'years', yearId, 'semesters', semesterId, 'subjects', subjectId);
      await deleteDoc(subjectRef);
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  static async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin';
      }

      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}