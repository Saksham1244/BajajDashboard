import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function WorkforceDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/workforce/dashboard?period=${period}&shift=${shift}&line=${line}&station=${station}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station]);

  const allTable = dbData?.table || [
    { id: '1', operator: 'Rahul Sharma', line: 'Line 1', station: 'Demo', shift: 'Shift 1', status: 'Present' },
    { id: '2', operator: 'Priya Singh', line: 'Line 2', station: 'Line2', shift: 'Shift 1', status: 'Present' },
    { id: '3', operator: 'Amit Kumar', line: 'Line 1', station: 'Station2', shift: 'Shift 1', status: 'Present' },
    { id: '4', operator: 'Neha Verma', line: 'Line 2', station: 'Demo', shift: 'Shift 2', status: 'Present' }
  ];

  const rawTable = allTable.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station) &&
    matchFilter(d.shift, shift)
  );
  const totalAssigned = rawTable.length;
  const totalPresent = rawTable.filter(d => d.status === 'Present').length;
  const totalAbsent = rawTable.filter(d => d.status !== 'Present').length;

  const kpiData = { 
    assigned: totalAssigned, 
    present: totalPresent, 
    absent: totalAbsent, 
    skillMatch: totalAssigned > 0 ? 95 : 0, 
    utilization: totalAssigned > 0 ? 88 : 0, 
    idleTime: 0, 
    overtime: 0 
  };
  
  const attendanceData = [
    { name: 'Present', value: kpiData.present },
    { name: 'Absent', value: kpiData.absent }
  ].filter(d => d.value > 0);
  
  const COLORS = ['#0369a1', '#f43f5e'];

  const utilizationData = [
    { station: 'Demo', utilization: totalAssigned > 0 ? 92 : 0 },
    { station: 'Line2', utilization: totalAssigned > 0 ? 85 : 0 },
    { station: 'Station2', utilization: totalAssigned > 0 ? 88 : 0 }
  ].filter(d => d.utilization > 0);

  const tableData = rawTable.map(d => ({
    station: d.station,
    assigned: 1,
    present: d.status === 'Present' ? 1 : 0,
    absent: d.status === 'Present' ? 0 : 1,
    skillMatch: '98%',
    utilization: '92%',
    idleTime: 0
  }));

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
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Assigned', kpiData.assigned], ['Present', kpiData.present], ['Absent', kpiData.absent], ['Skill Match %', `${kpiData.skillMatch}%`], ['Utilization %', `${kpiData.utilization}%`], ['Idle Time', kpiData.idleTime], ['Overtime', kpiData.overtime]] },
      { name: 'Attendance', rows: [['Status', 'Count'], ...attendanceData.map(d => [d.name, d.value])] },
      { name: 'Station Utilization', rows: [['Station', 'Utilization %'], ...utilizationData.map(d => [d.station, `${d.utilization}%`])] },
      { name: 'Station Details', rows: [['Station', 'Assigned', 'Present', 'Absent', 'Skill Match', 'Utilization', 'Idle Time (hrs)'], ...tableData.map(d => [d.station, d.assigned, d.present, d.absent, d.skillMatch, d.utilization, d.idleTime])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Workforce Dashboard"
        icon={Users}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Operators Assigned" value={kpiData.assigned} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Present" value={kpiData.present} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Absent" value={kpiData.absent} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Skill Match %" value={`${kpiData.skillMatch}%`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Operator Utilization %" value={`${kpiData.utilization}%`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Idle Time (hrs)" value={kpiData.idleTime} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Overtime Hours" value={kpiData.overtime} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Attendance</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === 'Present' ? COLORS[0] : COLORS[1]} />)}
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
