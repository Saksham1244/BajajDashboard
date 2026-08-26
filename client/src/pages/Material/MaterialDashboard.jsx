import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Package } from 'lucide-react';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialDashboard() {
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

  const stockLevelData = [
    { name: 'Critical', value: 12 },
    { name: 'Safe', value: 85 },
    { name: 'Excess', value: 18 }
  ];

  const shortageData = [
    { category: 'Engine Parts', count: 5 },
    { category: 'Chassis Parts', count: 3 },
    { category: 'Electrical', count: 8 },
    { category: 'Fasteners', count: 2 },
  ];

  const tableData = [
    { material: 'MAT-001', available: 10, minLevel: 20, status: 'Critical' },
    { material: 'MAT-002', available: 50, minLevel: 15, status: 'Safe' },
    { material: 'MAT-003', available: 120, minLevel: 20, status: 'Excess' },
    { material: 'MAT-004', available: 5, minLevel: 10, status: 'Critical' },
    { material: 'MAT-005', available: 30, minLevel: 25, status: 'Safe' },
  ];

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Available Qty', accessor: 'available' },
    { header: 'Min Level', accessor: 'minLevel' },
    { header: 'Status', accessor: 'status', render: (val) => {
      let color = 'text-green-600 bg-green-100';
      if(val === 'Critical') color = 'text-red-600 bg-red-100';
      if(val === 'Excess') color = 'text-yellow-600 bg-yellow-100';
      return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{val}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('MaterialDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Material Availability %', '94%'],
        ['Material Shortage Count', '15'],
        ['Line Feed Status', 'OK'],
        ['Material Request Count', '42'],
        ['Pending Requests', '5'],
        ['Stock Level (C/S/E)', '12/85/18']
      ]},
      { name: 'Stock Status', rows: [
        ['Material', 'Available', 'Min Level', 'Status'],
        ...tableData.map(d => [d.material, d.available, d.minLevel, d.status])
      ]},
      { name: 'Shortage Details', rows: [
        ['Category', 'Count'],
        ...shortageData.map(d => [d.category, d.count])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Dashboard" icon={Package} onExcelClick={exportToExcel} filters={filters} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard title="Availability %" value="94%" color="bg-blue-100" />
          <StatCard title="Shortage Count" value="15" color="bg-red-100" />
          <StatCard title="Line Feed Status" value="OK" color="bg-green-100" />
          <StatCard title="Request Count" value="42" color="bg-blue-100" />
          <StatCard title="Pending Requests" value="5" color="bg-orange-100" />
          <StatCard title="Stock Level" value="12 C / 85 S / 18 E" color="bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Stock Level Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stockLevelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {stockLevelData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Shortage by Category</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={shortageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
