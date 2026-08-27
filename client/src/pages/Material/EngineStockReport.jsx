import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Cpu } from 'lucide-react';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function EngineStockReport() {
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const filters = [
    { type: 'dropdown', label: 'Model Family', options: ['All', 'Pulsar', 'Dominar', 'Avenger'], value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: ['All', 'Pulsar 150', 'Dominar 400'], value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: ['All', 'UG5', 'UG6'], value: sku, onChange: setSku },
  ];

  const pieData = [
    { family: 'Pulsar', name: 'Pulsar 150', value: 45 },
    { family: 'Dominar', name: 'Dominar 400', value: 20 },
    { family: 'Avenger', name: 'Avenger 220', value: 35 },
  ].filter(d => 
    (modelFamily === 'All' || d.family === modelFamily) &&
    (model === 'All' || d.name === model)
  );

  const totalEngines = pieData.reduce((sum, d) => sum + d.value, 0);
  const modelsCount = pieData.length;

  const tableData = [
    { modelFamily: 'Pulsar', model: 'Pulsar 150', sku: 'UG5', engineNo: 'ENG-1001', dateTime: '2023-10-01 08:30' },
    { modelFamily: 'Dominar', model: 'Dominar 400', sku: 'UG6', engineNo: 'ENG-2001', dateTime: '2023-10-01 09:15' },
    { modelFamily: 'Avenger', model: 'Avenger 220', sku: 'STD', engineNo: 'ENG-3001', dateTime: '2023-10-01 10:00' },
    { modelFamily: 'Pulsar', model: 'Pulsar 150', sku: 'UG5', engineNo: 'ENG-1002', dateTime: '2023-10-01 10:30' },
    { modelFamily: 'Dominar', model: 'Dominar 400', sku: 'UG6', engineNo: 'ENG-2002', dateTime: '2023-10-01 11:00' },
  ].filter(d => 
    (modelFamily === 'All' || d.modelFamily === modelFamily) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku)
  );

  const columns = [
    { header: 'Model Family', accessor: 'modelFamily' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Date/Time', accessor: 'dateTime' },
  ];

  const exportToExcel = () => {
    exportToXLSX('EngineStockReport.xlsx', [
      { name: 'Summary', rows: [
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
