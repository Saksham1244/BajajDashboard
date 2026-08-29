import React from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { FileCheck } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function IQCChecklistReport() {
  const { period, getBaseFilters } = useReportFilters();
  
  const [dbData, setDbData] = React.useState(null);
  React.useEffect(() => {
    fetch(`/api/quality/checklist?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const kpiData = dbData?.kpis || {
    totalChecklists: 0,
    okChecklists: 0,
    nokChecklists: 0,
    compliance: 0,
  };

  const tableData = dbData?.table || [];

  const columns = [
    { header: 'Checklist ID', accessor: 'id' },
    { header: 'Checklist Name', accessor: 'name' },
    { header: 'Date & Time', accessor: 'date' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'Inspector Name', accessor: 'inspector' },
    { header: 'Total Checkpoints', accessor: 'total' },
    { header: 'Passed', accessor: 'passed' },
    { header: 'Failed', accessor: 'failed' },
    { 
      header: 'Overall Status', 
      accessor: 'status',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val}
        </span>
      )
    },
    { header: 'Remarks', accessor: 'remarks' },
  ];

  const exportToExcel = () => {
    exportToXLSX('IQCChecklistReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checklists', kpiData.totalChecklists], ['OK Checklists', kpiData.okChecklists], ['NOK Checklists', kpiData.nokChecklists], ['Compliance %', kpiData.compliance]] },
      { name: 'Checklist Details', rows: [['Checklist ID', 'Checklist Name', 'Date & Time', 'Shift', 'Line', 'Model', 'Inspector Name', 'Total Checkpoints', 'Passed', 'Failed', 'Overall Status', 'Remarks'], ...tableData.map(d => [d.id, d.name, d.date, d.shift, d.line, d.model, d.inspector, d.total, d.passed, d.failed, d.status, d.remarks])] },
    ]);
  };

  const filters = [...getBaseFilters()];

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
