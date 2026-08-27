import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function MaintenanceDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');

  const colors = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const allTableData = [
    { machine: 'M-01', line: 'Line 1', station: 'ST-01', status: 'Running', lastBreakdown: '2026-08-20', downtimeToday: Math.round(0 * scale), mttr: 45, mtbf: 120, availability: 98 },
    { machine: 'M-02', line: 'Line 1', station: 'ST-02', status: 'Breakdown', lastBreakdown: '2026-08-25', downtimeToday: Math.round(120 * scale), mttr: 60, mtbf: 80, availability: 85 },
    { machine: 'M-03', line: 'Line 2', station: 'ST-01', status: 'Maintenance', lastBreakdown: '2026-08-15', downtimeToday: Math.round(60 * scale), mttr: 30, mtbf: 200, availability: 95 },
    { machine: 'M-04', line: 'Line 2', station: 'ST-02', status: 'Idle', lastBreakdown: '2026-08-22', downtimeToday: Math.round(0 * scale), mttr: 50, mtbf: 150, availability: 92 },
    { machine: 'M-05', line: 'Line 1', station: 'ST-01', status: 'Running', lastBreakdown: '2026-08-26', downtimeToday: Math.round(0 * scale), mttr: 40, mtbf: 180, availability: 99 },
  ];

  const tableData = allTableData.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (machine === 'All' || d.machine === machine)
  );

  const runningCount = tableData.filter(d => d.status === 'Running').length || 1;
  const breakdownCount = tableData.filter(d => d.status === 'Breakdown').length;
  const maintenanceCount = tableData.filter(d => d.status === 'Maintenance').length;
  const idleCount = tableData.filter(d => d.status === 'Idle').length;

  const machineStatusData = [
    { name: 'Running', value: runningCount },
    { name: 'Breakdown', value: breakdownCount },
    { name: 'Maintenance', value: maintenanceCount },
    { name: 'Idle', value: idleCount },
  ].filter(d => d.value > 0);

  const totalDowntime = Math.round(450 * scale);
  const totalBreakdowns = Math.max(1, Math.round(12 * scale));
  const avgMTTR = 45;
  const avgMTBF = 146;
  const machineAvailability = "94.5%";

  const breakdownReasons = [
    { reason: 'Motor Failure', duration: Math.round(120 * scale), count: Math.max(1, Math.round(5 * scale)) },
    { reason: 'Sensor Error', duration: Math.round(90 * scale), count: Math.max(1, Math.round(8 * scale)) },
    { reason: 'Belt Snapped', duration: Math.round(75 * scale), count: Math.max(1, Math.round(3 * scale)) },
    { reason: 'Power Outage', duration: Math.round(60 * scale), count: Math.max(1, Math.round(2 * scale)) },
    { reason: 'Jam', duration: Math.round(45 * scale), count: Math.max(1, Math.round(12 * scale)) },
    { reason: 'Overheat', duration: Math.round(30 * scale), count: Math.max(1, Math.round(4 * scale)) },
    { reason: 'Calibration', duration: Math.round(20 * scale), count: Math.max(1, Math.round(6 * scale)) },
  ].filter(d => d.duration > 0 || d.count > 0);

  const columns = [
    { header: 'Machine', accessor: 'machine' },
    { header: 'Status', accessor: 'status', render: (val) => {
      let color = 'text-green-600 bg-green-100';
      if (val === 'Breakdown') color = 'text-red-600 bg-red-100';
      if (val === 'Maintenance') color = 'text-yellow-600 bg-yellow-100';
      if (val === 'Idle') color = 'text-gray-600 bg-gray-100';
      return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
    }},
    { header: 'Last Breakdown', accessor: 'lastBreakdown' },
    { header: 'Downtime Today (mins)', accessor: 'downtimeToday' },
    { header: 'MTTR (mins)', accessor: 'mttr' },
    { header: 'MTBF (hrs)', accessor: 'mtbf' },
    { header: 'Availability %', accessor: 'availability', render: (val) => `${val}%` },
  ];

  const exportToExcel = () => {
    exportToXLSX('MaintenanceDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Running', runningCount],
        ['Breakdown', breakdownCount],
        ['Maintenance', maintenanceCount],
        ['Idle', idleCount],
        ['Total Downtime (mins)', totalDowntime],
        ['Breakdown Count', totalBreakdowns],
        ['MTTR (mins)', avgMTTR],
        ['MTBF (hrs)', avgMTBF],
        ['Machine Availability', machineAvailability],
      ]},
      { name: 'Machine Status', rows: [['Status', 'Count'], ...machineStatusData.map(d => [d.name, d.value])] },
      { name: 'Breakdown Reasons', rows: [['Reason', 'Duration (mins)', 'Count'], ...breakdownReasons.map(d => [d.reason, d.duration, d.count])] },
      { name: 'Machines', rows: [['Machine', 'Status', 'Last Breakdown', 'Downtime', 'MTTR', 'MTBF', 'Availability'], ...tableData.map(d => [d.machine, d.status, d.lastBreakdown, d.downtimeToday, d.mttr, d.mtbf, `${d.availability}%`])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Maintenance Dashboard"
        icon={Wrench}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Machine', options: ['All','M-01','M-02','M-03','M-04','M-05'], value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Machine Status" value={`${runningCount} / ${breakdownCount} / ${maintenanceCount} / ${idleCount}`} subtitle="Run/Brk/Mnt/Idle" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Downtime" value={`${totalDowntime} mins`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Breakdown Count" value={totalBreakdowns} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTTR" value={`${avgMTTR} mins`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTBF" value={`${avgMTBF} hrs`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Machine Availability" value={machineAvailability} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Machine Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={machineStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {machineStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 7 Breakdown Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={breakdownReasons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" tick={{fontSize: 10}} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="duration" name="Duration (mins)" fill={colors[0]} />
                  <Line yAxisId="right" type="monotone" dataKey="count" name="Occurrence Count" stroke={colors[1]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
