import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function MTTRMTBFReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/maintenance/mttr-mtbf?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}&machine=${encodeURIComponent(machine)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, station, machine]);

  const colors = ['#0284c7','#10b981'];

  const rawTable = dbData?.table || [];

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station) &&
    (machine === 'All' || d.machine === machine)
  );

  const chartData = tableData.map(d => ({
    machine: d.machine,
    mttr: Number(d.mttr) || 0,
    mtbf: Number(d.mtbf) || 0
  }));

  const avgMTTR = tableData.length > 0 ? Math.round(tableData.reduce((sum, d) => sum + Number(d.mttr), 0) / tableData.length) : 0;
  const avgMTBF = tableData.length > 0 ? Math.round(tableData.reduce((sum, d) => sum + Number(d.mtbf), 0) / tableData.length) : 0;
  const bestMachine = tableData.length > 0 ? tableData.reduce((prev, curr) => (Number(curr.mtbf) > Number(prev.mtbf) ? curr : prev)).machine : 'N/A';
  const worstMachine = tableData.length > 0 ? tableData.reduce((prev, curr) => (Number(curr.mttr) > Number(prev.mttr) ? curr : prev)).machine : 'N/A';

  const columns = [
    { header: 'Machine', accessor: 'machine' },
    { header: 'MTTR (mins)', accessor: 'mttr', render: (val) => {
      const num = Number(val);
      const color = num <= 20 ? 'bg-emerald-100 text-emerald-700' : num <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
      return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>{num} mins {num > 30 ? '(High)' : '(Good)'}</span>;
    }},
    { header: 'MTBF (hrs)', accessor: 'mtbf', render: (val) => {
      const num = Number(val);
      const color = num >= 60 ? 'bg-emerald-100 text-emerald-700' : num >= 30 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
      return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>{num} hrs {num >= 60 ? '(Healthy)' : '(Frequent)'}</span>;
    }},
    { header: 'Availability %', accessor: 'availability', render: (val) => {
      const num = Number(val);
      const color = num >= 95 ? 'text-emerald-600 font-bold' : num >= 90 ? 'text-amber-600 font-semibold' : 'text-rose-600 font-bold';
      return <span className={color}>{num}%</span>;
    }},
    { header: 'Breakdown Count', accessor: 'count' },
    { header: 'Total Repair Time', accessor: 'totalTime', render: (val) => `${val} mins` },
  ];

  const machineOptions = ['All', ...Array.from(new Set(rawTable.map(d => d.machine).filter(Boolean)))];

  const exportToExcel = () => {
    exportToXLSX('MTTRMTBFReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Avg MTTR (Lower is Better)', `${avgMTTR} mins`],
        ['Avg MTBF (Higher is Better)', `${avgMTBF} hrs`],
        ['Best Machine (Highest MTBF)', bestMachine],
        ['Worst Machine (Highest MTTR)', worstMachine],
      ]},
      { name: 'MTTR MTBF Details', rows: [['Machine', 'MTTR (mins)', 'MTBF (hrs)', 'Availability %', 'Breakdown Count', 'Total Repair Time (mins)'], ...tableData.map(d => [d.machine, d.mttr, d.mtbf, `${d.availability}%`, d.count, d.totalTime])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="MTTR & MTBF Report"
        icon={Activity}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTTR (Repair Time)" value={`${avgMTTR} mins`} color="blue" sub="Lower is better" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTBF (Uptime Interval)" value={`${avgMTBF} hrs`} color="green" sub="Higher is better" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Best Reliability" value={bestMachine} color="green" sub="Highest MTBF" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Slowest Repair" value={worstMachine} color="red" sub="Highest MTTR" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">MTTR vs MTBF by Machine</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="machine" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke={colors[0]} label={{ value: 'MTTR (mins)', angle: -90, position: 'insideLeft', style: { fill: colors[0], fontSize: 11 } }} />
                <YAxis yAxisId="right" orientation="right" stroke={colors[1]} label={{ value: 'MTBF (hrs)', angle: 90, position: 'insideRight', style: { fill: colors[1], fontSize: 11 } }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="mttr" name="MTTR (mins) [Lower is Better]" fill={colors[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="mtbf" name="MTBF (hrs) [Higher is Better]" fill={colors[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
