import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Boxes } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function StockStatusReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [matType, setMatType] = useState('All');
  const [location, setLocation] = useState('All');
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/material/stock?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const customFilters = [
    { type: 'dropdown', label: 'Material Type', options: ['All', 'Raw', 'WIP', 'Finished'], value: matType, onChange: setMatType },
    { type: 'dropdown', label: 'Store Location', options: ['All', 'Main Store', ...filterOptions.lines.filter(l => l !== 'All')], value: location, onChange: setLocation },
  ];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const allTableData = [
    { material: 'M-01', matType: 'Raw', location: 'Main', available: Math.round(50 * scale) || 5, minLevel: 20, maxLevel: 100, status: 'Safe' },
    { material: 'M-02', matType: 'WIP', location: 'Line-1', available: Math.round(10 * scale) || 1, minLevel: 15, maxLevel: 50, status: 'Critical' },
    { material: 'M-03', matType: 'Finished', location: 'Main', available: Math.round(120 * scale) || 10, minLevel: 100, maxLevel: 110, status: 'Excess' },
    { material: 'M-04', matType: 'Raw', location: 'Line-2', available: Math.round(8 * scale) || 1, minLevel: 10, maxLevel: 40, status: 'Critical' },
    { material: 'M-05', matType: 'Finished', location: 'Line-1', available: Math.round(30 * scale) || 3, minLevel: 15, maxLevel: 60, status: 'Safe' },
  ];

  const tableData = allTableData.filter(d =>
    (matType === 'All' || d.matType === matType) &&
    (location === 'All' || d.location === location)
  );

  const chartData = tableData.map(d => ({
    material: d.material,
    available: d.available,
    minLevel: Math.round(d.minLevel * scale) || 2
  }));

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time, idx) => ({
      time,
      stockValue: 12000 + ((idx * 350) % 3000)
    }));
  }, [period, shift]);

  const totalMaterials = Math.max(1, Math.round(115 * scale));
  const criticalCount = tableData.filter(d => d.status === 'Critical').length;
  const safeCount = tableData.filter(d => d.status === 'Safe').length;
  const excessCount = tableData.filter(d => d.status === 'Excess').length;

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Available Qty', accessor: 'available' },
    { header: 'Min Level', accessor: 'minLevel' },
    { header: 'Max Level', accessor: 'maxLevel' },
    { header: 'Status', accessor: 'status', render: (val) => {
      let color = 'text-green-600 bg-green-100';
      if(val === 'Critical') color = 'text-red-600 bg-red-100';
      if(val === 'Excess') color = 'text-yellow-600 bg-yellow-100';
      return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('StockStatusReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Materials', totalMaterials],
        ['Critical Count', criticalCount],
        ['Safe Count', safeCount],
        ['Excess Count', excessCount]
      ]},
      { name: 'Stock Details', rows: [
        ['Material', 'Available Qty', 'Min Level', 'Max Level', 'Status'],
        ...tableData.map(d => [d.material, d.available, d.minLevel, d.maxLevel, d.status])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Stock Status Report" icon={Boxes} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Materials" value={totalMaterials} color="bg-blue-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Critical Count" value={criticalCount} color="bg-red-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Safe Count" value={safeCount} color="bg-green-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Excess Count" value={excessCount} color="bg-yellow-100" />
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

