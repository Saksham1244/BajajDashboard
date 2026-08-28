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

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const allBreakdowns = [
    { machine: 'M-01', line: 'Line 1', station: 'ST-01', start: '08:00', end: '08:45', duration: 45, reason: 'Jam', tech: 'John D.', status: 'Resolved' },
    { machine: 'M-02', line: 'Line 1', station: 'ST-02', start: '09:15', end: '11:15', duration: 120, reason: 'Motor Failure', tech: 'Sarah K.', status: 'Pending' },
    { machine: 'M-03', line: 'Line 2', station: 'ST-01', start: '10:30', end: '11:00', duration: 30, reason: 'Sensor Error', tech: 'Mike T.', status: 'Resolved' },
    { machine: 'M-01', line: 'Line 1', station: 'ST-01', start: '13:00', end: '13:15', duration: 15, reason: 'Calibration', tech: 'John D.', status: 'Resolved' },
    { machine: 'M-04', line: 'Line 2', station: 'ST-02', start: '14:20', end: '15:20', duration: 60, reason: 'Power Outage', tech: 'Alan B.', status: 'Resolved' },
  ];

  const tableData = allBreakdowns.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (machine === 'All' || d.machine === machine)
  );

  const totalBreakdowns = Math.max(1, Math.round(tableData.length * (period === 'Month' ? 6 : period === 'Week' ? 2 : 1)));
  const totalMins = tableData.reduce((acc, d) => acc + d.duration, 0) || 120;
  const avgMins = Math.round(totalMins / (tableData.length || 1));
  const maxMins = Math.max(...tableData.map(d => d.duration), 60);
  const totalDowntimeHours = (totalMins / 60).toFixed(1);

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
