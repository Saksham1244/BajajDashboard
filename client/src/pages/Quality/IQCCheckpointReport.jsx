import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ScanLine } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function IQCCheckpointReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/quality/checklist?type=IQC_CP&period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, model]);

  const rawTableData = useMemo(() => {
    return dbData?.table || [
      { id: 'IQC-CP-01', cpName: 'Casting Surface Roughness', date: '2026-08-31 08:20', shift: 'Shift 1', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 150', sku: 'UG5', inspector: 'Rahul Sharma', category: 'Surface', stdValue: 'Ra <= 1.6 um', actValue: '1.4 um', result: 'PASS' },
      { id: 'IQC-CP-02', cpName: 'Cylinder Wall Thickness', date: '2026-08-31 09:35', shift: 'Shift 1', line: 'Line 2', stage: 'Incoming', model: 'Dominar 400', sku: 'D400-ABS', inspector: 'Priya Singh', category: 'Measurement', stdValue: '4.50 ± 0.10 mm', actValue: '4.52 mm', result: 'PASS' },
      { id: 'IQC-CP-03', cpName: 'M8 Bolt Thread Pitch', date: '2026-08-31 10:50', shift: 'Shift 1', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 220', sku: 'P220-F', inspector: 'Amit Kumar', category: 'Measurement', stdValue: '1.25 mm', actValue: '1.29 mm', result: 'FAIL' },
      { id: 'IQC-CP-04', cpName: 'Gasket Shore A Hardness', date: '2026-08-31 12:05', shift: 'Shift 1', line: 'Line 2', stage: 'Incoming', model: 'Avenger', sku: 'AV-220', inspector: 'Neha Verma', category: 'Material', stdValue: '70 ± 5 Shore A', actValue: '72 Shore A', result: 'PASS' },
      { id: 'IQC-CP-05', cpName: 'Piston Pin Outer Diameter', date: '2026-08-31 14:25', shift: 'Shift 2', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 150', sku: 'UG5', inspector: 'Vikram Patel', category: 'Measurement', stdValue: '14.000 -0.005 mm', actValue: '13.998 mm', result: 'PASS' },
      { id: 'IQC-CP-06', cpName: 'Spark Plug Electrode Gap', date: '2026-08-31 15:55', shift: 'Shift 2', line: 'Line 2', stage: 'Incoming', model: 'Dominar 400', sku: 'D400-ABS', inspector: 'Rahul Sharma', category: 'Measurement', stdValue: '0.80 - 0.90 mm', actValue: '0.96 mm', result: 'FAIL' },
      { id: 'IQC-CP-07', cpName: 'TPS Sensor Internal Resistance', date: '2026-08-31 17:20', shift: 'Shift 2', line: 'Line 1', stage: 'Incoming', model: 'Pulsar 220', sku: 'P220-F', inspector: 'Amit Kumar', category: 'Electrical', stdValue: '4.8 - 5.2 kOhm', actValue: '5.0 kOhm', result: 'PASS' },
      { id: 'IQC-CP-08', cpName: 'Oil Viscosity at 40°C', date: '2026-08-31 18:45', shift: 'Shift 2', line: 'Line 2', stage: 'Incoming', model: 'Avenger', sku: 'AV-220', inspector: 'Priya Singh', category: 'Chemical', stdValue: '110 ± 5 cSt', actValue: '112 cSt', result: 'PASS' },
    ];
  }, [dbData]);

  const tableData = useMemo(() => {
    return rawTableData.filter(item => {
      if (line !== 'All' && item.line && item.line !== line) return false;
      if (model !== 'All' && item.model && item.model !== model) return false;
      if (period === 'Shift' && shift && item.shift && item.shift !== shift) return false;
      return true;
    });
  }, [rawTableData, line, model, period, shift]);

  const kpiData = useMemo(() => {
    const total = tableData.length;
    const passed = tableData.filter(d => d.result === 'PASS' || d.result === 'OK').length;
    const failed = tableData.filter(d => d.result === 'FAIL' || d.result === 'NOK').length;
    const passRate = total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 100;
    return {
      totalCheckpoints: total,
      passed,
      failed,
      passRate
    };
  }, [tableData]);

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
        <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'PASS' || val === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val}
        </span>
      )
    },
  ];

  const exportToExcel = () => {
    exportToXLSX('IQCCheckpointReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['Passed', kpiData.passed], ['Failed', kpiData.failed], ['Pass Rate %', `${kpiData.passRate}%`]] },
      { name: 'Checkpoint Details', rows: [['Checklist ID', 'Checkpoint Name', 'Date & Time', 'Shift', 'Line', 'Stage', 'Model', 'SKU', 'Inspector Name', 'Category', 'Standard Value', 'Actual Value', 'Result'], ...tableData.map(d => [d.id, d.cpName, d.date, d.shift, d.line, d.stage, d.model, d.sku, d.inspector, d.category, d.stdValue, d.actValue, d.result])] },
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
  ];

  const filters = [...getBaseFilters(), ...customFilters];

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
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Checkpoints" value={kpiData.totalCheckpoints} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Passed" value={kpiData.passed} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Failed" value={kpiData.failed} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pass Rate %" value={`${kpiData.passRate}%`} color={kpiData.passRate >= 90 ? "green" : "amber"} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checkpoint Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

