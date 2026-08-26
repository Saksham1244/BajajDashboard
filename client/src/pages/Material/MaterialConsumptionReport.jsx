import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialConsumptionReport() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const filters = [
    { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
    { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2'], value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: ['All', 'Pulsar 150', 'Dominar 400'], value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: ['All', 'UG5', 'UG6'], value: sku, onChange: setSku },
  ];

  const varianceData = [
    { material: 'Bolt M8', variance: 5.2 },
    { material: 'Gasket', variance: 3.1 },
    { material: 'O-Ring', variance: 2.8 },
    { material: 'Washer', variance: -1.5 },
    { material: 'Screw', variance: -2.2 },
  ];

  const tableData = [
    { material: 'Bolt M8', consumed: 526, expected: 500, variance: 26, variancePct: 5.2 },
    { material: 'Gasket', consumed: 103, expected: 100, variance: 3, variancePct: 3.0 },
    { material: 'O-Ring', consumed: 205, expected: 200, variance: 5, variancePct: 2.5 },
    { material: 'Washer', consumed: 98, expected: 100, variance: -2, variancePct: -2.0 },
    { material: 'Screw', consumed: 295, expected: 300, variance: -5, variancePct: -1.6 },
  ];

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Consumed Qty', accessor: 'consumed' },
    { header: 'Expected Qty', accessor: 'expected' },
    { header: 'Variance', accessor: 'variance', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-green-600 font-bold'; // negative variance = under-consumed = green
      if(val > 0) color = 'text-red-600 font-bold'; // positive variance = over-consumed = red
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
        ['Total Materials', '150'],
        ['Avg Variance %', '1.2%'],
        ['Over-consumed Count', '15'],
        ['Under-consumed Count', '8']
      ]},
      { name: 'Consumption Details', rows: [
        ['Material', 'Consumed', 'Expected', 'Variance', 'Variance %'],
        ...tableData.map(d => [d.material, d.consumed, d.expected, d.variance, d.variancePct])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Consumption Report" icon={TrendingDown} onExcelClick={exportToExcel} filters={filters} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Materials" value="150" color="bg-blue-100" />
          <StatCard title="Avg Variance %" value="1.2%" color="bg-purple-100" />
          <StatCard title="Over-consumed" value="15" color="bg-red-100" />
          <StatCard title="Under-consumed" value="8" color="bg-green-100" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Materials by Variance</h3>
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

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
