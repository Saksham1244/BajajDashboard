import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { FileCheck } from 'lucide-react';

export default function IQCChecklistReport() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [shift, setShift] = useState('All');

  const kpiData = {
    totalChecklists: 120,
    okChecklists: 110,
    nokChecklists: 10,
    compliance: 91.6,
  };

  const tableData = [
    { id: 'CHK-001', name: 'Morning Inspection', date: '2023-10-01 08:00', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 150', inspector: 'John Doe', total: 20, passed: 20, failed: 0, status: 'OK', remarks: 'All clear' },
    { id: 'CHK-002', name: 'Afternoon Inspection', date: '2023-10-01 14:00', shift: 'Shift 2', line: 'Line 2', model: 'Dominar 400', inspector: 'Jane Smith', total: 20, passed: 18, failed: 2, status: 'NOK', remarks: 'Missing parts' },
    { id: 'CHK-003', name: 'Evening Inspection', date: '2023-10-01 20:00', shift: 'Shift 3', line: 'Sub-Assy', model: 'Avenger', inspector: 'Mike Lee', total: 15, passed: 15, failed: 0, status: 'OK', remarks: '-' },
    { id: 'CHK-004', name: 'Random Audit', date: '2023-10-02 10:00', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 220', inspector: 'Alice', total: 10, passed: 10, failed: 0, status: 'OK', remarks: '-' },
    { id: 'CHK-005', name: 'Pre-production', date: '2023-10-02 07:00', shift: 'Shift 1', line: 'Line 2', model: 'Dominar 400', inspector: 'Bob', total: 25, passed: 24, failed: 1, status: 'NOK', remarks: 'Scratch found' },
  ];

  const columns = [
    { header: 'Checklist ID', accessorKey: 'id' },
    { header: 'Checklist Name', accessorKey: 'name' },
    { header: 'Date & Time', accessorKey: 'date' },
    { header: 'Shift', accessorKey: 'shift' },
    { header: 'Line', accessorKey: 'line' },
    { header: 'Model', accessorKey: 'model' },
    { header: 'Inspector Name', accessorKey: 'inspector' },
    { header: 'Total Checkpoints', accessorKey: 'total' },
    { header: 'Passed', accessorKey: 'passed' },
    { header: 'Failed', accessorKey: 'failed' },
    { 
      header: 'Overall Status', 
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.original.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.original.status}
        </span>
      )
    },
    { header: 'Remarks', accessorKey: 'remarks' },
  ];

  const exportToExcel = () => {
    exportToXLSX('IQCChecklistReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checklists', kpiData.totalChecklists], ['OK Checklists', kpiData.okChecklists], ['NOK Checklists', kpiData.nokChecklists], ['Compliance %', kpiData.compliance]] },
      { name: 'Checklist Details', rows: [['Checklist ID', 'Checklist Name', 'Date & Time', 'Shift', 'Line', 'Model', 'Inspector Name', 'Total Checkpoints', 'Passed', 'Failed', 'Overall Status', 'Remarks'], ...tableData.map(d => [d.id, d.name, d.date, d.shift, d.line, d.model, d.inspector, d.total, d.passed, d.failed, d.status, d.remarks])] },
    ]);
  };

  const filters = [
    { type: 'period', value: period, onChange: setPeriod },
    { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
    { type: 'dropdown', label: 'Shift', options: ['All','Shift 1','Shift 2','Shift 3'], value: shift, onChange: setShift },
  ];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="IQC Checklist Report"
        icon={FileCheck}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Checklists" value={kpiData.totalChecklists} />
          <StatCard title="OK Checklists" value={kpiData.okChecklists} />
          <StatCard title="NOK Checklists" value={kpiData.nokChecklists} />
          <StatCard title="Compliance %" value={`${kpiData.compliance}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checklist Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
