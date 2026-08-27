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

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const allTableData = [
    { machine: 'M-01', line: 'Line 1', type: 'Monthly', scheduled: '2026-08-01', completed: '2026-08-01', status: 'Completed', delay: 0 },
    { machine: 'M-02', line: 'Line 1', type: 'Weekly', scheduled: '2026-08-15', completed: '2026-08-17', status: 'Completed', delay: 2 },
    { machine: 'M-03', line: 'Line 2', type: 'Quarterly', scheduled: '2026-08-20', completed: '-', status: 'Pending', delay: 0 },
    { machine: 'M-04', line: 'Line 2', type: 'Monthly', scheduled: '2026-08-10', completed: '-', status: 'Overdue', delay: 10 },
    { machine: 'M-05', line: 'Line 1', type: 'Weekly', scheduled: '2026-08-18', completed: '2026-08-18', status: 'Completed', delay: 0 },
  ];

  const tableData = allTableData.filter(d => 
    (line === 'All' || d.line === line) &&
    (machine === 'All' || d.machine === machine)
  );

  const completedCount = Math.max(0, Math.round(35 * scale));
  const pendingCount = Math.max(0, Math.round(10 * scale));
  const overdueCount = Math.max(0, Math.round(5 * scale));
  const totalCount = completedCount + pendingCount + overdueCount || 1;

  const columns = [
    { header: 'Machine', accessor: 'machine' },
    { header: 'PM Type', accessor: 'type' },
    { header: 'Scheduled Date', accessor: 'scheduled' },
    { header: 'Completed Date', accessor: 'completed' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => {
        let color = 'bg-green-100 text-green-700';
        if (val === 'Pending') color = 'bg-yellow-100 text-yellow-700';
        if (val === 'Overdue') color = 'bg-red-100 text-red-700';
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
            {val}
          </span>
        );
      }
    },
    { header: 'Delay (days)', accessor: 'delay' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PMReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total PM Orders', totalCount],
        ['Completed', completedCount],
        ['Pending', pendingCount],
        ['Overdue', overdueCount],
      ]},
      { name: 'PM Details', rows: [['Machine', 'PM Type', 'Scheduled', 'Completed', 'Status', 'Delay (days)'], ...tableData.map(d => [d.machine, d.type, d.scheduled, d.completed, d.status, d.delay])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="PM Report"
        icon={ClipboardList}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Machine', options: ['All','M-01','M-02','M-03','M-04','M-05'], value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total PM Orders" value={totalCount} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Completed" value={completedCount} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending" value={pendingCount} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Overdue" value={overdueCount} />
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
