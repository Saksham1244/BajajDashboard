import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  PlayCircle,
  Activity
} from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';

export default function EngineProductionReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [activeLine, setActiveLine] = useState('All');
  const [activeModel, setActiveModel] = useState('All');
  const [activeSku, setActiveSku] = useState('All');

  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch production data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const query = new URLSearchParams({
      period: period || 'Shift',
      shift: shift || 'Shift 1',
      startDate: startDate || '',
      endDate: endDate || '',
      line: activeLine || 'All',
      model: activeModel || 'All',
      sku: activeSku || 'All'
    });

    fetch(`/api/production/engine-production?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setDbData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching engine production data:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [period, shift, startDate, endDate, activeLine, activeModel, activeSku]);

  // Live polling interval for running plan when active
  useEffect(() => {
    if (!dbData?.isLive) return;

    const interval = setInterval(() => {
      const query = new URLSearchParams({
        period: period || 'Shift',
        shift: shift || 'Shift 1',
        startDate: startDate || '',
        endDate: endDate || '',
        line: activeLine || 'All',
        model: activeModel || 'All',
        sku: activeSku || 'All'
      });

      fetch(`/api/production/engine-production?${query.toString()}`)
        .then(res => res.json())
        .then(data => setDbData(data))
        .catch(err => console.warn('Live polling error:', err));
    }, 15000); // 15s refresh for running plan

    return () => clearInterval(interval);
  }, [dbData?.isLive, period, shift, startDate, endDate, activeLine, activeModel, activeSku]);

  const kpis = dbData?.kpis || {
    totalPlan: 0,
    totalProd: 0,
    straightTotal: 0,
    reworkTotal: 0,
    shortfall: 0,
    wip: 0,
    ftrRate: 100
  };

  const planVsActualData = useMemo(() => dbData?.planVsActual || [], [dbData]);
  const tableData = useMemo(() => dbData?.table || [], [dbData]);
  const wipSummaryData = useMemo(() => dbData?.wipSummary || [], [dbData]);

  // Excel Export
  const exportToExcel = () => {
    exportToXLSX('Engine_Production_Report.xlsx', [
      {
        name: 'KPI Summary',
        rows: [
          ['Metric', 'Value'],
          ['Total Plan Qty', kpis.totalPlan],
          ['Total Actual Produced', kpis.totalProd],
          ['Straight Pass (FTR)', kpis.straightTotal],
          ['Reworked Pass', kpis.reworkTotal],
          ['FTR Rate %', `${kpis.ftrRate}%`],
          ['Shortfall / Gap', kpis.shortfall],
          ['Active WIP', kpis.wip]
        ]
      },
      {
        name: 'Plan Execution',
        rows: [
          ['Plan ID', 'Priority', 'Line', 'Model Family', 'Model', 'SKU', 'Plan Qty', 'Actual Qty', 'Date', 'Shift', 'WIP', 'Straight Pass (FTR)', 'Rework Pass', 'Status'],
          ...tableData.map(d => [
            d.planId,
            d.priority || 1,
            d.line,
            d.modelFamily,
            d.model,
            d.sku,
            d.planQty,
            d.actualQty,
            d.prodDate,
            d.shift,
            d.wip,
            d.straightPass,
            d.reworkPass,
            d.status
          ])
        ]
      },
      {
        name: 'WIP Summary (Status-wise)',
        rows: [
          ['Status', 'Engine Count'],
          ...wipSummaryData.map(d => [d.status || d.gate, d.count])
        ]
      }
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line',  options: filterOptions.lines,  value: activeLine,  onChange: setActiveLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: activeModel, onChange: setActiveModel },
    { type: 'dropdown', label: 'SKU',   options: filterOptions.skus,   value: activeSku,   onChange: setActiveSku }
  ];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      {/* Section 1: Standard Filter Bar */}
      <StandardFilterBar
        title="Engine Production Report"
        icon={LayoutDashboard}
        period={period}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />

      <div className="flex-1 flex flex-col gap-3">
        {/* Live Running Plan Banner */}
        {dbData?.isLive && dbData?.runningPlan && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 shadow-sm animate-pulse-slow">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold">Live Running Plan #{dbData.runningPlan.planId}:</span>
              {dbData.runningPlan.priority && (
                <span className="bg-sky-100 text-sky-700 font-semibold px-1.5 py-0.5 rounded border border-sky-300 text-[10px]">
                  Seq #{dbData.runningPlan.priority}
                </span>
              )}
              <span>{dbData.runningPlan.line} | {dbData.runningPlan.model} ({dbData.runningPlan.sku})</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-emerald-300">
                {dbData.runningPlan.status || 'Running'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Actual: <strong>{dbData.runningPlan.actualQty}</strong> / {dbData.runningPlan.planQty} units</span>
              <span className="bg-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded">
                {dbData.runningPlan.progressPct}% Progress
              </span>
            </div>
          </div>
        )}

        {/* Section 2: Executive KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard title="Total Plan Qty" value={kpis.totalPlan} sub="Target Schedule" color="blue" />
          <StatCard title="Total Actual Produced" value={kpis.totalProd} sub="Completed Units" color="indigo" />
          <StatCard 
            title="Straight Pass (FTR)" 
            value={kpis.straightTotal} 
            trend={`${kpis.ftrRate}%`} 
            trendLabel="FTR Yield" 
            sub="First Time Right" 
            color="green" 
          />
          <StatCard 
            title="Reworked Pass" 
            value={kpis.reworkTotal} 
            trend={kpis.totalProd > 0 ? `${((kpis.reworkTotal / kpis.totalProd) * 100).toFixed(1)}%` : '0%'} 
            trendLabel="Rework Rate" 
            sub="Fixed & Cleared" 
            color="amber" 
          />
          <StatCard title="Shortfall / Gap" value={kpis.shortfall} sub="Remaining Gap" color="red" />
          <StatCard title="Active WIP" value={kpis.wip} sub="In-Process Engines" color="purple" />
        </div>

        {/* Section 3: Charts Row (Plan vs Actual & Straight Pass vs Reworked Distribution) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Plan vs Actual Production Chart */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  Plan vs Actual Production
                </h3>
                <p className="text-[11px] text-slate-400">
                  {period === 'Shift' || period === 'Day' ? 'Hourly-wise distribution' : period === 'Week' ? 'Day-wise distribution' : period === 'Month' ? 'Week-wise distribution' : 'Month-wise distribution'}
                  {activeSku !== 'All' ? ` (Filtered to ${activeSku})` : ' (Summed across SKUs)'}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {kpis.totalProd} / {kpis.totalPlan} Units
              </span>
            </div>

            <div className="h-[220px]">
              {planVsActualData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">No chart data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={planVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Bar dataKey="plan" name="Planned" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="actual" name="Actual Produced" fill="#0284c7" radius={[3, 3, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Straight Pass vs Reworked Distribution Chart */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Straight Pass vs Reworked Distribution
                </h3>
                <p className="text-[11px] text-slate-400">Status Genealogy distribution by timeline</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {kpis.ftrRate}% FTR
              </span>
            </div>

            <div className="h-[220px]">
              {planVsActualData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">No chart data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    <Bar dataKey="straight" name="Straight Pass (FTR)" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="rework" name="Rework Pass" fill="#f59e0b" stackId="a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Production Plan & Execution Table */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Production Plan Execution Details
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Showing {tableData.length} scheduled plans
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 whitespace-nowrap">Plan ID</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Priority</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Line</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Model Family</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">SKU</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Plan Qty</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Actual Qty</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Shift</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">WIP</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Straight Pass</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Rework Pass</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-slate-400 text-sm">
                      No plan execution data available for selected filters.
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, idx) => (
                    <tr 
                      key={row.planId || idx} 
                      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${row.status === 'Running' ? 'bg-sky-50/40 font-medium' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-brand-dark">#{row.planId}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          #{row.priority || 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{row.line}</td>
                      <td className="py-2.5 px-3 text-slate-500">{row.modelFamily}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{row.model}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{row.sku}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{row.planQty}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-sky-700">{row.actualQty}</td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{row.prodDate}</td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.shift}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-purple-700">{row.wip}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-700">{row.straightPass}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-amber-700">{row.reworkPass}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          row.status === 'Completed'   ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          row.status === 'Running'     ? 'bg-sky-100 text-sky-800 border-sky-300 animate-pulse-slow' :
                          row.status === 'All Started' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                          row.status === 'Hold'        ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          row.status === 'Short Close' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: WIP Summary Bar Chart (Status-wise Distribution) */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                WIP Summary (Status-wise Distribution)
              </h3>
              <p className="text-[11px] text-slate-400">Total engine quantities currently across all 8 production statuses</p>
            </div>
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={wipSummaryData} 
                layout="horizontal" 
                margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 10 }} 
                  angle={-18} 
                  textAnchor="end" 
                  stroke="#64748b" 
                />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                <Tooltip 
                  formatter={(val) => [`${val} Engines`, 'Quantity']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }} 
                />
                <Bar 
                  dataKey="count" 
                  name="Engines in Status" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
