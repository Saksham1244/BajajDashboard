import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PackagePlus } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function KittingDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/material/kitting?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const tableData = dbData?.table || [];

  const kpi = {
    planned: dbData?.kpis?.planned || tableData.length,
    prepared: dbData?.kpis?.prepared || tableData.filter(d => d.status === 'Prepared').length,
    pending: dbData?.kpis?.pending || tableData.filter(d => d.status === 'Pending').length,
    accuracy: dbData?.kpis?.accuracy || (tableData.length > 0 ? '100.0%' : '0.0%'),
    rejected: dbData?.kpis?.rejected || tableData.filter(d => d.status === 'Rejected').length,
    status: dbData?.kpis?.status || (tableData.length > 0 ? 'On Track' : 'No Data')
  };

  const pieData = [
    { name: 'Prepared', value: kpi.prepared },
    { name: 'Pending', value: kpi.pending },
    { name: 'Rejected', value: kpi.rejected },
  ].filter(d => d.value > 0);

  const barData = dbData?.barData || [
    { model: 'Pulsar 150', prepared: kpi.prepared },
  ].filter(d => d.prepared > 0);

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      kitsPrepared: kpi.prepared
    }));
  }, [period, shift, kpi.prepared]);

  const columns = [
    { header: 'Kit ID', accessor: 'kitId' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Status', accessor: 'status', render: (val) => {
      let color = 'text-gray-600 bg-gray-100';
      if(val === 'Prepared') color = 'text-green-600 bg-green-100';
      if(val === 'Pending') color = 'text-orange-600 bg-orange-100';
      if(val === 'Rejected') color = 'text-red-600 bg-red-100';
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
    }},
    { header: 'Prepared At', accessor: 'preparedAt' },
    { header: 'Accuracy %', accessor: 'accuracy' },
    { header: 'Defect', accessor: 'defect' },
  ];

  const exportToExcel = () => {
    exportToXLSX('KittingDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Kits Planned', kpi.planned],
        ['Kits Prepared', kpi.prepared],
        ['Kits Pending', kpi.pending],
        ['Kit Accuracy %', kpi.accuracy],
        ['Rejected Kits', kpi.rejected],
        ['Preparation Status', kpi.status]
      ]},
      { name: 'Kit Status', rows: [
        ['Status', 'Count'],
        ...pieData.map(d => [d.name, d.value])
      ]},
      { name: 'Kit Details', rows: [
        ['Kit ID', 'Model', 'SKU', 'Status', 'Prepared At', 'Accuracy', 'Defect'],
        ...tableData.map(d => [d.kitId, d.model, d.sku, d.status, d.preparedAt, d.accuracy, d.defect])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Kitting Dashboard" icon={PackagePlus} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kits Planned" value={kpi.planned} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kits Prepared" value={kpi.prepared} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kits Pending" value={kpi.pending} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kit Accuracy %" value={kpi.accuracy} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Rejected Kits" value={kpi.rejected} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Preparation Status" value={kpi.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kit Status</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80}>
                    {pieData.map((entry, index) => <Cell key={index} fill={index === 0 ? COLORS[2] : index === 1 ? COLORS[1] : COLORS[4]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="top" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Preparation by Model</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prepared" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kits Prepared Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kitsPrepared" stroke={COLORS[2]} name="Prepared" />
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
