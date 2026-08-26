import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function BreakdownReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');
  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`http://localhost:5000/api/maintenance/breakdown?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const tableData = dbData?.table || [
    { machine: 'M-01', start: '08:00', end: '08:45', duration: 45, reason: 'Jam', tech: 'John D.', status: 'Resolved' },
    { machine: 'M-02', start: '09:15', end: '11:15', duration: 120, reason: 'Motor Failure', tech: 'Sarah K.', status: 'Pending' },
    { machine: 'M-03', start: '10:30', end: '11:00', duration: 30, reason: 'Sensor Error', tech: 'Mike T.', status: 'Resolved' },
    { machine: 'M-01', start: '13:00', end: '13:15', duration: 15, reason: 'Calibration', tech: 'John D.', status: 'Resolved' },
    { machine: 'M-04', start: '14:20', end: '15:20', duration: 60, reason: 'Power Outage', tech: 'Alan B.', status: 'Resolved' },
  ];

  const kpiData = dbData?.kpis || { total: '5', avg: '54 mins', max: '120 mins', downtime: '4.5 hrs' };


  const columns = [
    { header: 'Machine', accessorKey: 'machine' },
    { header: 'Breakdown Start', accessorKey: 'start' },
    { header: 'End Time', accessorKey: 'end' },
    { header: 'Duration (mins)', accessorKey: 'duration' },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Technician', accessorKey: 'tech' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.original.status}
        </span>
      )
    },
  ];

  const exportToExcel = () => {
    exportToXLSX('BreakdownReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Breakdowns', 5],
        ['Avg Duration (mins)', 54],
        ['Max Duration (mins)', 120],
        ['Total Downtime (hrs)', 4.5],
      ]},
      { name: 'Breakdown Details', rows: [['Machine', 'Start', 'End', 'Duration', 'Reason', 'Tech', 'Status'], ...tableData.map(d => [d.machine, d.start, d.end, d.duration, d.reason, d.tech, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Breakdown Report"
        icon={AlertCircle}
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
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Breakdowns" value={kpiData.total} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Avg Duration" value={kpiData.avg} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Max Duration" value={kpiData.max} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Downtime" value={kpiData.downtime} />
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
