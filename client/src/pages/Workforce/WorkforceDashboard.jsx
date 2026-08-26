import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function WorkforceDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;
  const kpiData = { 
    assigned: Math.max(1, Math.round(150 * scale)), 
    present: Math.max(1, Math.round(142 * scale)), 
    absent: Math.max(0, Math.round(8 * scale)), 
    skillMatch: 95, utilization: 88, 
    idleTime: Math.max(1, Math.round(12 * scale)), 
    overtime: Math.max(0, Math.round(24 * scale)) 
  };
  
  const attendanceData = [
    { name: 'Present', value: kpiData.present },
    { name: 'Absent', value: kpiData.absent }
  ];
  
  const COLORS = ['#0369a1', '#f43f5e'];

  const utilizationData = [
    { station: 'ST-01', utilization: 92 },
    { station: 'ST-02', utilization: 85 },
    { station: 'ST-03', utilization: 88 },
    { station: 'ST-04', utilization: 95 },
    { station: 'ST-05', utilization: 80 }
  ];

  const tableData = [
    { station: 'ST-01', assigned: Math.round(30 * scale) || 1, present: Math.round(29 * scale) || 1, absent: Math.round(1 * scale), skillMatch: '98%', utilization: '92%', idleTime: Math.max(1, Math.round(2 * scale)) },
    { station: 'ST-02', assigned: Math.round(30 * scale) || 1, present: Math.round(28 * scale) || 1, absent: Math.round(2 * scale), skillMatch: '94%', utilization: '85%', idleTime: Math.max(1, Math.round(3 * scale)) },
    { station: 'ST-03', assigned: Math.round(30 * scale) || 1, present: Math.round(29 * scale) || 1, absent: Math.round(1 * scale), skillMatch: '96%', utilization: '88%', idleTime: Math.max(1, Math.round(2.5 * scale)) },
    { station: 'ST-04', assigned: Math.round(30 * scale) || 1, present: Math.round(30 * scale) || 1, absent: 0, skillMatch: '99%', utilization: '95%', idleTime: Math.max(1, Math.round(1 * scale)) },
    { station: 'ST-05', assigned: Math.round(30 * scale) || 1, present: Math.round(26 * scale) || 1, absent: Math.round(4 * scale), skillMatch: '90%', utilization: '80%', idleTime: Math.max(1, Math.round(3.5 * scale)) }
  ];

  const columns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Assigned', accessor: 'assigned' },
    { header: 'Present', accessor: 'present' },
    { header: 'Absent', accessor: 'absent' },
    { header: 'Skill Match %', accessor: 'skillMatch' },
    { header: 'Utilization %', accessor: 'utilization' },
    { header: 'Idle Time (hrs)', accessor: 'idleTime' }
  ];

  const exportToExcel = () => {
    exportToXLSX('WorkforceDashboard.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Assigned', kpiData.assigned], ['Present', kpiData.present], ['Absent', kpiData.absent], ['Skill Match %', kpiData.skillMatch], ['Utilization %', kpiData.utilization], ['Idle Time', kpiData.idleTime], ['Overtime', kpiData.overtime]] },
      { name: 'Attendance', rows: [['Status', 'Count'], ...attendanceData.map(d => [d.name, d.value])] },
      { name: 'Station Utilization', rows: [['Station', 'Utilization %'], ...utilizationData.map(d => [d.station, d.utilization])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Workforce Dashboard"
        icon={Users}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02','ST-03','ST-04','ST-05'], value: station, onChange: setStation }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard autoScale title="Total Operators Assigned" value={kpiData.assigned} />
          <StatCard autoScale title="Present" value={kpiData.present} />
          <StatCard autoScale title="Absent" value={kpiData.absent} />
          <StatCard autoScale title="Skill Match %" value={`${kpiData.skillMatch}%`} />
          <StatCard autoScale title="Operator Utilization %" value={`${kpiData.utilization}%`} />
          <StatCard autoScale title="Idle Time (hrs)" value={kpiData.idleTime} />
          <StatCard autoScale title="Overtime Hours" value={kpiData.overtime} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Attendance</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Utilization % by Station</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" fill="#0369a1" name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Station Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
