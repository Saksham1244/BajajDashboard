import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';

export default function PMReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [machine, setMachine] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/maintenance/pm-report?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&machine=${encodeURIComponent(machine)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, machine]);

  const rawTable = dbData?.table || [];

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    (machine === 'All' || d.machine === machine)
  );

  const totalPlanned = tableData.length;
  const totalCompleted = tableData.filter(d => d.status === 'Completed').length;
  const compliance = totalPlanned > 0 ? Number(((totalCompleted / totalPlanned) * 100).toFixed(1)) : 0;
  const totalDuration = tableData.reduce((acc, d) => acc + (Number(d.duration) || 0), 0);
  const avgDuration = totalCompleted > 0 ? Math.round(totalDuration / totalCompleted) : 0;

  const machineOptions = ['All', ...Array.from(new Set(rawTable.map(d => d.machine).filter(Boolean)))];

  const columns = [
    { header: 'Report ID', accessor: 'id' },
    { header: 'PM Code', accessor: 'pmId' },
    { header: 'Machine', accessor: 'machine' },
    { header: 'Line', accessor: 'line' },
    { header: 'Task', accessor: 'task' },
    { header: 'Date', accessor: 'date' },
    { header: 'Shift', accessor: 'shift' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => {
        let color = 'text-green-700 bg-green-100';
        if (val === 'Pending') color = 'text-amber-700 bg-amber-100';
        if (val === 'Overdue') color = 'text-red-700 bg-red-100';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
      }
    },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Technician', accessor: 'technician' },
    { 
      header: 'Result', 
      accessor: 'result',
      render: (val) => {
        let color = val === 'Pass' ? 'text-green-700 font-bold' : val === 'Overdue' ? 'text-red-600 font-bold' : 'text-amber-600 font-bold';
        return <span className={color}>{val}</span>;
      }
    },
    { header: 'Notes / Remarks', accessor: 'notes' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PMReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Planned PM', totalPlanned],
        ['Total Completed PM', totalCompleted],
        ['Compliance %', `${compliance}%`],
        ['Avg Duration (mins)', avgDuration],
      ]},
      { name: 'PM Inspection Records', rows: [['Report ID', 'PM Code', 'Machine', 'Line', 'Task', 'Date', 'Shift', 'Status', 'Duration (mins)', 'Technician', 'Result', 'Notes'], ...tableData.map(d => [d.id, d.pmId, d.machine, d.line, d.task, d.date, d.shift, d.status, d.duration, d.technician, d.result, d.notes])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Preventive Maintenance (PM) Report"
        icon={ClipboardCheck}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Machine', options: machineOptions, value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Planned PM" value={totalPlanned} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Completed PM" value={totalCompleted} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="PM Compliance" value={`${compliance}%`} color={compliance >= 90 ? "green" : "amber"} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Duration" value={`${avgDuration} mins`} color="purple" />
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
