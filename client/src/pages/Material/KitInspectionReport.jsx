import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PackageSearch } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function KitInspectionReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
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
    { kitId: 'KIT-P150-01', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', status: 'OK', defect: '-', operator: 'Rahul Sharma', time: '08:30' },
    { kitId: 'KIT-P150-02', line: 'Line 1', model: 'Pulsar 150', sku: 'UG6', status: 'OK', defect: '-', operator: 'Priya Singh', time: '09:10' },
    { kitId: 'KIT-D400-01', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', status: 'OK', defect: '-', operator: 'Amit Kumar', time: '09:40' },
    { kitId: 'KIT-D400-02', line: 'Line 2', model: 'Dominar 400', sku: 'UG6', status: 'NOK', defect: 'Missing Gasket', operator: 'Rahul Sharma', time: '10:15' },
    { kitId: 'KIT-A220-01', line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', status: 'OK', defect: '-', operator: 'Priya Singh', time: '10:50' },
    { kitId: 'KIT-A220-02', line: 'Line 1', model: 'Avenger 220', sku: 'SKU1', status: 'NOK', defect: 'Wrong Bolt Grade', operator: 'Amit Kumar', time: '11:20' }
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTable;

  const tableData = rawTable.filter(d => 
    (line === 'All' || !d.line || d.line === line) &&
    (model === 'All' || !d.model || d.model === model) &&
    (sku === 'All' || !d.sku || d.sku === sku)
  );

  const okCount = tableData.filter(d => d.status === 'OK' || d.status === 'Prepared').length;
  const nokCount = tableData.filter(d => d.status === 'NOK' || d.status === 'Rejected').length;
  const totalInspected = tableData.length;
  const passRate = totalInspected > 0 ? `${((okCount / totalInspected) * 100).toFixed(1)}%` : '0.0%';

  const kpi = {
    total: totalInspected,
    ok: okCount,
    nok: nokCount,
    passRate: passRate
  };

  const defectData = useMemo(() => {
    const counts = {};
    tableData.filter(d => d.defect && d.defect !== '-').forEach(d => {
      counts[d.defect] = (counts[d.defect] || 0) + 1;
    });
    const result = Object.entries(counts).map(([defect, count]) => ({ defect, count }));
    return result.length > 0 ? result : [{ defect: 'No Defects', count: 0 }];
  }, [tableData]);

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      inspected: totalInspected,
      defects: nokCount
    }));
  }, [period, shift, totalInspected, nokCount]);

  const columns = [
    { header: 'Kit ID', accessor: 'kitId' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const color = val === 'OK' || val === 'Prepared' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
    }},
    { header: 'Defect Reason', accessor: 'defect' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Time', accessor: 'time' },
  ];

  const exportToExcel = () => {
    exportToXLSX('KitInspectionReport.xlsx', [
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Total Inspected', kpi.total],
        ['OK', kpi.ok],
        ['NOK', kpi.nok],
        ['Pass Rate %', kpi.passRate]
      ]},
      { name: 'Inspection Details', rows: [
        ['Kit ID', 'Line', 'Model', 'SKU', 'Status', 'Defect', 'Operator', 'Time'],
        ...tableData.map(d => [d.kitId, d.line, d.model, d.sku, d.status, d.defect, d.operator, d.time])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Kit Inspection Report" icon={PackageSearch} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Inspected"  value={kpi.total} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="OK"  value={kpi.ok} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="NOK"  value={kpi.nok} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pass Rate %"  value={kpi.passRate} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Defect Count by Type</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={defectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="defect" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={COLORS[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Inspection Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inspected" stroke={COLORS[0]} name="Inspected" />
                  <Line type="monotone" dataKey="defects" stroke={COLORS[4]} name="Defects" />
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
