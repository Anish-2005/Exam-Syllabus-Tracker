import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

interface SubjectModule {
  name: string;
}
interface SubjectInfo {
  name: string;
  code: string;
  branch: string;
  year: number;
  semester: number;
  modules: SubjectModule[];
}
interface SubjectProgress {
  [key: string]: boolean | any;
}
interface ProgressResult {
  percentage: number;
  completedCount: number;
  totalModules: number;
}
interface UserProgressDetailsProps {
  progress: any;
  syllabusData: { [key: string]: SubjectInfo };
  calculateProgress: (subjectProgress: SubjectProgress, subjectId: string) => ProgressResult;
  formatDate: (date: Date | null) => string;
}

export default function UserProgressDetails({ progress, syllabusData, calculateProgress, formatDate }: UserProgressDetailsProps) {
  if (!progress) return <div className="text-sm text-gray-500 dark:text-gray-400 italic">No progress data available</div>;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
        <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
        Learning Progress
      </h4>
      <div className="space-y-6">
        {Object.entries(progress).map(([key, value]) => {
          if (key === 'updatedAt') return null;
          const subjectId = key.replace('subject_', '');
          const subjectInfo: SubjectInfo = syllabusData[subjectId];
          if (!subjectInfo) return null;
          const subjectProgress: SubjectProgress = value as SubjectProgress;
          const progressResult: ProgressResult = calculateProgress(subjectProgress, subjectId);
          return (
            <div key={key} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">{subjectInfo.name}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subjectInfo.code} • {subjectInfo.branch} • Year {subjectInfo.year} • Sem {subjectInfo.semester}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${progressResult.percentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {progressResult.percentage}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {progressResult.completedCount} of {progressResult.totalModules} modules
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${progressResult.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${progressResult.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subjectInfo.modules?.map((module: SubjectModule, index: number) => {
                  const isCompleted: boolean = subjectProgress[`module_${index}`] === true;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-md border transition-colors ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                          : 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-gray-900 dark:text-gray-300'
                        }`}>
                          Module {index + 1}: {module.name}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {progress.updatedAt && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          Last updated: {formatDate(progress.updatedAt.toDate())}
        </div>
      )}
    </div>
  );
}
