import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ClipboardCheck } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4', '#eab308'];

export default function PQCAReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/quality/pqca?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&modelFamily=${encodeURIComponent(modelFamily)}&model=${encodeURIComponent(model)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, modelFamily, model]);

  const rawTableData = useMemo(() => {
    return dbData?.table || [
      { checkpoint: 'Oil Level', category: 'Visual', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 150', modelFamily: 'Bike', line: 'Line 1', shift: 'Shift 1' },
      { checkpoint: 'Torque Value', category: 'Measurement', status: 'NC', why: 'Tool issue', action: 'Recalibrated', repeated: 'No', model: 'Dominar 400', modelFamily: 'Bike', line: 'Line 2', shift: 'Shift 1' },
      { checkpoint: 'Engine Noise', category: 'Functional', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 220', modelFamily: 'Bike', line: 'Line 1', shift: 'Shift 2' },
      { checkpoint: 'Paint Quality', category: 'Visual', status: 'NC', why: 'Dust', action: 'Cleaned', repeated: 'Yes', model: 'Avenger', modelFamily: 'Bike', line: 'Line 2', shift: 'Shift 1' },
      { checkpoint: 'Clearance', category: 'Measurement', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 150', modelFamily: 'Bike', line: 'Line 1', shift: 'Shift 2' },
      { checkpoint: 'Spark Plug Gap', category: 'Measurement', status: 'NC', why: 'Worn electrode', action: 'Replaced', repeated: 'No', model: 'Dominar 400', modelFamily: 'Bike', line: 'Line 2', shift: 'Shift 2' },
      { checkpoint: 'Gasket Integrity', category: 'Visual', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 220', modelFamily: 'Bike', line: 'Line 1', shift: 'Shift 1' },
      { checkpoint: 'Valve Seating', category: 'Functional', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Avenger', modelFamily: 'Bike', line: 'Line 2', shift: 'Shift 2' },
    ];
  }, [dbData]);

  const tableData = useMemo(() => {
    return rawTableData.filter(row => {
      if (line !== 'All' && row.line && row.line !== line) return false;
      if (modelFamily !== 'All' && row.modelFamily && row.modelFamily !== modelFamily) return false;
      if (model !== 'All' && row.model && row.model !== model) return false;
      if (period === 'Shift' && shift && row.shift && row.shift !== shift) return false;
      return true;
    });
  }, [rawTableData, line, modelFamily, model, period, shift]);

  const kpiData = useMemo(() => {
    const total = tableData.length;
    const ok = tableData.filter(d => d.status === 'OK').length;
    const nc = tableData.filter(d => d.status === 'NC').length;
    const singleNc = tableData.filter(d => d.status === 'NC' && (d.repeated === 'No' || d.repeated === 'Single' || !d.repeated)).length;
    const doubleNc = tableData.filter(d => d.status === 'NC' && (d.repeated === 'Yes' || d.repeated === 'Double')).length;
    return {
      totalCheckpoints: total,
      ok,
      nc,
      singleNc,
      doubleNc
    };
  }, [tableData]);

  const complianceData = useMemo(() => [
    { name: 'OK', value: kpiData.ok },
    { name: 'NC', value: kpiData.nc },
  ], [kpiData.ok, kpiData.nc]);

  const categoryNcData = useMemo(() => {
    const counts = {};
    tableData.filter(d => d.status === 'NC').forEach(d => {
      const cat = d.category || 'Visual';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const items = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return items.length > 0 ? items : [{ name: 'None', value: 0 }];
  }, [tableData]);

  const ncTrendData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const totalNc = kpiData.nc;
    const base = Math.floor(totalNc / (labels.length || 1));
    return labels.map((label, idx) => ({
      date: label,
      nc: Math.max(0, base + (idx % 2 === 0 && totalNc > 0 ? 1 : 0))
    }));
  }, [period, shift, kpiData.nc]);

  const columns = [
    { header: 'Checkpoint', accessor: 'checkpoint' },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val}
        </span>
      )
    },
    { header: 'Why', accessor: 'why' },
    { header: 'Immediate Action', accessor: 'action' },
    { header: 'Repeated', accessor: 'repeated' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PQCAReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['OK', kpiData.ok], ['NC', kpiData.nc], ['Single Occurrence NC', kpiData.singleNc], ['Double Occurrence NC', kpiData.doubleNc]] },
      { name: 'Compliance', rows: [['Status', 'Count'], ...complianceData.map(d => [d.name, d.value])] },
      { name: 'NC Trend', rows: [['Time', 'NC'], ...ncTrendData.map(d => [d.date, d.nc])] },
      { name: 'Checkpoint Details', rows: [['Checkpoint', 'Category', 'Status', 'Why', 'Immediate Action', 'Repeated', 'Line', 'Model'], ...tableData.map(d => [d.checkpoint, d.category, d.status, d.why, d.action, d.repeated, d.line, d.model])] },
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model Family', options: filterOptions.modelFamilies, value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
  ];

  const filters = [...getBaseFilters(), ...customFilters];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="PQCA Report"
        icon={ClipboardCheck}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Checkpoints" value={kpiData.totalCheckpoints} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="OK" value={kpiData.ok} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="NC" value={kpiData.nc} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Single Occurrence NC" value={kpiData.singleNc} color="amber" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Double Occurrence NC" value={kpiData.doubleNc} color="purple" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Compliance</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complianceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    <Cell fill={COLORS[2]} />
                    <Cell fill={COLORS[4]} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Category-wise NC</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryNcData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {categoryNcData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">NC Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ncTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nc" stroke={COLORS[4]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checkpoint Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
