import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Boxes } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function StockStatusReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [matType, setMatType] = useState('All');
  const [location, setLocation] = useState('All');
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/material/stock?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const customFilters = [
    { type: 'dropdown', label: 'Material Type', options: ['All', 'Raw', 'WIP', 'Finished'], value: matType, onChange: setMatType },
    { type: 'dropdown', label: 'Store Location', options: ['All', 'Main', 'Line-1', 'Line-2'], value: location, onChange: setLocation },
  ];

  const chartData = [
    { material: 'M-01', available: 50, minLevel: 20 },
    { material: 'M-02', available: 10, minLevel: 15 },
    { material: 'M-03', available: 120, minLevel: 100 },
    { material: 'M-04', available: 8, minLevel: 10 },
  ];

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map(time => ({
      time,
      stockValue: Math.floor(Math.random() * 5000) + 10000
    }));
  }, [period, shift]);

  const tableData = dbData?.table || [
    { material: 'M-01', available: 50, minLevel: 20, maxLevel: 100, status: 'Safe' },
    { material: 'M-02', available: 10, minLevel: 15, maxLevel: 50, status: 'Critical' },
    { material: 'M-03', available: 120, minLevel: 100, maxLevel: 110, status: 'Excess' },
    { material: 'M-04', available: 8, minLevel: 10, maxLevel: 40, status: 'Critical' },
    { material: 'M-05', available: 30, minLevel: 15, maxLevel: 60, status: 'Safe' },
  ];

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Available Qty', accessor: 'available' },
    { header: 'Min Level', accessor: 'minLevel' },
    { header: 'Max Level', accessor: 'maxLevel' },
    { header: 'Status', accessor: 'status', render: (val) => {
      let color = 'text-green-600 bg-green-100';
      if(val === 'Critical') color = 'text-red-600 bg-red-100';
      if(val === 'Excess') color = 'text-yellow-600 bg-yellow-100';
      return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{val}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('StockStatusReport.xlsx', [
      { name: 'KPI', rows: [
        ['Total Materials', dbData?.kpis?.totalMaterials || '115'],
        ['Critical Count', dbData?.kpis?.criticalCount || '12'],
        ['Safe Count', dbData?.kpis?.safeCount || '85'],
        ['Excess Count', dbData?.kpis?.excessCount || '18']
      ]},
      { name: 'Stock Details', rows: [
        ['Material', 'Available Qty', 'Min Level', 'Max Level', 'Status'],
        ...tableData.map(d => [d.material, d.available, d.minLevel, d.maxLevel, d.status])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Stock Status Report" icon={Boxes} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Materials" value={dbData?.kpis?.totalMaterials || "115"} color="bg-blue-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Critical Count" value={dbData?.kpis?.criticalCount || "12"} color="bg-red-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Safe Count" value={dbData?.kpis?.safeCount || "85"} color="bg-green-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Excess Count" value={dbData?.kpis?.excessCount || "18"} color="bg-yellow-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Stock Level by Material</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="available" stackId="a" fill={COLORS[2]} name="Available" />
                  <Bar dataKey="minLevel" stackId="b" fill={COLORS[1]} name="Min Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Stock Value Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stockValue" stroke={COLORS[3]} name="Stock Value ($)" />
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

