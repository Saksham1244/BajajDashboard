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

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const chartData = useMemo(() => {
    return generateTimeLabels(period, shift).map(label => ({
      time: label,
      downtime: Math.floor(Math.random() * 80 * scale) + Math.round(15 * scale)
    }));
  }, [period, shift, scale]);

  const allTableData = [
    { date: '2026-08-25', line: 'Line 1', station: 'ST-01', shift: 'Shift 1', machine: 'M-01', downtime: Math.round(45 * scale) || 10, count: 1 },
    { date: '2026-08-25', line: 'Line 1', station: 'ST-02', shift: 'Shift 2', machine: 'M-02', downtime: Math.round(120 * scale) || 25, count: 2 },
    { date: '2026-08-26', line: 'Line 2', station: 'ST-01', shift: 'Shift 1', machine: 'M-03', downtime: Math.round(30 * scale) || 15, count: 1 },
    { date: '2026-08-26', line: 'Line 2', station: 'ST-02', shift: 'Shift 2', machine: 'M-01', downtime: Math.round(90 * scale) || 20, count: 2 },
    { date: '2026-08-27', line: 'Line 1', station: 'ST-01', shift: 'Shift 1', machine: 'M-04', downtime: Math.round(60 * scale) || 10, count: 1 },
  ];

  const tableData = allTableData.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station)
  );

  const totalDowntimeMins = tableData.reduce((acc, d) => acc + d.downtime, 0);
  const totalDowntimeHrs = (totalDowntimeMins / 60).toFixed(1);
  const avgDowntimeMins = Math.round(totalDowntimeMins / (tableData.length || 1));
  const totalBreakdowns = tableData.reduce((acc, d) => acc + d.count, 0);
  const mostAffected = tableData.length > 0 ? tableData[0].machine : 'M-01';

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Machine', accessor: 'machine' },
    { header: 'Total Downtime (mins)', accessor: 'downtime' },
    { header: 'No. of Breakdowns', accessor: 'count' },
  ];

  const exportToExcel = () => {
    exportToXLSX('DowntimeSummaryReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Downtime (hrs)', totalDowntimeHrs],
        ['Avg Daily Downtime (mins)', avgDowntimeMins],
        ['Total Breakdowns', totalBreakdowns],
        ['Most Affected Machine', mostAffected],
      ]},
      { name: 'Downtime Summary', rows: [['Date', 'Shift', 'Machine', 'Total Downtime (mins)', 'No. of Breakdowns'], ...tableData.map(d => [d.date, d.shift, d.machine, d.downtime, d.count])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Downtime Summary Report"
        icon={Timer}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02'], value: station, onChange: setStation },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Downtime" value={`${totalDowntimeHrs} hrs`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Daily Downtime" value={`${avgDowntimeMins} mins`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Breakdowns" value={totalBreakdowns} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Most Affected Machine" value={mostAffected} />
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
