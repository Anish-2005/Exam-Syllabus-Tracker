import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, ChevronUp, ChevronDown } from 'lucide-react';
import KPICharts from './KPICharts';

interface UserAnalyticsCardProps {
  user: any;
  isDark: boolean;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  expandedUser: string | null;
  toggleUserExpand: (userId: string) => void;
  userKpiData: any[];
  userKraData: any[];
  yearlyProgressData: any[];
  hasProgress: boolean;
}

const UserAnalyticsCard: React.FC<UserAnalyticsCardProps> = ({
  user,
  isDark,
  textColor,
  secondaryText,
  borderColor,
  expandedUser,
  toggleUserExpand,
  userKpiData,
  userKraData,
  yearlyProgressData,
  hasProgress,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`p-5 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-white/60'} border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all backdrop-blur-sm`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {user.photoURL ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-40"></div>
            <Image
              src={user.photoURL}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-indigo-500 relative"
            />
          </div>
        ) : (
          <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg`}>
            <User size={20} />
          </div>
        )}
        <div>
          <div className={`font-medium ${textColor}`}>{user.name}</div>
          <div className={`text-xs ${secondaryText}`}>{user.email}</div>
        </div>
      </div>
      <button
        onClick={() => toggleUserExpand(user.id)}
        className={`p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 ${isDark ? 'bg-gray-600/50 hover:bg-gray-600' : 'bg-purple-100 hover:bg-purple-200'}`}
      >
        {expandedUser === user.id ? (
          <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        )}
      </button>
    </div>
    {/* KPI, KRA, and Yearly Progress charts/components would go here, to be further componentized if needed */}
    {expandedUser === user.id && (
      <div className="mt-6">
        <KPICharts
          userKpiData={userKpiData}
          userKraData={userKraData}
          yearlyProgressData={yearlyProgressData}
          COLORS={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]}
        />
      </div>
    )}
  </motion.div>
);

export default UserAnalyticsCard;
