import React from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { CheckSquare } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function FQCChecklistReport() {
  const { period, getBaseFilters } = useReportFilters();

  const [dbData, setDbData] = React.useState(null);
  React.useEffect(() => {
    fetch(`http://localhost:5000/api/quality/checklist?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const kpiData = dbData?.kpis || {
    totalChecklists: 200,
    okChecklists: 195,
    nokChecklists: 5,
    compliance: 97.5,
  };

  const tableData = dbData?.table || [
    { id: 'FQC-001', name: 'Final Insp A', date: '2023-10-01 10:00', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', inspector: 'Tom', total: 30, passed: 30, failed: 0, status: 'OK', remarks: '-' },
    { id: 'FQC-002', name: 'Final Insp B', date: '2023-10-01 12:00', shift: 'Shift 1', line: 'Line 2', model: 'Dominar 400', sku: 'STD', inspector: 'Jerry', total: 35, passed: 34, failed: 1, status: 'NOK', remarks: 'Paint issue' },
    { id: 'FQC-003', name: 'Final Insp C', date: '2023-10-01 15:00', shift: 'Shift 2', line: 'Line 1', model: 'Pulsar 220', sku: 'UG5', inspector: 'Spike', total: 25, passed: 25, failed: 0, status: 'OK', remarks: '-' },
    { id: 'FQC-004', name: 'Final Insp D', date: '2023-10-02 09:00', shift: 'Shift 1', line: 'Sub-Assy', model: 'Avenger', sku: 'STD', inspector: 'Tyke', total: 20, passed: 20, failed: 0, status: 'OK', remarks: '-' },
    { id: 'FQC-005', name: 'Final Insp E', date: '2023-10-02 11:30', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', inspector: 'Tom', total: 30, passed: 29, failed: 1, status: 'NOK', remarks: 'Label missing' },
  ];

  const columns = [
    { header: 'Checklist ID', accessorKey: 'id' },
    { header: 'Checklist Name', accessorKey: 'name' },
    { header: 'Date & Time', accessorKey: 'date' },
    { header: 'Shift', accessorKey: 'shift' },
    { header: 'Line', accessorKey: 'line' },
    { header: 'Model', accessorKey: 'model' },
    { header: 'SKU', accessorKey: 'sku' },
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
    exportToXLSX('FQCChecklistReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checklists', kpiData.totalChecklists], ['OK Checklists', kpiData.okChecklists], ['NOK Checklists', kpiData.nokChecklists], ['Compliance %', kpiData.compliance]] },
      { name: 'Checklist Details', rows: [['Checklist ID', 'Checklist Name', 'Date & Time', 'Shift', 'Line', 'Model', 'SKU', 'Inspector Name', 'Total Checkpoints', 'Passed', 'Failed', 'Overall Status', 'Remarks'], ...tableData.map(d => [d.id, d.name, d.date, d.shift, d.line, d.model, d.sku, d.inspector, d.total, d.passed, d.failed, d.status, d.remarks])] },
    ]);
  };

  const filters = [...getBaseFilters()];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="FQC Checklist Report"
        icon={CheckSquare}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard autoScale title="Total Checklists" value={kpiData.totalChecklists} />
          <StatCard autoScale title="OK Checklists" value={kpiData.okChecklists} />
          <StatCard autoScale title="NOK Checklists" value={kpiData.nokChecklists} />
          <StatCard autoScale title="Compliance %" value={`${kpiData.compliance}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checklist Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

