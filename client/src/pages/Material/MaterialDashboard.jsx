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

  const tableData = dbData?.table || [];

  const kpi = {
    availability: dbData?.kpis?.kitFulfillment || (tableData.length > 0 ? '100%' : '0%'),
    shortage: dbData?.kpis?.criticalShortages || tableData.filter(d => d.status === 'Critical').length,
    lineFeed: tableData.length > 0 ? 'OK' : 'No Data',
    requests: dbData?.kpis?.totalInventory || tableData.length,
    pending: 0,
    critical: tableData.filter(d => d.status === 'Critical').length,
    safe: tableData.filter(d => d.status === 'Safe').length,
    excess: tableData.filter(d => d.status === 'Excess').length
  };

  const stockLevelData = [
    { name: 'Critical', value: kpi.critical },
    { name: 'Safe', value: kpi.safe },
    { name: 'Excess', value: kpi.excess }
  ].filter(d => d.value > 0);

  const shortageData = dbData?.shortages || [];

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      shortages: kpi.shortage,
      requests: tableData.length
    }));
  }, [period, shift, kpi.shortage, tableData.length]);

  const columns = [
    { header: 'Material ID / Name', accessor: 'material' },
    { header: 'Available Qty', accessor: 'available' },
    { header: 'Min Stock Level', accessor: 'minLevel' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const colors = {
        'Critical': 'bg-red-100 text-red-700',
        'Safe': 'bg-green-100 text-green-700',
        'Excess': 'bg-yellow-100 text-yellow-700'
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[val]}`}>{val}</span>;
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
      { name: 'Shortages Details', rows: [['Material', 'Available Qty', 'Min Stock Level', 'Status'], ...tableData.map(d => [d.material, d.available, d.minLevel, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Dashboard" icon={Package} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Availability %" value={kpi.availability} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Shortage Count" value={kpi.shortage} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Line Feed Status" value={kpi.lineFeed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Request Count" value={kpi.requests} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending Requests" value={kpi.pending} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Stock Level" value={`${kpi.critical} C / ${kpi.safe} S / ${kpi.excess} E`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Requests & Shortages Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
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
