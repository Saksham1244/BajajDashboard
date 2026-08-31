import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ScanLine } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function FQCCheckpointReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/quality/checklist?type=FQC_CP&period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, model, sku]);

  const rawTableData = useMemo(() => {
    return dbData?.table || [
      { id: 'FQC-CP-01', cpName: 'Cold Test Peak Vibration', date: '2026-08-31 08:50', shift: 'Shift 1', line: 'Line 1', stage: 'Testing', model: 'Pulsar 150', sku: 'UG5', inspector: 'Rahul Sharma', category: 'Functional', stdValue: '< 2.5 mm/s', actValue: '1.8 mm/s', result: 'PASS' },
      { id: 'FQC-CP-02', cpName: 'Dyno Max Power Output', date: '2026-08-31 10:05', shift: 'Shift 1', line: 'Line 2', stage: 'Testing', model: 'Dominar 400', sku: 'D400-ABS', inspector: 'Priya Singh', category: 'Performance', stdValue: '39.5 ± 0.5 HP', actValue: '39.6 HP', result: 'PASS' },
      { id: 'FQC-CP-03', cpName: 'Hot Run Oil Pressure at 4k RPM', date: '2026-08-31 11:20', shift: 'Shift 1', line: 'Line 1', stage: 'Testing', model: 'Pulsar 220', sku: 'P220-F', inspector: 'Amit Kumar', category: 'Measurement', stdValue: '2.8 - 3.2 bar', actValue: '2.5 bar', result: 'FAIL' },
      { id: 'FQC-CP-04', cpName: 'Idle Engine RPM Stability', date: '2026-08-31 12:35', shift: 'Shift 1', line: 'Line 2', stage: 'Testing', model: 'Avenger', sku: 'AV-220', inspector: 'Neha Verma', category: 'Functional', stdValue: '1400 ± 50 RPM', actValue: '1410 RPM', result: 'PASS' },
      { id: 'FQC-CP-05', cpName: 'ECU CAN Bus DTC Error Count', date: '2026-08-31 14:50', shift: 'Shift 2', line: 'Line 1', stage: 'Diagnostics', model: 'Pulsar 150', sku: 'UG5', inspector: 'Vikram Patel', category: 'Electrical', stdValue: '0 DTC', actValue: '0 DTC', result: 'PASS' },
      { id: 'FQC-CP-06', cpName: 'Exhaust CO% Emission at Idle', date: '2026-08-31 16:20', shift: 'Shift 2', line: 'Line 2', stage: 'Emission', model: 'Dominar 400', sku: 'D400-ABS', inspector: 'Rahul Sharma', category: 'Chemical', stdValue: '< 0.50 %', actValue: '0.62 %', result: 'FAIL' },
      { id: 'FQC-CP-07', cpName: 'Oil Sump Drain Plug Torque', date: '2026-08-31 17:50', shift: 'Shift 2', line: 'Line 1', stage: 'Final Dressing', model: 'Pulsar 220', sku: 'P220-F', inspector: 'Amit Kumar', category: 'Torque', stdValue: '28 ± 2 Nm', actValue: '28.4 Nm', result: 'PASS' },
      { id: 'FQC-CP-08', cpName: 'Tank Decal & Logo Alignment', date: '2026-08-31 19:20', shift: 'Shift 2', line: 'Line 2', stage: 'Final Dressing', model: 'Avenger', sku: 'AV-220', inspector: 'Priya Singh', category: 'Visual', stdValue: 'Centered ± 1 mm', actValue: 'Centered', result: 'PASS' },
    ];
  }, [dbData]);

  const tableData = useMemo(() => {
    return rawTableData.filter(item => {
      if (line !== 'All' && item.line && item.line !== line) return false;
      if (model !== 'All' && item.model && item.model !== model) return false;
      if (sku !== 'All' && item.sku && item.sku !== sku) return false;
      if (period === 'Shift' && shift && item.shift && item.shift !== shift) return false;
      return true;
    });
  }, [rawTableData, line, model, sku, period, shift]);

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
    exportToXLSX('FQCCheckpointReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['Passed', kpiData.passed], ['Failed', kpiData.failed], ['Pass Rate %', `${kpiData.passRate}%`]] },
      { name: 'Checkpoint Details', rows: [['Checklist ID', 'Checkpoint Name', 'Date & Time', 'Shift', 'Line', 'Stage', 'Model', 'SKU', 'Inspector Name', 'Category', 'Standard Value', 'Actual Value', 'Result'], ...tableData.map(d => [d.id, d.cpName, d.date, d.shift, d.line, d.stage, d.model, d.sku, d.inspector, d.category, d.stdValue, d.actValue, d.result])] },
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const filters = [...getBaseFilters(), ...customFilters];

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

