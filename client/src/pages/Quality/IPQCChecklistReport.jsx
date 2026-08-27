import React from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { FileCheck2 } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function IPQCChecklistReport() {
  const { period, getBaseFilters } = useReportFilters();
  
  const [dbData, setDbData] = React.useState(null);
  React.useEffect(() => {
    fetch(`http://localhost:5000/api/quality/checklist?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const kpiData = dbData?.kpis || {
    totalChecklists: "150",
    okChecklists: "135",
    nokChecklists: "15",
    compliance: 90.0,
  };

  const tableData = dbData?.table || [
    { id: 'IPQC-001', name: 'In-Process Insp 1', date: '2023-10-01 09:00', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 150', inspector: 'John', total: 10, passed: 10, failed: 0, status: 'OK', remarks: '-' },
    { id: 'IPQC-002', name: 'In-Process Insp 2', date: '2023-10-01 11:00', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 150', inspector: 'John', total: 10, passed: 9, failed: 1, status: 'NOK', remarks: 'Torque low' },
    { id: 'IPQC-003', name: 'In-Process Insp 3', date: '2023-10-01 13:00', shift: 'Shift 1', line: 'Line 2', model: 'Dominar 400', inspector: 'Jane', total: 12, passed: 12, failed: 0, status: 'OK', remarks: '-' },
    { id: 'IPQC-004', name: 'In-Process Insp 4', date: '2023-10-02 10:00', shift: 'Shift 1', line: 'Sub-Assy', model: 'Avenger', inspector: 'Mike', total: 8, passed: 8, failed: 0, status: 'OK', remarks: '-' },
    { id: 'IPQC-005', name: 'In-Process Insp 5', date: '2023-10-02 14:00', shift: 'Shift 2', line: 'Line 1', model: 'Pulsar 220', inspector: 'Alice', total: 15, passed: 15, failed: 0, status: 'OK', remarks: '-' },
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
    exportToXLSX('IPQCChecklistReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checklists', kpiData.totalChecklists], ['OK Checklists', kpiData.okChecklists], ['NOK Checklists', kpiData.nokChecklists], ['Compliance %', kpiData.compliance]] },
      { name: 'Checklist Details', rows: [['Checklist ID', 'Checklist Name', 'Date & Time', 'Shift', 'Line', 'Model', 'Inspector Name', 'Total Checkpoints', 'Passed', 'Failed', 'Overall Status', 'Remarks'], ...tableData.map(d => [d.id, d.name, d.date, d.shift, d.line, d.model, d.inspector, d.total, d.passed, d.failed, d.status, d.remarks])] },
    ]);
  };

  const filters = [...getBaseFilters()];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="IPQC Checklist Report"
        icon={FileCheck2}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Checklists" value={kpiData.totalChecklists} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="OK Checklists" value={kpiData.okChecklists} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="NOK Checklists" value={kpiData.nokChecklists} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Compliance %" value={`${kpiData.compliance}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checklist Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

