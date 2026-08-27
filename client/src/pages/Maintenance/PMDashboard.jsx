import React, { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function PMDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [machine, setMachine] = useState('All');

  const colors = ['#0369a1','#10b981','#f97316','#f43f5e'];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;
  const kpi = {
    scheduled: Math.round(100 * scale),
    completed: Math.round(65 * scale),
    pending: Math.round(20 * scale),
    overdue: Math.round(15 * scale),
    compliance: "85%"
  };

  const pmStatusData = [
    { name: 'Completed', value: kpi.completed },
    { name: 'Pending', value: kpi.pending },
    { name: 'Overdue', value: kpi.overdue },
  ];

  const complianceData = [
    { line: 'Line 1', compliance: 85 },
    { line: 'Line 2', compliance: 92 },
    { line: 'Sub-Assy', compliance: 78 },
  ];

  const tableData = [
    { machine: 'M-01', nextDate: '2023-10-25', type: 'Monthly', lastDate: '2023-09-25', days: 5, status: 'Scheduled' },
    { machine: 'M-02', nextDate: '2023-10-18', type: 'Weekly', lastDate: '2023-10-11', days: -2, status: 'Overdue' },
    { machine: 'M-03', nextDate: '2023-11-01', type: 'Quarterly', lastDate: '2023-08-01', days: 12, status: 'Scheduled' },
    { machine: 'M-04', nextDate: '2023-10-22', type: 'Weekly', lastDate: '2023-10-15', days: 2, status: 'Scheduled' },
    { machine: 'M-05', nextDate: '2023-10-19', type: 'Monthly', lastDate: '2023-09-19', days: -1, status: 'Overdue' },
  ];

  const columns = [
    { header: 'Machine', accessorKey: 'machine' },
    { header: 'Next PM Date', accessorKey: 'nextDate' },
    { header: 'PM Type', accessorKey: 'type' },
    { header: 'Last PM Date', accessorKey: 'lastDate' },
    { header: 'Days Remaining', accessorKey: 'days' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
          {row.original.status}
        </span>
      )
    },
  ];

  const exportToExcel = () => {
    exportToXLSX('PMDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Scheduled PM', kpi.scheduled],
        ['Completed PM', kpi.completed],
        ['Pending PM', kpi.pending],
        ['Overdue PM', kpi.overdue],
      ]},
      { name: 'PM Schedule', rows: [['Machine', 'Next PM Date', 'PM Type', 'Last PM Date', 'Days Remaining', 'Status'], ...tableData.map(d => [d.machine, d.nextDate, d.type, d.lastDate, d.days, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Preventive Maintenance Dashboard"
        icon={CalendarCheck}
        onExcelClick={exportToExcel}
        period={period}
        filters={[
          { type: 'period', value: period },
          { type: 'daterange' },
          { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2', 'Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Machine', options: ['All', 'M-01', 'M-02', 'M-03'], value: machine, onChange: setMachine },
        ]}
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Scheduled PM"  value={kpi.scheduled} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Completed PM"  value={kpi.completed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending PM"  value={kpi.pending} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Overdue PM"  value={kpi.overdue} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Compliance %"  value={kpi.compliance} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">PM Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pmStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {pmStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index+1]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">PM Compliance by Line (%)</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="line" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliance" name="Compliance %" fill={colors[0]} />
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
