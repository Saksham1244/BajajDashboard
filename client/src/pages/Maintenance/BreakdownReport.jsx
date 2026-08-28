import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function BreakdownReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');
  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/maintenance/breakdown?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const allBreakdowns = dbData?.table || [
    { machine: 'Demo Nutrunner Spindle', line: 'Line 1', station: 'Demo (Block Assly)', start: '08:15', end: '08:33', duration: 18, reason: 'Nutrunner Spindle #2 Stall', tech: 'Amit Kumar', status: 'Resolved' },
    { machine: 'Line2 Pallet Indexer', line: 'Line 2', station: 'Line2 (Head Tightening)', start: '09:10', end: '09:35', duration: 25, reason: 'Conveyor Pallet Stop Cylinder Jam', tech: 'Rahul Sharma', status: 'Resolved' },
    { machine: 'Station2 Cold Test Bench', line: 'Line 1', station: 'Station2 (Cold Inspection)', start: '10:40', end: '10:52', duration: 12, reason: 'Vision Camera Communication Timeout', tech: 'Priya Singh', status: 'Resolved' }
  ];

  const tableData = allBreakdowns.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (machine === 'All' || d.machine === machine)
  );

  const totalBreakdowns = dbData?.kpis?.totalBreakdowns || tableData.length;
  const avgMins = dbData?.kpis?.avgMins || 22;
  const maxMins = dbData?.kpis?.maxMins || 45;
  const totalDowntimeHours = dbData?.kpis?.totalDowntimeHours || '2.5';

  const columns = [
    { header: 'Machine', accessor: 'machine' },
    { header: 'Breakdown Start', accessor: 'start' },
    { header: 'End Time', accessor: 'end' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Technician', accessor: 'tech' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val}
        </span>
      )
    },
  ];

  const exportToExcel = () => {
    exportToXLSX('BreakdownReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Breakdowns', totalBreakdowns],
        ['Avg Duration (mins)', avgMins],
        ['Max Duration (mins)', maxMins],
        ['Total Downtime (hrs)', totalDowntimeHours],
      ]},
      { name: 'Breakdown Details', rows: [['Machine', 'Start', 'End', 'Duration', 'Reason', 'Tech', 'Status'], ...tableData.map(d => [d.machine, d.start, d.end, d.duration, d.reason, d.tech, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Breakdown Report"
        icon={AlertCircle}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
          { type: 'dropdown', label: 'Machine', options: filterOptions.stations, value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Breakdowns" value={totalBreakdowns} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Duration" value={`${avgMins} mins`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Max Duration" value={`${maxMins} mins`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Downtime" value={`${totalDowntimeHours} hrs`} />
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
