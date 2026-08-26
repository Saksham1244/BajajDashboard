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
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
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
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [period, shift]);

  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const totalPlan = dbData.reduce((acc, curr) => acc + curr.plan, 0) || 1200;
    const totalActual = dbData.reduce((acc, curr) => acc + curr.actual, 0) || 1150;
    
    const planPerLabel = Math.floor(totalPlan / (labels.length || 1));
    const actualPerLabel = Math.floor(totalActual / (labels.length || 1));

    return labels.map(time => ({
      time,
      plan: planPerLabel,
      actual: Math.max(0, actualPerLabel + Math.floor(Math.random() * 20 - 10))
    }));
  }, [period, shift, dbData]);

  const skuData = [
    { name: 'Pulsar 150 UG5', plan: 400, actual: 380, wip: 45, rollover: 20 },
    { name: 'Dominar 400', plan: 250, actual: 235, wip: 22, rollover: 15 },
    { name: 'Avenger 220', plan: 150, actual: 152, wip: 10, rollover: 0 },
    { name: 'Pulsar 220', plan: 200, actual: 190, wip: 15, rollover: 5 },
    { name: 'CT 100', plan: 300, actual: 310, wip: 20, rollover: 0 },
  ];

  const paretoData = [
    { reason: 'Material Short', count: 28, cumPercent: 42 },
    { reason: 'Machine BD', count: 18, cumPercent: 69 },
    { reason: 'Quality Hold', count: 12, cumPercent: 87 },
    { reason: 'Setup Delay', count: 5, cumPercent: 95 },
    { reason: 'Other', count: 3, cumPercent: 100 },
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
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Production', 58089], ['Production Shortfall', 842], ['Current WIP', 142], ['Rollover Quantity', 85]] },
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
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2', 'Sub-Assy'], value: activeLine, onChange: setActiveLine },
          { type: 'dropdown', label: 'Model Family', options: ['All', 'Pulsar', 'Dominar', 'Avenger'], value: activeModel, onChange: setActiveModel }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Production" value={kpis.totalProd.toLocaleString()} trend={12.4} subtitle="vs Last Month 51,680" />
          <StatCard title="Production Shortfall" value={kpis.shortfall.toLocaleString()} trend={-4.2} subtitle="vs Last Month 879" />
          <StatCard title="Current WIP" value={kpis.wip.toLocaleString()} trend={1.8} subtitle="vs Last Month 139" />
          <StatCard title="Rollover Quantity" value={kpis.rollover.toLocaleString()} trend={-15.3} subtitle="vs Last Month 100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Hourly Plan vs Actual</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" name="Actual Prod." fill="#0ea5e9" />
                  <Line type="stepAfter" dataKey="plan" name="Hourly Target" stroke="#ef4444" strokeWidth={2} dot={false} />
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














