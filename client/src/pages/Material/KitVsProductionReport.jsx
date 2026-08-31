import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function KitVsProductionReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/material/kitting?period=${period}&shift=${shift}&line=${line}&model=${model}&sku=${sku}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, model, sku]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const defaultRawData = [
    { line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', kits: 150, production: 145 },
    { line: 'Line 2', model: 'Dominar 400', sku: 'UG6', kits: 85, production: 80 },
    { line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', kits: 60, production: 65 },
    { line: 'Line 2', model: 'Pulsar 150', sku: 'SKU2', kits: 45, production: 40 },
    { line: 'Line 1', model: 'Dominar 400', sku: 'SKU1', kits: 70, production: 72 },
    { line: 'Line 2', model: 'Avenger 220', sku: 'SKU2', kits: 55, production: 50 },
  ];

  const rawData = useMemo(() => {
    if (dbData?.table && dbData.table.length > 0) {
      // Map dbData items to kits vs production
      const modelMap = {};
      dbData.table.forEach(d => {
        const key = `${d.line || 'Line 1'}_${d.model || 'Pulsar 150'}_${d.sku || 'UG6'}`;
        if (!modelMap[key]) {
          modelMap[key] = { line: d.line || 'Line 1', model: d.model || 'Pulsar 150', sku: d.sku || 'UG6', kits: 0, production: 0 };
        }
        if (d.status === 'Prepared') modelMap[key].kits += 1;
        modelMap[key].production += 1;
      });
      const arr = Object.values(modelMap);
      return arr.length > 0 ? arr : defaultRawData;
    }
    return defaultRawData;
  }, [dbData]);

  const filteredItems = useMemo(() => {
    return rawData.filter(d => 
      (line === 'All' || !d.line || d.line === line) &&
      (model === 'All' || !d.model || d.model === model) &&
      (sku === 'All' || !d.sku || d.sku === sku)
    );
  }, [rawData, line, model, sku]);

  const chartData = useMemo(() => {
    const map = {};
    filteredItems.forEach(d => {
      if (!map[d.model]) {
        map[d.model] = { model: d.model, kits: 0, production: 0 };
      }
      map[d.model].kits += d.kits;
      map[d.model].production += d.production;
    });
    const res = Object.values(map);
    return res.length > 0 ? res : [{ model: model !== 'All' ? model : 'No Data', kits: 0, production: 0 }];
  }, [filteredItems, model]);

  const kpi = {
    kits: filteredItems.reduce((acc, d) => acc + (d.kits || 0), 0),
    production: filteredItems.reduce((acc, d) => acc + (d.production || 0), 0)
  };
  const gap = kpi.kits - kpi.production;
  const gapPercent = kpi.kits > 0 ? Math.round((gap / kpi.kits) * 100) : 0;

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      kits: kpi.kits,
      production: kpi.production
    }));
  }, [period, shift, kpi]);

  const tableData = filteredItems.map(d => ({
    line: d.line,
    model: d.model,
    sku: d.sku,
    kits: d.kits,
    production: d.production,
    gap: d.kits - d.production,
    variance: d.kits > 0 ? `${Math.round(((d.kits - d.production) / d.kits) * 100)}%` : '0%'
  }));

  const columns = [
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Kits Prepared', accessor: 'kits' },
    { header: 'Production Done', accessor: 'production' },
    { header: 'Gap', accessor: 'gap', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-red-600 font-bold';
      if(val > 0) color = 'text-green-600 font-bold';
      return <span className={color}>{val}</span>;
    }},
    { header: 'Variance %', accessor: 'variance' }
  ];

  const exportToExcel = () => {
    exportToXLSX('KitVsProductionReport.xlsx', [
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Total Kits', kpi.kits],
        ['Total Production', kpi.production],
        ['Gap Count', gap],
        ['Gap %', gapPercent + '%']
      ]},
      { name: 'Kit vs Production', rows: [
        ['Line', 'Model', 'SKU', 'Kits Prepared', 'Production Done', 'Gap', 'Variance %'],
        ...tableData.map(d => [d.line, d.model, d.sku, d.kits, d.production, d.gap, d.variance])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Kit vs Production Report" icon={BarChart3} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Kits"  value={kpi.kits} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Production"  value={kpi.production} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Gap Count"  value={gap} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Gap %"  value={`${gapPercent}%`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kits vs Production by Model</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kits" fill={COLORS[0]} name="Kits Prepared" />
                  <Bar dataKey="production" fill={COLORS[2]} name="Production Done" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Kits vs Production Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kits" stroke={COLORS[0]} name="Kits Prepared" />
                  <Line type="monotone" dataKey="production" stroke={COLORS[2]} name="Production Done" />
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
