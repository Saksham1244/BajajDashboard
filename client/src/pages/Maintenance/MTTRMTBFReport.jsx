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
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/maintenance/mttr-mtbf?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}&machine=${encodeURIComponent(machine)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station, machine]);

  const colors = ['#0369a1','#f97316'];

  const defaultTable = [
    { machine: 'Demo Nutrunner Spindle', line: 'Line 1', station: 'Demo', mttr: 18, mtbf: 45, availability: 97.2, count: 2, totalTime: 36 },
    { machine: 'Line2 Pallet Indexer', line: 'Line 2', station: 'Line2', mttr: 25, mtbf: 38, availability: 94.8, count: 3, totalTime: 75 },
    { machine: 'Station2 Cold Test Bench', line: 'Line 1', station: 'Station2', mttr: 12, mtbf: 60, availability: 99.1, count: 1, totalTime: 12 }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTable;

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
  const bestMachine = tableData.length > 0 ? tableData.reduce((prev, curr) => Number(prev.availability) > Number(curr.availability) ? prev : curr).machine : 'N/A';
  const worstMachine = tableData.length > 0 ? tableData.reduce((prev, curr) => Number(prev.availability) < Number(curr.availability) ? prev : curr).machine : 'N/A';

  const columns = [
    { header: 'Machine', accessor: 'machine' },
    { header: 'MTTR (mins)', accessor: 'mttr' },
    { header: 'MTBF (hrs)', accessor: 'mtbf' },
    { header: 'Availability %', accessor: 'availability', render: (val) => `${val}%` },
    { header: 'Breakdown Count', accessor: 'count' },
    { header: 'Total Repair Time', accessor: 'totalTime' },
  ];

  const machineOptions = ['All', ...Array.from(new Set(rawTable.map(d => d.machine).filter(Boolean)))];

  const exportToExcel = () => {
    exportToXLSX('MTTRMTBFReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Avg MTTR', `${avgMTTR} mins`],
        ['Avg MTBF', `${avgMTBF} hrs`],
        ['Best Machine Availability', bestMachine],
        ['Worst Machine', worstMachine],
      ]},
      { name: 'MTTR MTBF Details', rows: [['Machine', 'MTTR (mins)', 'MTBF (hrs)', 'Availability %', 'Breakdown Count', 'Total Repair Time'], ...tableData.map(d => [d.machine, d.mttr, d.mtbf, `${d.availability}%`, d.count, d.totalTime])] }
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
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTTR" value={`${avgMTTR} mins`} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg MTBF" value={`${avgMTBF} hrs`} color="orange" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Best Machine" value={bestMachine} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Worst Machine" value={worstMachine} color="red" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">MTTR vs MTBF by Machine</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="machine" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke={colors[0]} label={{ value: 'MTTR (mins)', angle: -90, position: 'insideLeft', style: { fill: colors[0], fontSize: 11 } }} />
                <YAxis yAxisId="right" orientation="right" stroke={colors[1]} label={{ value: 'MTBF (hrs)', angle: 90, position: 'insideRight', style: { fill: colors[1], fontSize: 11 } }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="mttr" name="MTTR (mins)" fill={colors[0]} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="mtbf" name="MTBF (hrs)" fill={colors[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
