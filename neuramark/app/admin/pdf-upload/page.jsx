'use client'

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PDFUpload() {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingResult, setProcessingResult] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
            setError(null);
            setProcessingResult(null);
        } else {
            setError('Please upload a valid PDF file');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const handleUpload = async () => {
        if (!uploadedFile) return;

        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', uploadedFile);

            const response = await fetch('/api/process-pdf', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setProcessingResult(result);
            } else {
                setError(result.error || 'Failed to process PDF');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setProcessingResult(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF Syllabus Upload
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Upload a PDF syllabus document and let AI extract subjects, modules, and update the database automatically.
                </p>
            </div>

            <div className="space-y-6">
                {/* Upload Area */}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        or click to select a file
                    </p>
                </div>

                {/* File Preview */}
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
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {uploadedFile.name}
                                    </p>
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

                {/* Upload Button */}
                {uploadedFile && !isProcessing && (
                    <button
                        onClick={handleUpload}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Process PDF with AI
                    </button>
                )}

                {/* Processing Status */}
                {isProcessing && (
                    <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <p className="text-blue-700 dark:text-blue-300 font-medium">
                            Processing PDF with AI... This may take a few moments.
                        </p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Result */}
                {processingResult && (
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
                                    <p className="text-gray-900 dark:text-white">{processingResult.branch}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Year</p>
                                    <p className="text-gray-900 dark:text-white">{processingResult.year}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Semester</p>
                                    <p className="text-gray-900 dark:text-white">{processingResult.semester}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects Found</p>
                                    <p className="text-gray-900 dark:text-white">{processingResult.subjects?.length || 0}</p>
                                </div>
                            </div>

                            {processingResult.subjects && processingResult.subjects.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Extracted Subjects:</h4>
                                    <div className="space-y-2">
                                        {processingResult.subjects.map((subject, index) => (
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
                )}
            </div>
        </div>
    );
}