// components/UpcomingExams.js
'use client'
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../components/lib/firebase';
import { format } from 'date-fns';

export default function UpcomingExams({ branch, year }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const q = query(
          collection(db, 'exams'),
          where('branch', '==', branch),
          where('year', '==', year),
          orderBy('date', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        }));
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [branch, year]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : exams.length > 0 ? (
        exams.map(exam => (
          <div key={exam.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{exam.subject}</h4>
                <p className="text-sm text-gray-600">{exam.type} Exam</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {format(exam.date, 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-gray-500">
                  {format(exam.date, 'h:mm a')}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No upcoming exams</p>
      )}
    </div>
  );
}