import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Timer } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function DowntimeSummaryReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/maintenance/downtime?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, station]);

  const colors = ['#0369a1','#f97316'];

  const rawTable = dbData?.table || [];

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station)
  );

  const totalDowntimeMins = tableData.reduce((acc, d) => acc + (Number(d.downtime) || 0), 0);
  const totalDowntimeHrs = tableData.length > 0 ? (totalDowntimeMins / 60).toFixed(1) : '0.0';
  const avgDowntimeMins = tableData.length > 0 ? Math.round(totalDowntimeMins / tableData.length) : 0;
  const totalBreakdowns = tableData.reduce((acc, d) => acc + (Number(d.count) || 0), 0);
  const mostAffected = tableData.length > 0 ? tableData.reduce((prev, curr) => (Number(curr.downtime) > Number(prev.downtime) ? curr : prev)).machine : 'N/A';

  const chartData = (dbData?.trend && dbData.trend.length > 0)
    ? dbData.trend
    : (tableData.length > 0
        ? tableData.map(d => ({ time: d.start || d.date || d.shift, downtime: Number(d.downtime) || 0 }))
        : generateTimeLabels(period, shift).map(time => ({ time, downtime: 0 }))
      );

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
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
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
