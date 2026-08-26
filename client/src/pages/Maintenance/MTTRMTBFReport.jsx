import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MTTRMTBFReport() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const colors = ['#0369a1','#f97316'];

  const chartData = [
    { machine: 'M-01', mttr: 45, mtbf: 120 },
    { machine: 'M-02', mttr: 60, mtbf: 80 },
    { machine: 'M-03', mttr: 30, mtbf: 200 },
    { machine: 'M-04', mttr: 50, mtbf: 150 },
  ];

  const tableData = [
    { machine: 'M-01', mttr: 45, mtbf: 120, availability: 98, count: 2, totalTime: 90 },
    { machine: 'M-02', mttr: 60, mtbf: 80, availability: 85, count: 5, totalTime: 300 },
    { machine: 'M-03', mttr: 30, mtbf: 200, availability: 95, count: 1, totalTime: 30 },
    { machine: 'M-04', mttr: 50, mtbf: 150, availability: 92, count: 3, totalTime: 150 },
    { machine: 'M-05', mttr: 40, mtbf: 180, availability: 99, count: 0, totalTime: 0 },
  ];

  const columns = [
    { header: 'Machine', accessorKey: 'machine' },
    { header: 'MTTR (mins)', accessorKey: 'mttr' },
    { header: 'MTBF (hrs)', accessorKey: 'mtbf' },
    { header: 'Availability %', accessorKey: 'availability' },
    { header: 'Breakdown Count', accessorKey: 'count' },
    { header: 'Total Repair Time', accessorKey: 'totalTime' },
  ];

  const exportToExcel = () => {
    exportToXLSX('MTTRMTBFReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Avg MTTR', '45 mins'],
        ['Avg MTBF', '146 hrs'],
        ['Best Machine Availability', 'M-05 (99%)'],
        ['Worst Machine', 'M-02 (85%)'],
      ]},
      { name: 'MTTR MTBF Details', rows: [['Machine', 'MTTR (mins)', 'MTBF (hrs)', 'Availability %', 'Breakdown Count', 'Total Repair Time'], ...tableData.map(d => [d.machine, d.mttr, d.mtbf, d.availability, d.count, d.totalTime])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="MTTR & MTBF Report"
        icon={Activity}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Machine', options: ['All','M-01','M-02'], value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Avg MTTR" value="45 mins" />
          <StatCard title="Avg MTBF" value="146 hrs" />
          <StatCard title="Best Machine Availability" value="M-05 (99%)" />
          <StatCard title="Worst Machine" value="M-02 (85%)" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">MTTR vs MTBF by Machine</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="machine" />
                <YAxis yAxisId="left" orientation="left" stroke={colors[0]} />
                <YAxis yAxisId="right" orientation="right" stroke={colors[1]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="mttr" name="MTTR (mins)" fill={colors[0]} />
                <Bar yAxisId="right" dataKey="mtbf" name="MTBF (hrs)" fill={colors[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
