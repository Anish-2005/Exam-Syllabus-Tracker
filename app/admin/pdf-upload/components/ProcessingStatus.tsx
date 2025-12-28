import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ isProcessing }) => (
  isProcessing ? (
    <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <p className="text-blue-700 dark:text-blue-300 font-medium">
        Processing PDF with AI... This may take a few moments.
      </p>
    </div>
  ) : null
);

export default ProcessingStatus;
