import React from 'react';
import { Workflow } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function ConveyorReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [dbData, setDbData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const [line, setLine] = React.useState('All');
  const [station, setStation] = React.useState('All');

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
  ];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const allTableData = [
    { line: 'Line 1', station: 'ST-05', plannedSpeed: 10, actualSpeed: 8, deviation: '20%', stoppageCount: Math.max(1, Math.round(12 * scale)), totalStoppageTime: Math.round(180 * scale), status: 'Active' },
    { line: 'Line 1', station: 'ST-12', plannedSpeed: 10, actualSpeed: 9, deviation: '10%', stoppageCount: Math.max(1, Math.round(8 * scale)), totalStoppageTime: Math.round(120 * scale), status: 'Active' },
    { line: 'Line 2', station: 'ST-08', plannedSpeed: 10, actualSpeed: 7, deviation: '30%', stoppageCount: Math.max(1, Math.round(20 * scale)), totalStoppageTime: Math.round(100 * scale), status: 'Resolved' },
    { line: 'Line 1', station: 'ST-01', plannedSpeed: 10, actualSpeed: 9.5, deviation: '5%', stoppageCount: Math.max(1, Math.round(4 * scale)), totalStoppageTime: Math.round(80 * scale), status: 'Active' },
    { line: 'Line 2', station: 'ST-15', plannedSpeed: 10, actualSpeed: 8.5, deviation: '15%', stoppageCount: Math.max(1, Math.round(8 * scale)), totalStoppageTime: Math.round(60 * scale), status: 'Resolved' },
  ];

  const tableData = allTableData.filter(d =>
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station)
  );

  const affectedStationsData = tableData.map(d => ({
    station: d.station,
    downtime: d.totalStoppageTime
  }));

  const affectedReasonsData = [
    { reason: 'Part Shortage', count: Math.max(1, Math.round(12 * scale)) },
    { reason: 'Quality Issue', count: Math.max(1, Math.round(8 * scale)) },
    { reason: 'Machine Breakdown', count: Math.max(1, Math.round(6 * scale)) },
    { reason: 'Operator Unavailable', count: Math.max(1, Math.round(4 * scale)) },
    { reason: 'Material Jam', count: Math.max(1, Math.round(3 * scale)) },
  ].filter(d => d.count > 0);

  const totalStoppages = tableData.reduce((acc, d) => acc + d.stoppageCount, 0);
  const avgSpeed = (tableData.reduce((acc, d) => acc + d.actualSpeed, 0) / (tableData.length || 1)).toFixed(1);
  const maxDeviation = '30%';
  const efficiency = '85.4%';

  const tableColumns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Planned Speed (m/min)', accessor: 'plannedSpeed' },
    { header: 'Actual Speed (m/min)', accessor: 'actualSpeed' },
    { header: 'Deviation %', accessor: 'deviation' },
    { header: 'Stoppage Count', accessor: 'stoppageCount' },
    { header: 'Total Stoppage Time (mins)', accessor: 'totalStoppageTime' },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{val}</span>
    )},
  ];

  const exportToExcel = () => {
    exportToXLSX('ConveyorReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Avg Speed', `${avgSpeed} m/min`], ['Max Deviation', maxDeviation], ['Total Stoppages', totalStoppages], ['Efficiency', efficiency]] },
      { name: 'Affected Stations', rows: [['Station', 'Downtime'], ...affectedStationsData.map(d => [d.station, d.downtime])] },
      { name: 'Conveyor Performance', rows: [['Station', 'Planned Speed', 'Actual Speed', 'Deviation %', 'Stoppage Count', 'Stoppage Time', 'Status'], ...tableData.map(d => [d.station, d.plannedSpeed, d.actualSpeed, d.deviation, d.stoppageCount, d.totalStoppageTime, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Conveyor Report"
        icon={Workflow}
        period={period}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Speed (m/min)" value={avgSpeed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Max Speed Deviation" value={maxDeviation} color="text-red-500" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Stoppages" value={totalStoppages} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Conveyor Efficiency %" value={efficiency} color="text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Conveyor Speed Affected Stations</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={affectedStationsData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="station" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="downtime" name="Downtime (mins)" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Speed Affected Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={affectedReasonsData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="reason" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Stoppage Count" fill="#0369a1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Conveyor Performance Details</h3>
          <DataTable columns={tableColumns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
