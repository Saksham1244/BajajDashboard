import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';

export default function MaintenanceDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/maintenance/dashboard?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}&machine=${encodeURIComponent(machine)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station, machine]);

  const colors = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

  const defaultMachines = [
    { id: 1, machine: 'Demo Nutrunner Spindle', line: 'Line 1', station: 'Demo (Block Assly)', status: 'Running', lastBreakdown: '08:15', downtimeToday: 18, mttr: 18, mtbf: 45, availability: 97.2 },
    { id: 2, machine: 'Line2 Pallet Indexer', line: 'Line 2', station: 'Line2 (Head Tightening)', status: 'Breakdown', lastBreakdown: '09:10', downtimeToday: 25, mttr: 25, mtbf: 38, availability: 94.8 },
    { id: 3, machine: 'Station2 Cold Test Bench', line: 'Line 1', station: 'Station2 (Cold Inspection)', status: 'Running', lastBreakdown: '10:00', downtimeToday: 0, mttr: 0, mtbf: 60, availability: 99.5 }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultMachines;

  const tableData = rawTable.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (machine === 'All' || d.machine === machine)
  );

  const runningCount = tableData.filter(d => d.status === 'Running').length;
  const breakdownCount = tableData.filter(d => d.status === 'Breakdown').length;
  const maintenanceCount = tableData.filter(d => d.status === 'Maintenance').length;
  const idleCount = tableData.filter(d => d.status === 'Idle').length;

  const machineStatusData = [
    { name: 'Running', value: runningCount },
    { name: 'Breakdown', value: breakdownCount },
    { name: 'Maintenance', value: maintenanceCount },
    { name: 'Idle', value: idleCount },
  ].filter(d => d.value > 0);

  const totalDowntime = tableData.reduce((acc, d) => acc + (Number(d.downtimeToday) || 0), 0);
  const totalBreakdowns = breakdownCount;
  const avgMTTR = tableData.length > 0 ? Math.round(tableData.reduce((acc, d) => acc + (Number(d.mttr) || 0), 0) / tableData.length) : 0;
  const avgMTBF = tableData.length > 0 ? Math.round(tableData.reduce((acc, d) => acc + (Number(d.mtbf) || 0), 0) / tableData.length) : 0;
  const avgAvailability = tableData.length > 0 ? (tableData.reduce((acc, d) => acc + (Number(d.availability) || 0), 0) / tableData.length).toFixed(1) : '100.0';
  const machineAvailability = `${avgAvailability}%`;

  const breakdownReasons = dbData?.breakdownReasons || [
    { reason: 'Preventive Maintenance', duration: 45, count: 3 },
    { reason: 'Conveyor Jam', duration: 35, count: 2 },
    { reason: 'Tool Wear', duration: 25, count: 2 },
    { reason: 'Sensor Drift', duration: 18, count: 1 }
  ];

  const machineOptions = ['All', ...Array.from(new Set(rawTable.map(d => d.machine).filter(Boolean)))];

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
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
          { type: 'dropdown', label: 'Machine', options: machineOptions, value: machine, onChange: setMachine },
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
