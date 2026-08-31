import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import useFilterOptions from '../hooks/useFilterOptions';
import { generateTimeLabels } from '../utils/timeDataGenerator';

export default function Production() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [activeLine, setActiveLine] = useState('All');
  const [activeModel, setActiveModel] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/dashboard/production?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(activeLine)}&model=${encodeURIComponent(activeModel)}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
      })
      .catch(err => {
        console.error('Error loading live production metrics:', err);
      });
  }, [period, shift, startDate, endDate, activeLine, activeModel]);

  const totalPlan = dbData?.kpis?.totalPlan ?? 0;
  const totalProd = dbData?.kpis?.totalProd ?? 0;
  const shortfall = dbData?.kpis?.shortfall ?? 0;
  const wip = dbData?.kpis?.wip ?? 0;
  const rollover = dbData?.kpis?.rollover ?? 0;

  const hourlyData = useMemo(() => {
    if (dbData?.planVsActual && dbData.planVsActual.length > 0) {
      return dbData.planVsActual.map(r => ({
        time: r.time || r.name,
        plan: r.plan || 0,
        actual: r.actual || 0
      }));
    }
    const labels = generateTimeLabels(period, shift);
    return labels.map(time => ({
      time,
      plan: 0,
      actual: 0
    }));
  }, [period, shift, dbData?.planVsActual]);

  const skuData = (dbData?.skuData || []).filter(d => 
    (activeLine === 'All' || d.line === activeLine) &&
    (activeModel === 'All' || d.modelFamily === activeModel)
  );

  const paretoData = dbData?.pareto || [];

  const columns = [
    { header: 'SKU Name', accessor: 'name' },
    { header: 'Plan Qty', accessor: 'plan' },
    { header: 'Actual Qty', accessor: 'actual' },
    { header: 'WIP Status', accessor: 'wip' },
    { header: 'Rollover', accessor: 'rollover' },
  ];

  const exportToExcel = () => {
    exportToXLSX('ProductionOverview.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Plan', totalPlan], ['Total Actual', totalProd], ['Shortfall', shortfall], ['WIP Status', wip], ['Rollover', rollover]] },
      { name: 'Plan vs Actual', rows: [['Time', 'Plan', 'Actual'], ...hourlyData.map(d => [d.time, d.plan, d.actual])] },
      { name: 'Shortfall Pareto', rows: [['Reason', 'Loss Events', 'Cumulative %'], ...paretoData.map(d => [d.reason, d.count, `${d.cumPercent}%`])] },
      { name: 'Model SKU Status', rows: [['SKU Name', 'Plan Qty', 'Actual Qty', 'WIP Status', 'Rollover'], ...skuData.map(d => [d.name, d.plan, d.actual, d.wip, d.rollover])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Production Overview"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Plan Qty" value={totalPlan} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Actual Qty" value={totalProd} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Shortfall / Gap" value={shortfall} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="WIP Status" value={wip} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Rollover" value={rollover} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Plan vs Actual by Period</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" name="Actual Prod." fill="#0ea5e9" />
                  <Line type="stepAfter" dataKey="plan" name="Target" stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Shortfall Pareto (Loss Analysis)</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={paretoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
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
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Loss Count"
                    fill="#f59e0b"
                  />
                  <Line yAxisId="right" type="monotone" dataKey="cumPercent" name="Cumulative %" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Model & SKU Wise Production Status</h3>
          <DataTable columns={columns} data={skuData} />
        </div>
      </div>
    </div>
  );
}
