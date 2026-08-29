import React from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ScanLine } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function IQCCheckpointReport() {
  const { period, getBaseFilters } = useReportFilters();
  
  const [dbData, setDbData] = React.useState(null);
  React.useEffect(() => {
    fetch(`/api/quality/checklist?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const kpiData = dbData?.kpis || {
    totalCheckpoints: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
  };

  const tableData = dbData?.table || [];

  const columns = [
    { header: 'Checklist ID', accessor: 'id' },
    { header: 'Checkpoint Name', accessor: 'cpName' },
    { header: 'Date & Time', accessor: 'date' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Line', accessor: 'line' },
    { header: 'Stage', accessor: 'stage' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Inspector Name', accessor: 'inspector' },
    { header: 'Category', accessor: 'category' },
    { header: 'Standard Value', accessor: 'stdValue' },
    { header: 'Actual Value', accessor: 'actValue' },
    { 
      header: 'Result', 
      accessor: 'result',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
          {val}
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

  const filters = [...getBaseFilters()];

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
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Checkpoints" value={kpiData.totalCheckpoints} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Passed" value={kpiData.passed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Failed" value={kpiData.failed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Pass Rate %" value={`${kpiData.passRate}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checkpoint Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

