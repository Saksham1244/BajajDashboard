import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PackageSearch, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function KitInspectionReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/material/kitting?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, model, sku]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const tableData = (dbData?.table || []).filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.model, model) &&
    matchFilter(d.sku, sku)
  );

  const okCount = dbData?.kpis?.okCount ?? tableData.filter(d => d.status === 'OK' || d.status === 'Prepared').length;
  const nokCount = dbData?.kpis?.nokCount ?? tableData.filter(d => d.status === 'NOK' || d.status === 'Rejected').length;
  const totalInspected = dbData?.kpis?.totalInspected ?? tableData.length;
  const passRate = totalInspected > 0 ? `${((okCount / totalInspected) * 100).toFixed(1)}%` : '0.0%';

  const kpi = {
    total: totalInspected,
    ok: okCount,
    nok: nokCount,
    passRate: passRate
  };

  const defectData = useMemo(() => {
    if (dbData?.defectBreakdown && dbData.defectBreakdown.length > 0) {
      return dbData.defectBreakdown;
    }
    const counts = {};
    tableData.filter(d => d.defect && d.defect !== '-').forEach(d => {
      counts[d.defect] = (counts[d.defect] || 0) + 1;
    });
    return Object.entries(counts).map(([defect, count]) => ({ defect, count }));
  }, [dbData?.defectBreakdown, tableData]);

  const trendData = useMemo(() => {
    if (dbData?.trend && dbData.trend.length > 0) {
      return dbData.trend.map(t => ({
        time: t.time,
        inspected: Number(t.inspected || 0),
        defects: Number(t.defects || 0),
        ok: Number(t.ok || 0)
      }));
    }
    return [];
  }, [dbData?.trend]);

  const columns = [
    { header: 'Kit ID', accessor: 'kitId' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const color = val === 'OK' || val === 'Prepared' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100 font-bold';
      return <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{val}</span>;
    }},
    { header: 'Defect Reason', accessor: 'defect' },
    { header: 'Accuracy', accessor: 'accuracy' },
    { header: 'Inspector', accessor: 'operator' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
  ];

  const exportToExcel = () => {
    exportToXLSX('Kit_Inspection_Report.xlsx', [
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Total Inspected Kits', kpi.total],
        ['OK Kits Passed', kpi.ok],
        ['NOK Kits (Rejected)', kpi.nok],
        ['Pass Rate %', kpi.passRate]
      ]},
      { name: 'Defect Analysis', rows: [
        ['Defect Category', 'Count'],
        ...defectData.map(d => [d.defect, d.count])
      ]},
      { name: 'Inspection Trend', rows: [
        ['Time / Date', 'Total Inspected', 'Defects Found', 'Passed OK'],
        ...trendData.map(d => [d.time, d.inspected, d.defects, d.ok])
      ]},
      { name: 'Inspection Logs', rows: [
        ['Kit ID', 'Line', 'Model', 'SKU', 'Status', 'Defect Reason', 'Accuracy', 'Inspector', 'Date', 'Time'],
        ...tableData.map(d => [d.kitId, d.line, d.model, d.sku, d.status, d.defect, d.accuracy, d.operator, d.date, d.time])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar 
        title="Kit Inspection Report" 
        icon={PackageSearch} 
        period={period} 
        onExcelClick={exportToExcel} 
        filters={[...getBaseFilters(), ...customFilters]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Inspected" value={kpi.total} sub="Completed Kit Audits" color="blue" />
          <StatCard title="OK Kits" value={kpi.ok} trend="+100%" trendLabel="Ready for Line" sub="Zero Defect Kits" color="green" />
          <StatCard title="NOK / Rejected" value={kpi.nok} trend={kpi.nok > 0 ? `${((kpi.nok / Math.max(1, kpi.total)) * 100).toFixed(1)}%` : '0%'} trendLabel="Reject Rate" sub="Sent for Correction" color="red" />
          <StatCard title="Pass Rate %" value={kpi.passRate} trend={Number(kpi.passRate.replace('%', '')) >= 95 ? 'Passed' : 'Low Yield'} sub="Kitting Quality Yield" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Defect Bar Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Kit Defect Count by Category
              </h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {defectData.reduce((s, d) => s + (d.count || 0), 0)} Total Defects
              </span>
            </div>
            <div className="h-[240px]">
              {defectData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No kit defects recorded for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defectData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis 
                      dataKey="defect" 
                      type="category" 
                      tick={{ fontSize: 10 }} 
                      stroke="#64748b"
                      width={140}
                      tickFormatter={(val) => (val && val.length > 20 ? `${val.substring(0, 18)}…` : val)}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                    <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Inspection Trend Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Kit Inspection & Defect Trend
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Pass Yield: {kpi.passRate}
              </span>
            </div>
            <div className="h-[240px]">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No inspection logs for selected timeframe
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }} 
                      stroke="#64748b"
                      tickFormatter={(v) => (v && v.length > 10 ? v.substring(5) : v)}
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="inspected" stroke="#0284c7" strokeWidth={2.5} name="Inspected Kits" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="defects" stroke="#ef4444" strokeWidth={2} name="Defects Found" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Inspection Data Table */}
        <div className="card p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-dark">
              Kit Pre-Assembly Inspection Audit Logs
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {tableData.length} records retrieved
            </span>
          </div>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
