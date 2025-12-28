import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  error ? (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center space-x-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
      </div>
    </div>
  ) : null
);

export default ErrorDisplay;
