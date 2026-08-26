import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function PMReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [machine, setMachine] = useState('All');
  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`http://localhost:5000/api/maintenance/pm?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const tableData = dbData?.table || [
    { machine: 'M-01', type: 'Monthly', scheduled: '2023-10-01', completed: '2023-10-01', status: 'Completed', delay: 0 },
    { machine: 'M-02', type: 'Weekly', scheduled: '2023-10-15', completed: '2023-10-17', status: 'Completed', delay: 2 },
    { machine: 'M-03', type: 'Quarterly', scheduled: '2023-10-20', completed: '-', status: 'Pending', delay: 0 },
    { machine: 'M-04', type: 'Monthly', scheduled: '2023-10-10', completed: '-', status: 'Overdue', delay: 10 },
    { machine: 'M-05', type: 'Weekly', scheduled: '2023-10-18', completed: '2023-10-18', status: 'Completed', delay: 0 },
  ];

  const kpiData = dbData?.kpis || { total: '50', completed: '35', pending: '10', overdue: '5' };


  const columns = [
    { header: 'Machine', accessorKey: 'machine' },
    { header: 'PM Type', accessorKey: 'type' },
    { header: 'Scheduled Date', accessorKey: 'scheduled' },
    { header: 'Completed Date', accessorKey: 'completed' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
          ${row.original.status === 'Completed' ? 'bg-green-100 text-green-700' : 
            row.original.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'}`}>
          {row.original.status}
        </span>
      )
    },
    { header: 'Delay (days)', accessorKey: 'delay' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PMReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total PM Orders', 50],
        ['Completed', 35],
        ['Pending', 10],
        ['Overdue', 5],
      ]},
      { name: 'PM Details', rows: [['Machine', 'PM Type', 'Scheduled', 'Completed', 'Status', 'Delay (days)'], ...tableData.map(d => [d.machine, d.type, d.scheduled, d.completed, d.status, d.delay])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="PM Report"
        icon={ClipboardList}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Machine', options: ['All','M-01','M-02'], value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard autoScale title="Total PM Orders" value={kpiData.total} />
          <StatCard autoScale title="Completed" value={kpiData.completed} />
          <StatCard autoScale title="Pending" value={kpiData.pending} />
          <StatCard autoScale title="Overdue" value={kpiData.overdue} />
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
