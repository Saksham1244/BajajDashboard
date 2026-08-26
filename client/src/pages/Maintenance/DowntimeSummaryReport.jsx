import React, { useState } from 'react';
import { Timer } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import { useMemo } from 'react';

export default function DowntimeSummaryReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const colors = ['#0369a1','#f97316'];

  const chartData = useMemo(() => {
    return generateTimeLabels(period, shift).map(label => ({
      time: label,
      downtime: Math.floor(Math.random() * 100) + 10
    }));
  }, [period, shift]);

  const tableData = [
    { date: '2023-10-01', shift: 'Shift 1', machine: 'M-01', downtime: 45, count: 1 },
    { date: '2023-10-02', shift: 'Shift 2', machine: 'M-02', downtime: 120, count: 2 },
    { date: '2023-10-03', shift: 'Shift 1', machine: 'M-03', downtime: 30, count: 1 },
    { date: '2023-10-04', shift: 'Shift 3', machine: 'M-01', downtime: 90, count: 2 },
    { date: '2023-10-05', shift: 'Shift 1', machine: 'M-04', downtime: 60, count: 1 },
  ];

  const columns = [
    { header: 'Date', accessorKey: 'date' },
    { header: 'Shift', accessorKey: 'shift' },
    { header: 'Machine', accessorKey: 'machine' },
    { header: 'Total Downtime (mins)', accessorKey: 'downtime' },
    { header: 'No. of Breakdowns', accessorKey: 'count' },
  ];

  const exportToExcel = () => {
    exportToXLSX('DowntimeSummaryReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Downtime (hrs)', 5.75],
        ['Avg Daily Downtime', '69 mins'],
        ['Total Breakdowns', 7],
        ['Most Affected Machine', 'M-02'],
      ]},
      { name: 'Downtime Summary', rows: [['Date', 'Shift', 'Machine', 'Total Downtime (mins)', 'No. of Breakdowns'], ...tableData.map(d => [d.date, d.shift, d.machine, d.downtime, d.count])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Downtime Summary Report"
        icon={Timer}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02'], value: station, onChange: setStation },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Downtime" autoScale value="5.75 hrs" />
          <StatCard title="Avg Daily Downtime" autoScale value="69 mins" />
          <StatCard title="Total Breakdowns" autoScale value="7" />
          <StatCard title="Most Affected Machine" value="M-02" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Daily Downtime Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="downtime" name="Downtime (mins)" fill={colors[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
