import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Cpu } from 'lucide-react';

import useFilterOptions from '../../hooks/useFilterOptions';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function EngineStockReport() {
  const filterOptions = useFilterOptions();
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch('/api/material/engine-stock')
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, []);

  const filters = [
    { type: 'dropdown', label: 'Model Family', options: filterOptions.modelFamilies, value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const tableData = (dbData?.table || []).filter(d => 
    (modelFamily === 'All' || d.modelFamily === modelFamily) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku)
  );

  const pieData = (dbData?.pie || []).filter(d => 
    (modelFamily === 'All' || d.family === modelFamily) &&
    (model === 'All' || d.name === model)
  );

  const totalEngines = tableData.length;
  const modelsCount = pieData.length;

  const columns = [
    { header: 'Model Family', accessor: 'modelFamily' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Date/Time', accessor: 'dateTime' },
  ];

  const exportToExcel = () => {
    exportToXLSX('EngineStockReport.xlsx', [
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Total Engine Count', totalEngines],
        ['Models Count', modelsCount],
        ['Oldest Entry Age', '2 Days']
      ]},
      { name: 'Engine Details', rows: [
        ['Model Family', 'Model', 'SKU', 'Engine No', 'DateTime'],
        ...tableData.map(d => [d.modelFamily, d.model, d.sku, d.engineNo, d.dateTime])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Engine Stock Status" icon={Cpu} onExcelClick={exportToExcel} filters={filters} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard title="Total Engine Count"  value={totalEngines} />
          <StatCard title="Models Count"  value={modelsCount} />
          <StatCard title="Oldest Entry Age"  value="2 Days" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Distribution by Model</h3>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
