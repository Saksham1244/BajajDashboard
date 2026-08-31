import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';

export default function PMDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [machine, setMachine] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/maintenance/pm-dashboard?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&machine=${encodeURIComponent(machine)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, machine]);

  const colors = ['#10b981', '#f59e0b', '#ef4444', '#0369a1', '#8b5cf6'];

  const defaultTasks = [
    { id: 'PM-101', machine: 'Demo Nutrunner Spindle', line: 'Line 1', station: 'Demo (Block Assly)', task: 'Spindle Lubrication & Calibration', frequency: 'Weekly', scheduledDate: '2026-08-31', completedDate: '2026-08-31', status: 'Completed', technician: 'Amit Kumar' },
    { id: 'PM-102', machine: 'Line2 Pallet Indexer', line: 'Line 2', station: 'Line2 (Head Tightening)', task: 'Pneumatic Cylinder Seal Check', frequency: 'Monthly', scheduledDate: '2026-08-31', completedDate: '-', status: 'Pending', technician: 'Rahul Sharma' },
    { id: 'PM-103', machine: 'Station2 Cold Test Bench', line: 'Line 1', station: 'Station2 (Cold Inspection)', task: 'Sensor Alignment & Wiring Inspection', frequency: 'Daily', scheduledDate: '2026-08-31', completedDate: '2026-08-31', status: 'Completed', technician: 'Priya Singh' },
    { id: 'PM-104', machine: 'Conveyor Drive Unit 1', line: 'Line 1', station: 'Demo (Block Assly)', task: 'Motor Belt Tension Adjustment', frequency: 'Bi-Weekly', scheduledDate: '2026-08-30', completedDate: '-', status: 'Overdue', technician: 'Amit Kumar' },
    { id: 'PM-105', machine: 'Robotic Tightening Cell', line: 'Line 2', station: 'Line2 (Head Tightening)', task: 'End-Effector Torque Verification', frequency: 'Weekly', scheduledDate: '2026-08-31', completedDate: '2026-08-31', status: 'Completed', technician: 'Vikram Patel' },
    { id: 'PM-106', machine: 'Demo Nutrunner Spindle', line: 'Line 1', station: 'Demo (Block Assly)', task: 'Electrical Contact Cleaning', frequency: 'Monthly', scheduledDate: '2026-08-31', completedDate: '2026-08-31', status: 'Completed', technician: 'Amit Kumar' }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTasks;

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    (machine === 'All' || d.machine === machine)
  );

  const totalTasks = tableData.length;
  const completedTasks = tableData.filter(d => d.status === 'Completed').length;
  const pendingTasks = tableData.filter(d => d.status === 'Pending').length;
  const overdueTasks = tableData.filter(d => d.status === 'Overdue').length;
  const compliance = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 100.0;

  const statusData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
    { name: 'Overdue', value: overdueTasks },
  ].filter(d => d.value > 0);

  // Group by machine for chart
  const machineTaskMap = {};
  tableData.forEach(d => {
    if (!machineTaskMap[d.machine]) {
      machineTaskMap[d.machine] = { machine: d.machine, completed: 0, pending: 0, overdue: 0 };
    }
    if (d.status === 'Completed') machineTaskMap[d.machine].completed++;
    else if (d.status === 'Pending') machineTaskMap[d.machine].pending++;
    else if (d.status === 'Overdue') machineTaskMap[d.machine].overdue++;
  });
  const machineChartData = Object.values(machineTaskMap);

  const machineOptions = ['All', ...Array.from(new Set(rawTable.map(d => d.machine).filter(Boolean)))];

  const columns = [
    { header: 'PM ID', accessor: 'id' },
    { header: 'Machine', accessor: 'machine' },
    { header: 'Line', accessor: 'line' },
    { header: 'Task Description', accessor: 'task' },
    { header: 'Frequency', accessor: 'frequency' },
    { header: 'Scheduled Date', accessor: 'scheduledDate' },
    { header: 'Completed Date', accessor: 'completedDate' },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (val) => {
        let color = 'text-green-700 bg-green-100';
        if (val === 'Pending') color = 'text-amber-700 bg-amber-100';
        if (val === 'Overdue') color = 'text-red-700 bg-red-100';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
      }
    },
    { header: 'Technician', accessor: 'technician' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PMDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total PM Tasks', totalTasks],
        ['Completed Tasks', completedTasks],
        ['Pending Tasks', pendingTasks],
        ['Overdue Tasks', overdueTasks],
        ['Compliance %', `${compliance}%`],
      ]},
      { name: 'PM Status', rows: [['Status', 'Count'], ...statusData.map(d => [d.name, d.value])] },
      { name: 'PM Tasks', rows: [['PM ID', 'Machine', 'Line', 'Task', 'Frequency', 'Scheduled Date', 'Completed Date', 'Status', 'Technician'], ...tableData.map(d => [d.id, d.machine, d.line, d.task, d.frequency, d.scheduledDate, d.completedDate, d.status, d.technician])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Preventive Maintenance (PM) Dashboard"
        icon={CalendarCheck}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Machine', options: machineOptions, value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total PM Tasks" value={totalTasks} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Completed PM" value={completedTasks} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending PM" value={pendingTasks} color="amber" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Overdue PM" value={overdueTasks} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Compliance %" value={`${compliance}%`} color={compliance >= 90 ? "green" : "amber"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">PM Task Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">PM Tasks by Machine</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={machineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="machine" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                  <Bar dataKey="overdue" name="Overdue" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
