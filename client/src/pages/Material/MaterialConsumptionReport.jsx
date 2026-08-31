import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialConsumptionReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/material/consumption?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
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
    { material: 'Cylinder Block 150cc', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', consumed: 125, expected: 120, variance: 5, variancePct: 4.2 },
    { material: 'Piston Assembly 57mm', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', consumed: 122, expected: 120, variance: 2, variancePct: 1.7 },
    { material: 'Cylinder Head DOHC', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', consumed: 80, expected: 85, variance: -5, variancePct: -5.9 },
    { material: 'Crankshaft & Connecting Rod', line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', consumed: 65, expected: 65, variance: 0, variancePct: 0.0 },
    { material: 'Camshaft Timing Gear Set', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', consumed: 88, expected: 85, variance: 3, variancePct: 3.5 },
    { material: 'Spark Plug Twin-Spark', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', consumed: 240, expected: 240, variance: 0, variancePct: 0.0 }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTable;

  const tableData = rawTable.filter(d => 
    (line === 'All' || !d.line || d.line === line) &&
    (model === 'All' || !d.model || d.model === model) &&
    (sku === 'All' || !d.sku || d.sku === sku)
  );

  const varianceData = tableData.length > 0 ? tableData.map(d => ({
    material: d.material,
    variance: d.variancePct || 0
  })) : [{ material: 'No Data', variance: 0 }];

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      expected: tableData.reduce((acc, d) => acc + (d.expected || 0), 0),
      consumed: tableData.reduce((acc, d) => acc + (d.consumed || 0), 0),
    }));
  }, [period, shift, tableData]);

  const totalMaterials = tableData.length;
  const overConsumed = tableData.filter(d => (d.variance || 0) > 0).length;
  const underConsumed = tableData.filter(d => (d.variance || 0) < 0).length;
  const totalVariancePct = tableData.length > 0
    ? (tableData.reduce((acc, d) => acc + (d.variancePct || 0), 0) / tableData.length).toFixed(1)
    : '0.0';
  const avgVariance = `${totalVariancePct}%`;

  const columns = [
    { header: 'Material', accessor: 'material' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Consumed Qty', accessor: 'consumed' },
    { header: 'Expected Qty', accessor: 'expected' },
    { header: 'Variance', accessor: 'variance', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-green-600 font-bold';
      if(val > 0) color = 'text-red-600 font-bold';
      return <span className={color}>{val > 0 ? `+${val}` : val}</span>;
    }},
    { header: 'Variance %', accessor: 'variancePct', render: (val) => {
      let color = 'text-gray-600';
      if(val < 0) color = 'text-green-600 font-bold';
      if(val > 0) color = 'text-red-600 font-bold';
      return <span className={color}>{val > 0 ? `+${val}%` : `${val}%`}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('MaterialConsumptionReport.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Total Materials', totalMaterials],
        ['Avg Variance %', avgVariance],
        ['Over-consumed Count', overConsumed],
        ['Under-consumed Count', underConsumed]
      ]},
      { name: 'Consumption Details', rows: [
        ['Material', 'Line', 'Model', 'SKU', 'Consumed', 'Expected', 'Variance', 'Variance %'],
        ...tableData.map(d => [d.material, d.line, d.model, d.sku, d.consumed, d.expected, d.variance, d.variancePct])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Consumption Report" icon={TrendingDown} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Materials" value={totalMaterials} color="bg-blue-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Variance %" value={avgVariance} color="bg-purple-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Over-consumed" value={overConsumed} color="bg-red-100" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Under-consumed" value={underConsumed} color="bg-green-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Materials by Variance</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="variance" fill={COLORS[4]} name="Variance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Consumption Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="expected" stroke={COLORS[0]} name="Expected" />
                  <Line type="monotone" dataKey="consumed" stroke={COLORS[4]} name="Consumed" />
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
