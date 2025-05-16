// components/RecentActivity.js
'use client'
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../components/lib/firebase';
import { format } from 'date-fns';

export default function RecentActivity({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const q = query(
          collection(db, 'activities'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        }));
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : activities.length > 0 ? (
        activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              activity.type === 'completed' ? 'bg-green-100 text-green-800' : 
              activity.type === 'progress' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {activity.type === 'completed' ? '✓' : activity.type === 'progress' ? '→' : '•'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500">
                {format(activity.timestamp, 'MMM dd, h:mm a')}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      )}
    </div>
  );
}