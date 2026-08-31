import { matchFilter } from '../../utils/filterUtils';
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
    fetch(`/api/material/kitting?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
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
    { kitId: 'KIT-P150-01', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', status: 'Prepared', preparedAt: '08:15', accuracy: '100%', defect: '-', operator: 'Rahul Sharma', time: '08:15' },
    { kitId: 'KIT-P150-02', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', status: 'Prepared', preparedAt: '08:45', accuracy: '100%', defect: '-', operator: 'Priya Singh', time: '08:45' },
    { kitId: 'KIT-D400-01', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', status: 'Prepared', preparedAt: '09:10', accuracy: '100%', defect: '-', operator: 'Amit Kumar', time: '09:10' },
    { kitId: 'KIT-D400-02', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', status: 'Rejected', preparedAt: '09:35', accuracy: '92%', defect: 'Missing Gasket', operator: 'Rahul Sharma', time: '09:35' },
    { kitId: 'KIT-A220-01', line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', status: 'Prepared', preparedAt: '10:00', accuracy: '100%', defect: '-', operator: 'Priya Singh', time: '10:00' },
    { kitId: 'KIT-A220-02', line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', status: 'Rejected', preparedAt: '10:20', accuracy: '90%', defect: 'Wrong Bolt Grade', operator: 'Amit Kumar', time: '10:20' }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTable;

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.model, model) &&
    matchFilter(d.sku, sku)
  );

  const preparedCount = tableData.filter(d => d.status === 'Prepared').length;
  const pendingCount = tableData.filter(d => d.status === 'Pending').length;
  const rejectedCount = tableData.filter(d => d.status === 'Rejected').length;
  const totalCount = tableData.length;
  const accuracy = totalCount > 0 ? `${((preparedCount / (preparedCount + rejectedCount || 1)) * 100).toFixed(1)}%` : '0.0%';

  const kpi = {
    planned: totalCount,
    prepared: preparedCount,
    pending: pendingCount,
    accuracy: accuracy,
    rejected: rejectedCount,
    status: totalCount > 0 ? (rejectedCount === 0 ? 'On Track' : 'Action Required') : 'No Data'
  };

  const pieData = [
    { name: 'Prepared', value: preparedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Rejected', value: rejectedCount },
  ].filter(d => d.value > 0);

  const barData = useMemo(() => {
    const counts = {};
    tableData.forEach(d => {
      if (d.status === 'Prepared') {
        const m = d.model || 'Unknown';
        counts[m] = (counts[m] || 0) + 1;
      }
    });
    const result = Object.entries(counts).map(([mod, prep]) => ({ model: mod, prepared: prep }));
    return result.length > 0 ? result : [{ model: model !== 'All' ? model : 'No Data', prepared: 0 }];
  }, [tableData, model]);

  const trendData = useMemo(() => {
    if (tableData.length === 0 && preparedCount === 0) return [];
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      kitsPrepared: preparedCount
    }));
  }, [period, shift, preparedCount, tableData.length]);

  const columns = [
    { header: 'Kit ID', accessor: 'kitId' },
    { header: 'Line', accessor: 'line' },
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
    { header: 'Defect Reason', accessor: 'defect' },
  ];

  const exportToExcel = () => {
    exportToXLSX('KittingDashboard.xlsx', [
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Kits Planned', kpi.planned],
        ['Kits Prepared', kpi.prepared],
        ['Kits Pending', kpi.pending],
        ['Kit Accuracy %', kpi.accuracy],
        ['Rejected Kits', kpi.rejected],
        ['Preparation Status', kpi.status],
      ]},
      { name: 'Kitting Status', rows: [['Status', 'Count'], ...pieData.map(d => [d.name, d.value])] },
      { name: 'Preparation by Model', rows: [['Model', 'Prepared'], ...barData.map(d => [d.model, d.prepared])] },
      { name: 'Kit Inspection Details', rows: [['Kit ID', 'Line', 'Model', 'SKU', 'Status', 'Prepared At', 'Accuracy %', 'Defect'], ...tableData.map(d => [d.kitId, d.line, d.model, d.sku, d.status, d.preparedAt, d.accuracy, d.defect])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Kitting Dashboard" icon={PackagePlus} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kits Planned" value={kpi.planned} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kits Prepared" value={kpi.prepared} color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kits Pending" value={kpi.pending} color="orange" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Kit Accuracy %" value={kpi.accuracy} color="purple" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Rejected Kits" value={kpi.rejected} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Preparation Status" value={kpi.status} color="blue" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kit Status</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData.length > 0 ? pieData : [{ name: 'Prepared', value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80}>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData.length > 0 ? barData : [{ model: 'No Data', prepared: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prepared" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kits Prepared Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.length > 0 ? trendData : [{ time: '08:00', kitsPrepared: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kitsPrepared" stroke={COLORS[2]} name="Prepared" strokeWidth={2} />
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
