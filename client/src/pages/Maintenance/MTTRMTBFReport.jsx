import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function MTTRMTBFReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');

  const colors = ['#0369a1','#f97316'];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;
  const v = (base) => Math.max(1, Math.round(base * (1 + scale * 0.1))); // Add slight variance so graphs wiggle

  const chartData = [
    { machine: 'M-01', mttr: v(45), mtbf: v(120) },
    { machine: 'M-02', mttr: v(60), mtbf: v(80) },
    { machine: 'M-03', mttr: v(30), mtbf: v(200) },
    { machine: 'M-04', mttr: v(50), mtbf: v(150) },
  ];

  const tableData = [
    { machine: 'M-01', mttr: v(45), mtbf: v(120), availability: 98, count: Math.round(20 * scale), totalTime: Math.round(900 * scale) },
    { machine: 'M-02', mttr: v(60), mtbf: v(80), availability: 85, count: Math.round(50 * scale), totalTime: Math.round(3000 * scale) },
    { machine: 'M-03', mttr: v(30), mtbf: v(200), availability: 95, count: Math.round(10 * scale), totalTime: Math.round(300 * scale) },
    { machine: 'M-04', mttr: v(50), mtbf: v(150), availability: 92, count: Math.round(30 * scale), totalTime: Math.round(1500 * scale) },
    { machine: 'M-05', mttr: v(40), mtbf: v(180), availability: 99, count: 0, totalTime: 0 },
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
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Machine', options: ['All','M-01','M-02'], value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTTR" value={Math.round((chartData.reduce((sum, d) => sum + d.mttr, 0)) / chartData.length) + " mins"} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTBF" value={Math.round((chartData.reduce((sum, d) => sum + d.mtbf, 0)) / chartData.length) + " hrs"} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Best Machine Availability" value="M-05 (99%)" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Worst Machine" value="M-02 (85%)" />
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
