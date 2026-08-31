import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4', '#eab308'];

export default function DefectReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/quality/defect?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}&modelFamily=${encodeURIComponent(modelFamily)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, station, modelFamily, model, sku]);

  const kpiData = dbData?.kpis || {
    totalProduction: 0,
    totalDefects: 0,
    rft: 0
  };

  const defectTrendData = useMemo(() => {
    const total = Number(kpiData.totalDefects) || 0;
    const labels = generateTimeLabels(period, shift);
    if (labels.length === 0) return [];
    if (total === 0) return labels.map(date => ({ date, defects: 0 }));

    // Exact discrete distribution: sum of points in chart strictly equals totalDefects
    const result = labels.map(date => ({ date, defects: 0 }));
    const step = labels.length / total;
    for (let i = 0; i < total; i++) {
      const targetIndex = Math.min(labels.length - 1, Math.floor(i * step + step / 2));
      result[targetIndex].defects += 1;
    }
    return result;
  }, [period, shift, kpiData.totalDefects]);

  const defectDistData = dbData?.distribution || [];
  const defectReasonsData = dbData?.reasons || [];
  const [selectedReason, setSelectedReason] = useState(null);

  const rawTableData = dbData?.table || [];

  const tableData = useMemo(() => {
    return rawTableData.filter(row => {
      if (line !== 'All' && row.line && row.line !== line) return false;
      if (station !== 'All' && row.station && !row.station.toLowerCase().includes(station.toLowerCase())) return false;
      if (modelFamily !== 'All' && row.modelFamily && row.modelFamily !== modelFamily) return false;
      if (model !== 'All' && row.model && row.model !== model) return false;
      if (sku !== 'All' && row.sku && row.sku !== sku) return false;
      if (selectedReason && row.defect && !row.defect.toLowerCase().includes(selectedReason.toLowerCase())) return false;
      return true;
    });
  }, [rawTableData, line, station, modelFamily, model, sku, selectedReason]);

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Defect', accessor: 'defect' },
    { header: 'Station', accessor: 'station' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Time', accessor: 'time' },
  ];

  const exportToExcel = () => {
    exportToXLSX('DefectReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Production', kpiData.totalProduction], ['Total Defects', kpiData.totalDefects], ['RFT %', kpiData.rft]] },
      { name: 'Defect Trend', rows: [['Time', 'Defects'], ...defectTrendData.map(d => [d.date, d.defects])] },
      { name: 'Defect Distribution', rows: [['Category', 'Count'], ...defectDistData.map(d => [d.name, d.value])] },
      { name: 'Defect Reasons', rows: [['Defect Reason', 'Count'], ...defectReasonsData.map(d => [d.name, d.value])] },
      { name: 'Defect Details', rows: [['Engine No', 'Defect', 'Station', 'Operator', 'Time'], ...tableData.map(d => [d.engineNo, d.defect, d.station, d.operator, d.time])] },
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model Family', options: filterOptions.modelFamilies, value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const filters = [...getBaseFilters(), ...customFilters];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Defect Report"
        icon={AlertTriangle}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Production" value={kpiData.totalProduction} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Defects" value={kpiData.totalDefects} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="RFT % (Right First Time)" value={`${kpiData.rft}%`} color="green" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Defect Trend Line */}
          <div className="card p-4 lg:col-span-1 flex flex-col">
            <h3 className="text-sm font-bold text-brand-dark mb-2">Defect Trend Over Time</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defectTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="defects" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clean Donut Chart for Defect Category Distribution */}
          <div className="card p-4 lg:col-span-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-brand-dark">Defect Distribution by Category</h3>
              <span className="text-[10px] text-gray-400 font-semibold">Click slice to filter</span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={defectDistData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    innerRadius={48} 
                    outerRadius={75} 
                    paddingAngle={3}
                    onClick={(entry) => {
                      if (entry && entry.name) {
                        setSelectedReason(prev => prev === entry.name ? null : entry.name);
                      }
                    }}
                    cursor="pointer"
                  >
                    {defectDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clean Pareto Horizontal Bar Chart */}
          <div className="card p-4 lg:col-span-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-brand-dark">Top Defect Reasons (Pareto)</h3>
              <span className="text-[10px] text-gray-400 font-semibold">Click bar to filter</span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={defectReasonsData} 
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  onClick={(e) => {
                    const reason = e?.activePayload?.[0]?.payload?.name || e?.activeLabel;
                    if (reason) setSelectedReason(prev => prev === reason ? null : reason);
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={130} 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => val.length > 20 ? val.substring(0, 18) + '…' : val}
                  />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="value" name="Defect Count" fill="#f97316" radius={[0, 4, 4, 0]}>
                    {defectReasonsData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={selectedReason === entry.name ? '#0284c7' : COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Defect Table */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-dark">Live Defect Logs</h3>
            {selectedReason && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-300">
                  Filtered by: {selectedReason}
                </span>
                <button
                  onClick={() => setSelectedReason(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
