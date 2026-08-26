import React from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ScanLine } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function FQCCheckpointReport() {
  const { getBaseFilters } = useReportFilters();

  const kpiData = {
    totalCheckpoints: 4000,
    passed: 3960,
    failed: 40,
    passRate: 99.0,
  };

  const tableData = [
    { id: 'FQC-001', cpName: 'Engine Start', date: '2023-10-01 10:15', shift: 'Shift 1', line: 'Line 1', stage: 'Final', model: 'Pulsar 150', sku: 'UG6', inspector: 'Tom', category: 'Functional', stdValue: 'Starts < 2s', actValue: '1.5s', result: 'PASS' },
    { id: 'FQC-002', cpName: 'Paint Finish', date: '2023-10-01 12:20', shift: 'Shift 1', line: 'Line 2', stage: 'Final', model: 'Dominar 400', sku: 'STD', inspector: 'Jerry', category: 'Visual', stdValue: 'No defects', actValue: 'Scratch', result: 'FAIL' },
    { id: 'FQC-003', cpName: 'Horn Sound', date: '2023-10-01 15:30', shift: 'Shift 2', line: 'Line 1', stage: 'Final', model: 'Pulsar 220', sku: 'UG5', inspector: 'Spike', category: 'Functional', stdValue: 'Clear', actValue: 'Clear', result: 'PASS' },
    { id: 'FQC-004', cpName: 'Tire Pressure', date: '2023-10-02 09:10', shift: 'Shift 1', line: 'Sub-Assy', stage: 'Final', model: 'Avenger', sku: 'STD', inspector: 'Tyke', category: 'Measurement', stdValue: '28 psi', actValue: '28 psi', result: 'PASS' },
    { id: 'FQC-005', cpName: 'Light Check', date: '2023-10-02 11:45', shift: 'Shift 1', line: 'Line 1', stage: 'Final', model: 'Pulsar 150', sku: 'UG6', inspector: 'Tom', category: 'Functional', stdValue: 'All Working', actValue: 'Blinker fail', result: 'FAIL' },
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
    exportToXLSX('FQCCheckpointReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['Passed', kpiData.passed], ['Failed', kpiData.failed], ['Pass Rate %', kpiData.passRate]] },
      { name: 'Checkpoint Details', rows: [['Checklist ID', 'Checkpoint Name', 'Date & Time', 'Shift', 'Line', 'Stage', 'Model', 'SKU', 'Inspector Name', 'Category', 'Standard Value', 'Actual Value', 'Result'], ...tableData.map(d => [d.id, d.cpName, d.date, d.shift, d.line, d.stage, d.model, d.sku, d.inspector, d.category, d.stdValue, d.actValue, d.result])] },
    ]);
  };

  const filters = [...getBaseFilters()];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="FQC Checkpoint Report"
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

