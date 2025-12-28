import React from 'react';
import { Upload } from 'lucide-react';
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

interface UploadAreaProps {
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ getRootProps, getInputProps, isDragActive }) => (
  <div
    {...getRootProps()}
    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
      isDragActive
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
    }`}
  >
    <input {...getInputProps()} />
    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file here'}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400">or click to select a file</p>
  </div>
);

export default UploadArea;
