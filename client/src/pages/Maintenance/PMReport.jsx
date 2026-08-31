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

  const defaultLogs = [
    { id: 'PMR-201', pmId: 'PM-101', machine: 'Demo Nutrunner Spindle', line: 'Line 1', task: 'Spindle Lubrication & Calibration', date: '2026-08-31', shift: 'Shift 1', status: 'Completed', duration: 35, technician: 'Amit Kumar', result: 'Pass', notes: 'Lubricant replenished, calibration checked OK' },
    { id: 'PMR-202', pmId: 'PM-102', machine: 'Line2 Pallet Indexer', line: 'Line 2', task: 'Pneumatic Cylinder Seal Check', date: '2026-08-31', shift: 'Shift 1', status: 'Pending', duration: 0, technician: 'Rahul Sharma', result: 'Pending', notes: 'Scheduled for end of shift' },
    { id: 'PMR-203', pmId: 'PM-103', machine: 'Station2 Cold Test Bench', line: 'Line 1', task: 'Sensor Alignment & Wiring Inspection', date: '2026-08-31', shift: 'Shift 1', status: 'Completed', duration: 20, technician: 'Priya Singh', result: 'Pass', notes: 'Sensors cleaned and realigned' },
    { id: 'PMR-204', pmId: 'PM-104', machine: 'Conveyor Drive Unit 1', line: 'Line 1', task: 'Motor Belt Tension Adjustment', date: '2026-08-30', shift: 'Shift 2', status: 'Overdue', duration: 0, technician: 'Amit Kumar', result: 'Overdue', notes: 'Requires spare belt' },
    { id: 'PMR-205', pmId: 'PM-105', machine: 'Robotic Tightening Cell', line: 'Line 2', task: 'End-Effector Torque Verification', date: '2026-08-31', shift: 'Shift 2', status: 'Completed', duration: 45, technician: 'Vikram Patel', result: 'Pass', notes: 'Torque values within 0.5% tolerance' },
    { id: 'PMR-206', pmId: 'PM-106', machine: 'Demo Nutrunner Spindle', line: 'Line 1', task: 'Electrical Contact Cleaning', date: '2026-08-31', shift: 'Shift 1', status: 'Completed', duration: 25, technician: 'Amit Kumar', result: 'Pass', notes: 'Contacts cleaned with solvent spray' }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultLogs;

  const tableData = rawTable.filter(d => 
    (line === 'All' || d.line === line) &&
    (machine === 'All' || d.machine === machine)
  );

  const totalPlanned = tableData.length;
  const totalCompleted = tableData.filter(d => d.status === 'Completed').length;
  const compliance = totalPlanned > 0 ? Number(((totalCompleted / totalPlanned) * 100).toFixed(1)) : 100.0;
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
