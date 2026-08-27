import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialConsumptionReport() {
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

  const allTableData = [
    { material: 'Bolt M8', line: 'Line 1', model: 'Pulsar 150', sku: 'UG5', consumed: Math.round(526 * scale), expected: Math.round(500 * scale), variance: Math.round(26 * scale), variancePct: 5.2 },
    { material: 'Gasket', line: 'Line 1', model: 'Dominar 400', sku: 'UG6', consumed: Math.round(103 * scale), expected: Math.round(100 * scale), variance: Math.round(3 * scale), variancePct: 3.0 },
    { material: 'O-Ring', line: 'Line 2', model: 'Pulsar 150', sku: 'UG5', consumed: Math.round(205 * scale), expected: Math.round(200 * scale), variance: Math.round(5 * scale), variancePct: 2.5 },
    { material: 'Washer', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', consumed: Math.round(98 * scale), expected: Math.round(100 * scale), variance: Math.round(-2 * scale), variancePct: -2.0 },
    { material: 'Screw', line: 'Line 1', model: 'Pulsar 150', sku: 'UG5', consumed: Math.round(295 * scale), expected: Math.round(300 * scale), variance: Math.round(-5 * scale), variancePct: -1.6 },
  ];

  const tableData = allTableData.filter(d => 
    (line === 'All' || d.line === line) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku)
  );

  const varianceData = tableData.map(d => ({
    material: d.material,
    variance: d.variancePct
  }));

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map(time => ({
      time,
      expected: Math.floor(Math.random() * 100 * scale) + Math.round(200 * scale),
      consumed: Math.floor(Math.random() * 100 * scale) + Math.round(200 * scale),
    }));
  }, [period, shift, scale]);

  const totalMaterials = Math.max(1, Math.round(150 * scale));
  const overConsumed = Math.max(0, Math.round(15 * scale));
  const underConsumed = Math.max(0, Math.round(8 * scale));
  const avgVariance = '+1.2%';

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Consumed Qty', accessor: 'consumed' },
    { header: 'Expected Qty', accessor: 'expected' },
    { header: 'Variance', accessor: 'variance', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-green-600 font-bold';
      if(val > 0) color = 'text-red-600 font-bold';
      return <span className={color}>{val > 0 ? `+${val}` : val}</span>;
    }},
    { header: 'Variance %', accessor: 'variancePct', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-green-600 font-bold';
      if(val > 0) color = 'text-red-600 font-bold';
      return <span className={color}>{val > 0 ? `+${val}%` : `${val}%`}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('MaterialConsumptionReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Materials', totalMaterials],
        ['Avg Variance %', avgVariance],
        ['Over-consumed Count', overConsumed],
        ['Under-consumed Count', underConsumed]
      ]},
      { name: 'Consumption Details', rows: [
        ['Material', 'Consumed', 'Expected', 'Variance', 'Variance %'],
        ...tableData.map(d => [d.material, d.consumed, d.expected, d.variance, d.variancePct])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Consumption Report" icon={TrendingDown} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Materials" value={totalMaterials} color="bg-blue-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Variance %" value={avgVariance} color="bg-purple-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Over-consumed" value={overConsumed} color="bg-red-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Under-consumed" value={underConsumed} color="bg-green-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Materials by Variance</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="variance" fill={COLORS[4]} name="Variance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Consumption Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="expected" stroke={COLORS[0]} name="Expected" />
                  <Line type="monotone" dataKey="consumed" stroke={COLORS[4]} name="Consumed" />
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
