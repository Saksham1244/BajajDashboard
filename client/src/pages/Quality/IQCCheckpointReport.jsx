import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ScanLine } from 'lucide-react';

export default function IQCCheckpointReport() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [shift, setShift] = useState('All');

  const kpiData = {
    totalCheckpoints: 2500,
    passed: 2450,
    failed: 50,
    passRate: 98.0,
  };

  const tableData = [
    { id: 'CHK-001', cpName: 'O-ring Inspection', date: '2023-10-01 08:05', shift: 'Shift 1', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 150', sku: 'UG6', inspector: 'John Doe', category: 'Visual', stdValue: 'Present', actValue: 'Present', result: 'PASS' },
    { id: 'CHK-001', cpName: 'Bolt Length', date: '2023-10-01 08:10', shift: 'Shift 1', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 150', sku: 'UG6', inspector: 'John Doe', category: 'Measurement', stdValue: '45mm', actValue: '45.1mm', result: 'PASS' },
    { id: 'CHK-002', cpName: 'Gear Hardness', date: '2023-10-01 14:15', shift: 'Shift 2', line: 'Line 2', stage: 'Incoming', model: 'Dominar 400', sku: 'STD', inspector: 'Jane Smith', category: 'Measurement', stdValue: '60 HRC', actValue: '58 HRC', result: 'FAIL' },
    { id: 'CHK-003', cpName: 'Clutch Assembly', date: '2023-10-01 20:10', shift: 'Shift 3', line: 'Sub-Assy', stage: 'Incoming', model: 'Avenger', sku: 'STD', inspector: 'Mike Lee', category: 'Visual', stdValue: 'No Defect', actValue: 'No Defect', result: 'PASS' },
    { id: 'CHK-004', cpName: 'Sensor Output', date: '2023-10-02 10:20', shift: 'Shift 1', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 220', sku: 'UG5', inspector: 'Alice', category: 'Functional', stdValue: '5V', actValue: '5V', result: 'PASS' },
  ];

  const columns = [
    { header: 'Checklist ID', accessorKey: 'id' },
    { header: 'Checkpoint Name', accessorKey: 'cpName' },
    { header: 'Date & Time', accessorKey: 'date' },
    { header: 'Shift', accessorKey: 'shift' },
    { header: 'Line', accessorKey: 'line' },
    { header: 'Stage', accessorKey: 'stage' },
    { header: 'Model', accessorKey: 'model' },
    { header: 'SKU', accessorKey: 'sku' },
    { header: 'Inspector Name', accessorKey: 'inspector' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Standard Value', accessorKey: 'stdValue' },
    { header: 'Actual Value', accessorKey: 'actValue' },
    { 
      header: 'Result', 
      accessorKey: 'result',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.original.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.result}
        </span>
      )
    },
  ];

  const exportToExcel = () => {
    exportToXLSX('IQCCheckpointReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['Passed', kpiData.passed], ['Failed', kpiData.failed], ['Pass Rate %', kpiData.passRate]] },
      { name: 'Checkpoint Details', rows: [['Checklist ID', 'Checkpoint Name', 'Date & Time', 'Shift', 'Line', 'Stage', 'Model', 'SKU', 'Inspector Name', 'Category', 'Standard Value', 'Actual Value', 'Result'], ...tableData.map(d => [d.id, d.cpName, d.date, d.shift, d.line, d.stage, d.model, d.sku, d.inspector, d.category, d.stdValue, d.actValue, d.result])] },
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
        title="IQC Checkpoint Report"
        icon={ScanLine}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Checkpoints" value={kpiData.totalCheckpoints} />
          <StatCard title="Passed" value={kpiData.passed} />
          <StatCard title="Failed" value={kpiData.failed} />
          <StatCard title="Pass Rate %" value={`${kpiData.passRate}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checkpoint Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
