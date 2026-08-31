import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { CheckSquare } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function FQCChecklistReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/quality/checklist?type=FQC&period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, model, sku]);

  const rawTableData = useMemo(() => {
    return dbData?.table || [
      { id: 'FQC-3001', name: 'End-of-Line Cold Test Inspection', date: '2026-08-31 08:45', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 150', sku: 'UG5', inspector: 'Rahul Sharma', total: 10, passed: 10, failed: 0, status: 'OK', remarks: 'Vibration & oil pressure OK' },
      { id: 'FQC-3002', name: 'Dyno Performance & Power Audit', date: '2026-08-31 10:00', shift: 'Shift 1', line: 'Line 2', model: 'Dominar 400', sku: 'D400-ABS', inspector: 'Priya Singh', total: 12, passed: 12, failed: 0, status: 'OK', remarks: 'BHP curve matches spec' },
      { id: 'FQC-3003', name: 'Hot Run Emission & Leakage Test', date: '2026-08-31 11:15', shift: 'Shift 1', line: 'Line 1', model: 'Pulsar 220', sku: 'P220-F', inspector: 'Amit Kumar', total: 14, passed: 13, failed: 1, status: 'NOK', remarks: 'Exhaust joint clamp retightened' },
      { id: 'FQC-3004', name: 'Gear Shifting Smoothness Audit', date: '2026-08-31 12:30', shift: 'Shift 1', line: 'Line 2', model: 'Avenger', sku: 'AV-220', inspector: 'Neha Verma', total: 8, passed: 8, failed: 0, status: 'OK', remarks: 'Neutral switch verified' },
      { id: 'FQC-3005', name: 'Electrical & Sensor Diagnostic Test', date: '2026-08-31 14:45', shift: 'Shift 2', line: 'Line 1', model: 'Pulsar 150', sku: 'UG5', inspector: 'Vikram Patel', total: 10, passed: 10, failed: 0, status: 'OK', remarks: 'ECU DTC scan clean' },
      { id: 'FQC-3006', name: 'Final Paint & Surface Finish QA', date: '2026-08-31 16:15', shift: 'Shift 2', line: 'Line 2', model: 'Dominar 400', sku: 'D400-ABS', inspector: 'Rahul Sharma', total: 12, passed: 11, failed: 1, status: 'NOK', remarks: 'Buffed casing scuff mark' },
      { id: 'FQC-3007', name: 'Fastener Torque Audit (Critical)', date: '2026-08-31 17:45', shift: 'Shift 2', line: 'Line 1', model: 'Pulsar 220', sku: 'P220-F', inspector: 'Amit Kumar', total: 15, passed: 15, failed: 0, status: 'OK', remarks: '100% torque marks verified' },
      { id: 'FQC-3008', name: 'Decal Alignment & Badge QA', date: '2026-08-31 19:15', shift: 'Shift 2', line: 'Line 2', model: 'Avenger', sku: 'AV-220', inspector: 'Priya Singh', total: 8, passed: 8, failed: 0, status: 'OK', remarks: 'Visual inspection pass' },
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
    const ok = tableData.filter(d => d.status === 'OK').length;
    const nok = tableData.filter(d => d.status === 'NOK' || d.status === 'FAIL' || d.status === 'FAILED').length;
    const compliance = total > 0 ? Number(((ok / total) * 100).toFixed(1)) : 100;
    return {
      totalChecklists: total,
      okChecklists: ok,
      nokChecklists: nok,
      compliance: compliance,
    };
  }, [tableData]);

  const columns = [
    { header: 'Checklist ID', accessor: 'id' },
    { header: 'Checklist Name', accessor: 'name' },
    { header: 'Date & Time', accessor: 'date' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
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
    exportToXLSX('FQCChecklistReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checklists', kpiData.totalChecklists], ['OK Checklists', kpiData.okChecklists], ['NOK Checklists', kpiData.nokChecklists], ['Compliance %', `${kpiData.compliance}%`]] },
      { name: 'Checklist Details', rows: [['Checklist ID', 'Checklist Name', 'Date & Time', 'Shift', 'Line', 'Model', 'SKU', 'Inspector Name', 'Total Checkpoints', 'Passed', 'Failed', 'Overall Status', 'Remarks'], ...tableData.map(d => [d.id, d.name, d.date, d.shift, d.line, d.model, d.sku, d.inspector, d.total, d.passed, d.failed, d.status, d.remarks])] },
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
        title="FQC Checklist Report"
        icon={CheckSquare}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Checklists" value={kpiData.totalChecklists} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="OK Checklists" value={kpiData.okChecklists} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="NOK Checklists" value={kpiData.nokChecklists} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Compliance %" value={`${kpiData.compliance}%`} color={kpiData.compliance >= 90 ? "green" : "amber"} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checklist Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

