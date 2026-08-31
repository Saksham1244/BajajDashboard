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
    fetch(`/api/material/stock?period=${period}&shift=${shift}&matType=${encodeURIComponent(matType)}&location=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, matType, location]);

  const customFilters = [
    { type: 'dropdown', label: 'Material Type', options: ['All', 'Raw', 'WIP', 'Finished'], value: matType, onChange: setMatType },
    { type: 'dropdown', label: 'Store Location', options: ['All', 'Main Store', ...filterOptions.lines.filter(l => l !== 'All')], value: location, onChange: setLocation },
  ];

  const tableData = (dbData?.table || []).filter(d =>
    (matType === 'All' || d.matType === matType) &&
    (location === 'All' || d.location === location)
  );

  const chartData = tableData.length > 0 ? tableData.map(d => ({
    material: d.material,
    available: d.available || 0,
    minLevel: d.minLevel || 0
  })) : [];

  const trendData = useMemo(() => {
    if (tableData.length === 0) return [];
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      stockValue: tableData.reduce((acc, d) => acc + (d.available || 0), 0)
    }));
  }, [period, shift, tableData]);

  const totalMaterials = tableData.length;
  const criticalCount = tableData.filter(d => d.status === 'Critical').length;
  const safeCount = tableData.filter(d => d.status === 'Safe').length;
  const excessCount = tableData.filter(d => d.status === 'Excess').length;

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Type', accessor: 'matType' },
    { header: 'Location', accessor: 'location' },
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
        ['Material', 'Type', 'Location', 'Available Qty', 'Min Level', 'Max Level', 'Status'],
        ...tableData.map(d => [d.material, d.matType, d.location, d.available, d.minLevel, d.maxLevel, d.status])
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

