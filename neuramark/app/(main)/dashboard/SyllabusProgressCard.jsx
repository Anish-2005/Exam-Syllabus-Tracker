// components/SyllabusProgressCard.js
'use client'
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../components/lib/firebase';

export default function SyllabusProgressCard({ subject }) {
  const [completed, setCompleted] = useState(subject.completed || false);
  const [loading, setLoading] = useState(false);

  const toggleCompletion = async () => {
    try {
      setLoading(true);
      const subjectRef = doc(db, 'syllabus', subject.id);
      await updateDoc(subjectRef, {
        completed: !completed
      });
      setCompleted(!completed);
    } catch (error) {
      console.error('Error updating subject:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">{subject.name}</h3>
          <p className="text-sm text-gray-500">{subject.code}</p>
        </div>
        <button
          onClick={toggleCompletion}
          disabled={loading}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            completed 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {loading ? '...' : completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${subject.progress || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Progress</span>
          <span>{subject.progress || 0}%</span>
        </div>
      </div>
    </div>
  );
}