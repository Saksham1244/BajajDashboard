import React, { useState } from 'react';
import { Timer } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import { useMemo } from 'react';

export default function DowntimeSummaryReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/maintenance/downtime?period=${period}&shift=${shift}&line=${line}&station=${station}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station]);

  const colors = ['#0369a1','#f97316'];

  const chartData = dbData?.trend || [];
  const tableData = dbData?.table || [];

  const totalDowntimeHrs = dbData?.kpis?.totalDowntimeHrs || '0.0';
  const avgDowntimeMins = dbData?.kpis?.avgDowntimeMins || 0;
  const totalBreakdowns = dbData?.kpis?.totalBreakdowns || tableData.length;
  const mostAffected = dbData?.kpis?.mostAffected || (tableData.length > 0 ? tableData[0].machine : 'None');

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
