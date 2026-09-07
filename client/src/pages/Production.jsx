import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { LayoutDashboard, CheckCircle2, TrendingUp, AlertTriangle, Layers, Cpu } from 'lucide-react';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import useFilterOptions from '../hooks/useFilterOptions';

export default function Production() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [activeLine, setActiveLine] = useState('All');
  const [activeModel, setActiveModel] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/dashboard/production?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(activeLine)}&model=${encodeURIComponent(activeModel)}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
      })
      .catch(err => {
        console.error('Error loading live production metrics:', err);
      });
  }, [period, shift, startDate, endDate, activeLine, activeModel]);

  // Main KPI values
  const totalPlan = dbData?.kpis?.totalPlan ?? 0;
  const totalProd = dbData?.kpis?.totalProd ?? 0;
  const shortfall = dbData?.kpis?.shortfall ?? 0;
  const wip = dbData?.kpis?.wip ?? 0;
  const rollover = dbData?.kpis?.rollover ?? 0;

  // Straight Pass metrics
  const straightList = dbData?.straightPass || [];
  const straightTotal = straightList.reduce((acc, curr) => acc + (curr.straight || 0), 0);
  const reworkTotal = straightList.reduce((acc, curr) => acc + (curr.reworked || 0), 0);
  const ftrRate = totalProd > 0 ? ((straightTotal / totalProd) * 100).toFixed(1) : (straightTotal > 0 ? '100.0' : '0.0');

  // Real database time series for Plan vs Actual and Straight Pass vs Rework
  const timeTrendData = useMemo(() => {
    if (dbData?.planVsActual && dbData.planVsActual.length > 0) {
      return dbData.planVsActual.map(r => ({
        time: r.time || r.name,
        plan: r.plan || 0,
        actual: r.actual || 0,
        straight: r.straight ?? (r.actual - (r.rework || 0)),
        rework: r.rework ?? 0
      }));
    }
    return [];
  }, [dbData?.planVsActual]);

  // SKU & Model Data on Line C
  const skuData = (dbData?.skuData || []).filter(d => 
    (activeLine === 'All' || d.line === activeLine) &&
    (activeModel === 'All' || d.modelFamily === activeModel)
  ).map(d => ({
    ...d,
    ftr: d.actual > 0 ? `${(((d.straight || (d.actual - (d.rework || 0))) / d.actual) * 100).toFixed(1)}%` : '100.0%'
  }));

  // Model / SKU-wise Comparison Chart Data
  const modelYieldData = useMemo(() => {
    if (skuData && skuData.length > 0) {
      return skuData.map(d => ({
        name: d.name,
        modelFamily: d.modelFamily,
        plan: d.plan || 0,
        actual: d.actual || 0,
        straight: d.straight ?? (d.actual - (d.rework || 0)),
        reworked: d.rework ?? 0,
        ftr: d.actual > 0 ? Number((((d.straight || (d.actual - (d.rework || 0))) / d.actual) * 100).toFixed(1)) : 100
      }));
    }
    return [];
  }, [skuData]);

  const paretoData = dbData?.pareto || [];

  const columns = [
    { header: 'Line', accessor: 'line' },
    { header: 'Model / Family', accessor: 'modelFamily' },
    { header: 'SKU Name', accessor: 'name' },
    { header: 'Plan Qty', accessor: 'plan' },
    { header: 'Actual Qty', accessor: 'actual' },
    { header: 'Straight Pass (FTR)', accessor: (row) => row.straight ?? (row.actual - (row.rework || 0)) },
    { header: 'Rework Pass', accessor: (row) => row.rework ?? 0 },
    { header: 'FTR Yield %', accessor: 'ftr' },
    { header: 'WIP Units', accessor: 'wip' },
    { header: 'Rollover', accessor: 'rollover' },
  ];

  const exportToExcel = () => {
    exportToXLSX('Production_Report.xlsx', [
      { 
        name: 'KPI Summary', 
        rows: [
          ['Metric', 'Value'],
          ['Total Planned Units', totalPlan],
          ['Total Actual Produced', totalProd],
          ['Straight Pass (First-Time-Right)', straightTotal],
          ['Reworked & Cleared', reworkTotal],
          ['First-Time-Right (FTR Rate)', `${ftrRate}%`],
          ['Production Shortfall / Gap', shortfall],
          ['Active WIP Units', wip],
          ['Rollover Units', rollover]
        ]
      },
      { 
        name: 'Plan vs Actual Trend', 
        rows: [
          ['Time Slot / Date', 'Planned Qty', 'Actual Produced', 'Straight Pass', 'Reworked'],
          ...timeTrendData.map(d => [d.time, d.plan, d.actual, d.straight, d.rework])
        ]
      },
      { 
        name: 'Shortfall Loss Pareto', 
        rows: [
          ['Loss Reason', 'Category', 'Stoppage Events', 'Duration (Mins)', 'Cumulative %'],
          ...paretoData.map(d => [d.reason, d.category || 'Breakdown', d.count, d.duration, `${d.cumPercent}%`])
        ]
      },
      { 
        name: 'Model & SKU Details', 
        rows: [
          ['Line', 'Model Family', 'SKU Name', 'Plan Qty', 'Actual Qty', 'Straight Pass', 'Rework', 'FTR Yield %', 'WIP', 'Rollover'],
          ...skuData.map(d => [d.line, d.modelFamily, d.name, d.plan, d.actual, d.straight ?? (d.actual - (d.rework || 0)), d.rework ?? 0, d.ftr, d.wip, d.rollover])
        ]
      }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Production Report"
        icon={LayoutDashboard}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: activeLine, onChange: setActiveLine },
          { type: 'dropdown', label: 'Model', options: filterOptions.models, value: activeModel, onChange: setActiveModel }
        ]}
      />

      <div className="flex-1 flex flex-col gap-3">
        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard title="Total Plan Qty" value={totalPlan} sub="Target Schedule" color="blue" />
          <StatCard title="Total Actual Produced" value={totalProd} sub="Completed Units" color="indigo" />
          <StatCard 
            title="Straight Pass (FTR)" 
            value={straightTotal} 
            trend={`${ftrRate}%`} 
            trendLabel="FTR Yield" 
            sub="First Time Right" 
            color="green" 
          />
          <StatCard 
            title="Reworked Pass" 
            value={reworkTotal} 
            trend={reworkTotal > 0 ? `${((reworkTotal / Math.max(1, totalProd)) * 100).toFixed(1)}%` : '0%'} 
            trendLabel="Rework Rate" 
            sub="Fixed & Cleared" 
            color="amber" 
          />
          <StatCard title="Shortfall / Gap" value={shortfall} sub="Remaining Target" color="rose" />
          <StatCard title="Active WIP & Rollover" value={`${wip} / ${rollover}`} sub="WIP / Hold" color="purple" />
        </div>

        {/* Charts Row 1: Plan vs Actual & Straight Pass Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Plan vs Actual Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Plan vs Actual Production Trend (Line C)
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Units: {totalProd} / {totalPlan}
              </span>
            </div>
            <div className="h-[240px]">
              {timeTrendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No production data for selected date range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }} 
                      stroke="#64748b" 
                      tickFormatter={(v) => (v && v.length > 10 ? v.substring(5) : v)}
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="actual" name="Actual Produced" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Line type="stepAfter" dataKey="plan" name="Plan Target" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Straight Pass vs Rework Stacked Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Straight Pass vs Reworked Distribution
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                FTR Rate: {ftrRate}%
              </span>
            </div>
            <div className="h-[240px]">
              {timeTrendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No quality records for selected date range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }} 
                      stroke="#64748b" 
                      tickFormatter={(v) => (v && v.length > 10 ? v.substring(5) : v)}
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="straight" name="Straight Pass (FTR)" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="rework" name="Reworked Pass" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Model & SKU Yield & Loss Pareto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Model & SKU-Wise Quality & Yield */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Model & SKU-Wise Quality & Straight Pass Yield
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {modelYieldData.length} active configurations
              </span>
            </div>
            <div className="h-[220px]">
              {modelYieldData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No model data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelYieldData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="straight" name="Straight Pass (FTR)" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reworked" name="Rework Pass" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Loss Pareto Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Production Loss
              </h3>
            </div>
            <div className="h-[220px]">
              {paretoData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No loss incidents recorded
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paretoData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="reason" 
                      interval={0}
                      tick={{ fontSize: 10 }}
                      stroke="#64748b"
                      tickFormatter={(val) => (val && val.length > 14 ? `${val.substring(0, 12)}…` : val)}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700">
                              <p className="font-bold text-amber-400">{data.reason}</p>
                              <p className="mt-1">Loss Events: <span className="font-semibold text-white">{data.count}</span></p>
                              <p>Duration: <span className="font-semibold text-sky-400">{data.duration} mins</span></p>
                              <p>Cumulative: <span className="font-semibold text-rose-400">{data.cumPercent}%</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Loss Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="cumPercent" name="Cumulative %" stroke="#ef4444" strokeWidth={2.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Master Data Table */}
        <div className="card p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-dark">
              Line C — Model & SKU Production & Straight Pass Summary
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {skuData.length} active model configurations
            </span>
          </div>
          <DataTable columns={columns} data={skuData} />
        </div>
      </div>
    </div>
  );
}
