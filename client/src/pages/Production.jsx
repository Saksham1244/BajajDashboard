import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import { generateTimeLabels } from '../utils/timeDataGenerator';

export default function Production() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [activeLine, setActiveLine] = useState('All');
  const [activeModel, setActiveModel] = useState('All');

  const [dbData, setDbData] = useState([]);
  const [kpis, setKpis] = useState({ totalProd: 58089, shortfall: 842, wip: 142, rollover: 85 });
  

  React.useEffect(() => {
    
    fetch(`http://localhost:5000/api/dashboard/production?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data.planVsActual || []);
        const total = (data.planVsActual || []).reduce((acc, curr) => acc + curr.actual, 0);
        const planTotal = (data.planVsActual || []).reduce((acc, curr) => acc + curr.plan, 0);
        setKpis(prev => ({
          ...prev,
          totalProd: total,
          shortfall: planTotal > total ? planTotal - total : 0
        }));
        
      })
      .catch(err => {
        console.error(err);
        
      });
  }, [period, shift]);

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const totalProd = Math.max(1, Math.round(58089 * scale));
  const shortfall = Math.max(0, Math.round(842 * scale));
  const wip = Math.max(0, Math.round(142 * scale));
  const rollover = Math.max(0, Math.round(85 * scale));

  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const planPerLabel = Math.floor((totalProd + shortfall) / (labels.length || 1));
    const actualPerLabel = Math.floor(totalProd / (labels.length || 1));

    return labels.map(time => ({
      time,
      plan: planPerLabel,
      actual: Math.max(0, actualPerLabel + Math.floor(Math.random() * 20 * scale - 10 * scale))
    }));
  }, [period, shift, totalProd, shortfall, scale]);

  const allSkuData = [
    { line: 'Line 1', modelFamily: 'Pulsar', name: 'Pulsar 150 UG5', plan: Math.round(400 * scale), actual: Math.round(380 * scale), wip: Math.round(45 * scale), rollover: Math.round(20 * scale) },
    { line: 'Line 2', modelFamily: 'Dominar', name: 'Dominar 400', plan: Math.round(250 * scale), actual: Math.round(235 * scale), wip: Math.round(22 * scale), rollover: Math.round(15 * scale) },
    { line: 'Line 1', modelFamily: 'Avenger', name: 'Avenger 220', plan: Math.round(150 * scale), actual: Math.round(152 * scale), wip: Math.round(10 * scale), rollover: 0 },
    { line: 'Line 2', modelFamily: 'Pulsar', name: 'Pulsar 220', plan: Math.round(200 * scale), actual: Math.round(190 * scale), wip: Math.round(15 * scale), rollover: Math.round(5 * scale) },
    { line: 'Line 1', modelFamily: 'Pulsar', name: 'CT 100', plan: Math.round(300 * scale), actual: Math.round(310 * scale), wip: Math.round(20 * scale), rollover: 0 },
  ];

  const skuData = allSkuData.filter(d => 
    (activeLine === 'All' || d.line === activeLine) &&
    (activeModel === 'All' || d.modelFamily === activeModel)
  );

  const paretoData = [
    { reason: 'Material Short', count: Math.max(1, Math.round(28 * scale)), cumPercent: 42 },
    { reason: 'Machine BD', count: Math.max(1, Math.round(18 * scale)), cumPercent: 69 },
    { reason: 'Quality Hold', count: Math.max(1, Math.round(12 * scale)), cumPercent: 87 },
    { reason: 'Setup Delay', count: Math.max(1, Math.round(5 * scale)), cumPercent: 95 },
    { reason: 'Other', count: Math.max(1, Math.round(3 * scale)), cumPercent: 100 },
  ];

  const columns = [
    { header: 'SKU Name', accessor: 'name' },
    { header: 'Plan Qty', accessor: 'plan' },
    { header: 'Actual Qty', accessor: 'actual' },
    { header: 'WIP Status', accessor: 'wip' },
    { header: 'Rollover Plan', accessor: 'rollover' }
  ];

  const exportToExcel = () => {
    exportToXLSX('Production_Report.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Production', totalProd], ['Production Shortfall', shortfall], ['Current WIP', wip], ['Rollover Quantity', rollover]] },
      { name: 'Hourly Plan vs Actual', rows: [['Time', 'Plan', 'Actual', 'Variance'], ...hourlyData.map(r => [r.time, r.plan, r.actual, r.actual - r.plan])] },
      { name: 'Loss Analysis', rows: [['Reason', 'Loss Count', 'Cumulative %'], ...paretoData.map(r => [r.reason, r.count, r.cumPercent + '%'])] },
      { name: 'SKU Production Status', rows: [['SKU Name', 'Plan Qty', 'Actual Qty', 'WIP Status', 'Rollover Plan'], ...skuData.map(r => [r.name, r.plan, r.actual, r.wip, r.rollover])] }
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
          { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2', 'Sub-Assy'], value: activeLine, onChange: setActiveLine },
          { type: 'dropdown', label: 'Model Family', options: ['All', 'Pulsar', 'Dominar', 'Avenger'], value: activeModel, onChange: setActiveModel }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Production" value={totalProd} trend={12.4} subtitle="vs Last Period" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Production Shortfall" value={shortfall} trend={-4.2} subtitle="vs Last Period" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Current WIP" value={wip} trend={1.8} subtitle="vs Last Period" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Rollover Quantity" value={rollover} trend={-15.3} subtitle="vs Last Period" />
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
                  <XAxis dataKey="reason" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Loss Count" fill="#f59e0b" />
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














