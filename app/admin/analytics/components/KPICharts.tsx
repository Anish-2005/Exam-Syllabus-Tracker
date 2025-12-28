// Color palette for PieChart
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6699', '#FFB347', '#B6E880', '#FF6666', '#00BFFF',
];
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KPIChartsProps {
  userKpiData: any[];
  userKraData: any[];
  yearlyProgressData: any[];
  COLORS: string[];
}

const KPICharts: React.FC<KPIChartsProps> = ({ userKpiData, userKraData, yearlyProgressData, COLORS }) => {
  // Render recharts or other chart components here using the provided data
  return (
    <div className="space-y-8">
      {/* KPI Pie Chart */}
      {userKpiData && userKpiData.length > 0 && (
        <div>
          <div className="font-semibold mb-2">KPI Progress by Subject</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={userKpiData}
                dataKey="progress"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {userKpiData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* KRA Bar Chart */}
      {userKraData && userKraData.length > 0 && (
        <div>
          <div className="font-semibold mb-2">KRA Average Progress by Semester</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userKraData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="avgProgress" fill="#8884d8" name="Avg Progress (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Yearly Progress Bar Chart */}
      {yearlyProgressData && yearlyProgressData.length > 0 && (
        <div>
          <div className="font-semibold mb-2">Yearly Progress</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearlyProgressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="progress" fill="#00C49F" name="Progress (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KPICharts;
