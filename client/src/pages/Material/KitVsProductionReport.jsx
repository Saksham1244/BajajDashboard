import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function KitVsProductionReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2'], value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: ['All', 'Pulsar 150', 'Dominar 400'], value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: ['All', 'UG5', 'UG6'], value: sku, onChange: setSku },
  ];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const chartData = [
    { model: 'Pulsar 150', kits: Math.round(120 * scale), production: Math.round(115 * scale) },
    { model: 'Dominar 400', kits: Math.round(60 * scale), production: Math.round(65 * scale) },
    { model: 'Avenger 220', kits: Math.round(80 * scale), production: Math.round(80 * scale) },
  ].filter(d => model === 'All' || d.model === model);

  const kpi = {
    kits: chartData.reduce((acc, d) => acc + d.kits, 0),
    production: chartData.reduce((acc, d) => acc + d.production, 0)
  };
  const gap = kpi.kits - kpi.production;
  const gapPercent = kpi.kits > 0 ? Math.round((gap / kpi.kits) * 100) : 0;

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map(time => ({
      time,
      kits: Math.floor(Math.random() * 20 * scale) + Math.round(15 * scale),
      production: Math.floor(Math.random() * 20 * scale) + Math.round(14 * scale)
    }));
  }, [period, shift]);

  const tableData = chartData.map(d => ({
    ...d,
    gap: d.kits - d.production
  }));

  const columns = [
    { header: 'Model', accessor: 'model' },
    { header: 'Kits Prepared', accessor: 'kits' },
    { header: 'Production Done', accessor: 'production' },
    { header: 'Gap', accessor: 'gap', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-red-600 font-bold';
      if(val > 0) color = 'text-green-600 font-bold';
      return <span className={color}>{val}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('KitVsProductionReport.xlsx', [
      { name: 'KPI', rows: [
        ['Total Kits', kpi.kits],
        ['Total Production', kpi.production],
        ['Gap Count', gap],
        ['Gap %', gapPercent + '%']
      ]},
      { name: 'Kit vs Production', rows: [
        ['Model', 'Kits Prepared', 'Production Done', 'Gap'],
        ...tableData.map(d => [d.model, d.kits, d.production, d.gap])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Kit vs Production Report" icon={BarChart3} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Kits"  value={kpi.kits} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Production"  value={kpi.production} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Gap Count"  value={gap} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Gap %"  value={`${gapPercent}%`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kits vs Production by Model</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kits" fill={COLORS[0]} name="Kits Prepared" />
                  <Bar dataKey="production" fill={COLORS[2]} name="Production Done" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kits vs Production Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kits" stroke={COLORS[0]} name="Kits Prepared" />
                  <Line type="monotone" dataKey="production" stroke={COLORS[2]} name="Production Done" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
