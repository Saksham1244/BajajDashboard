import React, { useState, useMemo } from 'react';
import { Network } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SkillMatrixDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const kpiData = { total: 150, beginner: 30, intermediate: 70, expert: 50 };
  
  const skillDistData = [
    { name: 'Beginner', value: 30 },
    { name: 'Intermediate', value: 70 },
    { name: 'Expert', value: 50 }
  ];
  
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  const coverageData = [
    { station: 'ST-01', coverage: 95 },
    { station: 'ST-02', coverage: 85 },
    { station: 'ST-03', coverage: 100 },
    { station: 'ST-04', coverage: 90 },
    { station: 'ST-05', coverage: 100 }
  ];

  const tableData = [
    { name: 'John Doe', station: 'ST-01', skillLevel: 'Expert', certified: 'Yes', lastAssessed: '2023-10-01' },
    { name: 'Jane Smith', station: 'ST-02', skillLevel: 'Intermediate', certified: 'Yes', lastAssessed: '2023-09-15' },
    { name: 'Mike Johnson', station: 'ST-03', skillLevel: 'Beginner', certified: 'No', lastAssessed: '2023-10-10' },
    { name: 'Sarah Williams', station: 'ST-04', skillLevel: 'Expert', certified: 'Yes', lastAssessed: '2023-08-20' },
    { name: 'David Brown', station: 'ST-05', skillLevel: 'Intermediate', certified: 'Yes', lastAssessed: '2023-09-25' }
  ];

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { header: 'Operator Name', accessor: 'name' },
    { header: 'Station', accessor: 'station' },
    { header: 'Skill Level', accessor: (row) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(row.skillLevel)}`}>{row.skillLevel}</span> },
    { header: 'Certified', accessor: 'certified' },
    { header: 'Last Assessed', accessor: 'lastAssessed' }
  ];

  const exportToExcel = () => {
    exportToXLSX('SkillMatrixDashboard.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Operators', kpiData.total], ['Beginner', kpiData.beginner], ['Intermediate', kpiData.intermediate], ['Expert', kpiData.expert]] },
      { name: 'Skill Matrix', rows: [['Name', 'Station', 'Skill Level', 'Certified', 'Last Assessed'], ...tableData.map(d => [d.name, d.station, d.skillLevel, d.certified, d.lastAssessed])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Skill Matrix Dashboard"
        icon={Network}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02','ST-03','ST-04','ST-05'], value: station, onChange: setStation }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Operators" value={kpiData.total} />
          <StatCard title="Beginner" value={kpiData.beginner} />
          <StatCard title="Intermediate" value={kpiData.intermediate} />
          <StatCard title="Expert" value={kpiData.expert} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Skill Level Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={skillDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {skillDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Skill Coverage % per Station</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={coverageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="coverage" fill="#0369a1" name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Operator Skill Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
