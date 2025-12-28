'use client'

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadArea from './components/UploadArea';
import FilePreview from './components/FilePreview';
import ProcessingStatus from './components/ProcessingStatus';
import ErrorDisplay from './components/ErrorDisplay';
import ProcessingResult from './components/ProcessingResult';

export default function PDFUpload() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    interface Subject {
        name: string;
        code: string;
        modules?: string[];
    }

    interface ProcessingResult {
        branch: string;
        year: string;
        semester: string;
        subjects?: Subject[];
    }

    const onDrop = (acceptedFiles: File[]) => {
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
                <UploadArea getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
                <FilePreview uploadedFile={uploadedFile} resetUpload={resetUpload} />
                {uploadedFile && !isProcessing && (
                    <button
                        onClick={handleUpload}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                        Process PDF with AI
                    </button>
                )}
                <ProcessingStatus isProcessing={isProcessing} />
                <ErrorDisplay error={error} />
                <ProcessingResult result={processingResult} />
            </div>
        </div>
    );
}