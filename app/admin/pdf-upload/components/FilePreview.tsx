import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, XCircle } from 'lucide-react';

interface FilePreviewProps {
  uploadedFile: File | null;
  resetUpload: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ uploadedFile, resetUpload }) => (
  <AnimatePresence>
    {uploadedFile && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={resetUpload}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default FilePreview;
