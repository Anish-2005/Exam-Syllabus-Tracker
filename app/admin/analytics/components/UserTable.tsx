import React from 'react';
import UserAnalyticsCard from './UserAnalyticsCard';

interface UserTableProps {
  users: any[];
  isDark: boolean;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  expandedUser: string | null;
  toggleUserExpand: (userId: string) => void;
  getUserKpiData: (userId: string) => any[];
  getUserKraData: (userId: string) => any[];
  getYearlyProgressData: (userId: string) => any[];
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isDark,
  textColor,
  secondaryText,
  borderColor,
  expandedUser,
  toggleUserExpand,
  getUserKpiData,
  getUserKraData,
  getYearlyProgressData,
}) => (
  <div className="space-y-6">
    {users.map((user) => {
      const userKpiData = getUserKpiData(user.id);
      const userKraData = getUserKraData(user.id);
      const yearlyProgressData = getYearlyProgressData(user.id);
      const hasProgress = userKpiData.length > 0;
      return (
        <UserAnalyticsCard
          key={user.id}
          user={user}
          isDark={isDark}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
          expandedUser={expandedUser}
          toggleUserExpand={toggleUserExpand}
          userKpiData={userKpiData}
          userKraData={userKraData}
          yearlyProgressData={yearlyProgressData}
          hasProgress={hasProgress}
        />
      );
    })}
  </div>
);

export default UserTable;
