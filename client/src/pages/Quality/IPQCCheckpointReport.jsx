import React from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ScanLine } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function IPQCCheckpointReport() {
  const { period, getBaseFilters } = useReportFilters();
  
  const [dbData, setDbData] = React.useState(null);
  React.useEffect(() => {
    fetch(`http://localhost:5000/api/quality/checklist?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const kpiData = dbData?.kpis || {
    totalCheckpoints: 3000,
    passed: 2950,
    failed: 50,
    passRate: 98.3,
  };

  const tableData = dbData?.table || [
    { id: 'IPQC-001', cpName: 'Torque Check 1', date: '2023-10-01 09:05', shift: 'Shift 1', line: 'Line 1', stage: 'Assembly', model: 'Pulsar 150', sku: 'UG6', inspector: 'John', category: 'Measurement', stdValue: '25 Nm', actValue: '25 Nm', result: 'PASS' },
    { id: 'IPQC-002', cpName: 'Torque Check 2', date: '2023-10-01 11:15', shift: 'Shift 1', line: 'Line 1', stage: 'Assembly', model: 'Pulsar 150', sku: 'UG6', inspector: 'John', category: 'Measurement', stdValue: '30 Nm', actValue: '28 Nm', result: 'FAIL' },
    { id: 'IPQC-003', cpName: 'Wire Routing', date: '2023-10-01 13:20', shift: 'Shift 1', line: 'Line 2', stage: 'Assembly', model: 'Dominar 400', sku: 'STD', inspector: 'Jane', category: 'Visual', stdValue: 'Correct', actValue: 'Correct', result: 'PASS' },
    { id: 'IPQC-004', cpName: 'Brake Fluid Level', date: '2023-10-02 10:10', shift: 'Shift 1', line: 'Sub-Assy', stage: 'Assembly', model: 'Avenger', sku: 'STD', inspector: 'Mike', category: 'Visual', stdValue: 'Max Line', actValue: 'Max Line', result: 'PASS' },
    { id: 'IPQC-005', cpName: 'Spark Plug Gap', date: '2023-10-02 14:05', shift: 'Shift 2', line: 'Line 1', stage: 'Assembly', model: 'Pulsar 220', sku: 'UG5', inspector: 'Alice', category: 'Measurement', stdValue: '0.8 mm', actValue: '0.8 mm', result: 'PASS' },
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
    exportToXLSX('IPQCCheckpointReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['Passed', kpiData.passed], ['Failed', kpiData.failed], ['Pass Rate %', kpiData.passRate]] },
      { name: 'Checkpoint Details', rows: [['Checklist ID', 'Checkpoint Name', 'Date & Time', 'Shift', 'Line', 'Stage', 'Model', 'SKU', 'Inspector Name', 'Category', 'Standard Value', 'Actual Value', 'Result'], ...tableData.map(d => [d.id, d.cpName, d.date, d.shift, d.line, d.stage, d.model, d.sku, d.inspector, d.category, d.stdValue, d.actValue, d.result])] },
    ]);
  };

  const filters = [...getBaseFilters()];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="IPQC Checkpoint Report"
        icon={ScanLine}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard autoScale title="Total Checkpoints" value={kpiData.totalCheckpoints} />
          <StatCard autoScale title="Passed" value={kpiData.passed} />
          <StatCard autoScale title="Failed" value={kpiData.failed} />
          <StatCard autoScale title="Pass Rate %" value={`${kpiData.passRate}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checkpoint Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

