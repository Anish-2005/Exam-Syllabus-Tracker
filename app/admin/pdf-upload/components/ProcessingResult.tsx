import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Subject {
  name: string;
  code: string;
  modules?: string[];
}

interface ProcessingResultProps {
  result: {
    branch: string;
    year: string;
    semester: string;
    subjects?: Subject[];
  } | null;
}

const ProcessingResult: React.FC<ProcessingResultProps> = ({ result }) => (
  result ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
    >
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="h-6 w-6 text-green-500" />
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
          Syllabus Successfully Processed!
        </h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Branch</p>
            <p className="text-gray-900 dark:text-white">{result.branch}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Year</p>
            <p className="text-gray-900 dark:text-white">{result.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Semester</p>
            <p className="text-gray-900 dark:text-white">{result.semester}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects Found</p>
            <p className="text-gray-900 dark:text-white">{result.subjects?.length || 0}</p>
          </div>
        </div>
        {result.subjects && result.subjects.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Extracted Subjects:</h4>
            <div className="space-y-2">
              {result.subjects.map((subject, index) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <p className="font-medium text-gray-900 dark:text-white">{subject.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Code: {subject.code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modules: {subject.modules?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  ) : null
);

export default ProcessingResult;
