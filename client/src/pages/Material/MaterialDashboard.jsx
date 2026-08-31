import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Package } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/material/dashboard?period=${period}&shift=${shift}&line=${line}&model=${model}&sku=${sku}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, model, sku]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const defaultTable = [
    { id: 'BAJ-ENG-101', material: 'Cylinder Block 150cc', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', location: 'Main Store', currentStock: 120, minLevel: 25, maxLevel: 150, status: 'Safe', category: 'Engine Parts' },
    { id: 'BAJ-ENG-102', material: 'Piston Assembly 57mm', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', location: 'Line 1', currentStock: 18, minLevel: 25, maxLevel: 150, status: 'Critical', category: 'Pistons' },
    { id: 'BAJ-ENG-103', material: 'Cylinder Head DOHC', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', location: 'Line 2', currentStock: 85, minLevel: 25, maxLevel: 150, status: 'Safe', category: 'Engine Parts' },
    { id: 'BAJ-ENG-104', material: 'Crankshaft & Connecting Rod', line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', location: 'Main Store', currentStock: 64, minLevel: 25, maxLevel: 150, status: 'Safe', category: 'Transmission' },
    { id: 'BAJ-ENG-105', material: 'Camshaft Timing Gear Set', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', location: 'Line 1', currentStock: 12, minLevel: 25, maxLevel: 150, status: 'Critical', category: 'Gears' },
    { id: 'BAJ-ENG-108', material: 'Spark Plug Twin-Spark', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', location: 'Main Store', currentStock: 450, minLevel: 100, maxLevel: 300, status: 'Excess', category: 'Electrical' }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTable;

  const tableData = rawTable.filter(d => 
    (line === 'All' || !d.line || d.line === line) &&
    (model === 'All' || !d.model || d.model === model) &&
    (sku === 'All' || !d.sku || d.sku === sku)
  );

  const criticalCount = tableData.filter(d => d.status === 'Critical').length;
  const safeCount = tableData.filter(d => d.status === 'Safe').length;
  const excessCount = tableData.filter(d => d.status === 'Excess').length;

  const kpi = {
    availability: tableData.length > 0 ? `${Math.round((safeCount / tableData.length) * 100)}%` : '0%',
    shortage: criticalCount,
    lineFeed: criticalCount === 0 && tableData.length > 0 ? 'OK' : (criticalCount > 0 ? 'Shortage Alert' : 'No Data'),
    requests: tableData.length,
    pending: 0,
    critical: criticalCount,
    safe: safeCount,
    excess: excessCount
  };

  const stockLevelData = [
    { name: 'Critical', value: kpi.critical },
    { name: 'Safe', value: kpi.safe },
    { name: 'Excess', value: kpi.excess }
  ].filter(d => d.value > 0);

  const shortageData = useMemo(() => {
    const criticalItems = tableData.filter(d => d.status === 'Critical');
    if (criticalItems.length === 0) return [{ category: 'No Shortages', count: 0 }];
    const counts = {};
    criticalItems.forEach(d => {
      const cat = d.category || d.material || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  }, [tableData]);

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      shortages: criticalCount,
      requests: tableData.length
    }));
  }, [period, shift, criticalCount, tableData.length]);

  const columns = [
    { header: 'Part ID', accessor: 'id' },
    { header: 'Material Name', accessor: 'material' },
    { header: 'Store Location', accessor: 'location' },
    { header: 'Available Qty', accessor: 'currentStock', render: (val, row) => val || row?.available || 0 },
    { header: 'Min Stock Level', accessor: 'minLevel' },
    { header: 'Max Stock Level', accessor: 'maxLevel' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const colors = {
        'Critical': 'bg-red-100 text-red-700',
        'Safe': 'bg-green-100 text-green-700',
        'Excess': 'bg-yellow-100 text-yellow-700'
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[val] || 'bg-slate-100 text-slate-700'}`}>{val || 'Safe'}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('MaterialDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Material Availability %', kpi.availability],
        ['Material Shortage Count', kpi.shortage],
        ['Line Feed Status', kpi.lineFeed],
        ['Material Request Count', kpi.requests],
        ['Pending Requests', kpi.pending],
        ['Stock Level', `${kpi.critical} C / ${kpi.safe} S / ${kpi.excess} E`],
      ]},
      { name: 'Shortages Details', rows: [['Part ID', 'Material', 'Location', 'Available Qty', 'Min Stock Level', 'Status'], ...tableData.map(d => [d.id, d.material, d.location, d.currentStock || d.available, d.minLevel, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Dashboard" icon={Package} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Availability %" value={kpi.availability} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Shortage Count" value={kpi.shortage} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Line Feed Status" value={kpi.lineFeed} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Request Count" value={kpi.requests} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending Requests" value={kpi.pending} color="orange" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Stock Level" value={`${kpi.critical} C / ${kpi.safe} S / ${kpi.excess} E`} color="purple" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Stock Level Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockLevelData.length > 0 ? stockLevelData : [{ name: 'Safe', value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shortageData.length > 0 ? shortageData : [{ category: 'No Shortages', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Requests & Shortages Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke={COLORS[0]} name="Requests" />
                  <Line type="monotone" dataKey="shortages" stroke={COLORS[4]} name="Shortages" />
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
