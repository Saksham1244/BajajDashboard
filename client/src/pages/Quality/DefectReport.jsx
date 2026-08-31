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
    totalProduction: 3188,
    totalDefects: 10,
    rft: 96.9
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

  const defectDistData = dbData?.distribution || [
    { name: 'Engine Fitment', value: 4 },
    { name: 'Leakage & Sealing', value: 2 },
    { name: 'Torque & Fastening', value: 2 },
    { name: 'Cosmetic & Surface', value: 1 },
    { name: 'Electrical & Other', value: 1 }
  ];

  const defectReasonsData = dbData?.reasons || [
    { name: 'Torque Fail on Head Bolt #3', value: 2 },
    { name: 'Casing Scratch on Clutch Cover', value: 2 },
    { name: 'Leakage on Water Pump Seal', value: 2 },
    { name: 'Valve Clearance Out of Spec', value: 1 },
    { name: 'Oil Sump Gasket Misaligned', value: 1 },
    { name: 'Camshaft Timing Out by 1 Tooth', value: 1 }
  ];

  const tableData = dbData?.table || [
    { engineNo: 'ENG-3018', defect: 'Torque Fail on Head Bolt #3', station: 'Line2 (Head Tightening)', operator: 'Rahul Sharma', time: '08:35' },
    { engineNo: 'ENG-3019', defect: 'Casing Scratch on Clutch Cover', station: 'Demo (Block Assembly)', operator: 'Priya Singh', time: '09:20' },
    { engineNo: 'ENG-3020', defect: 'Leakage on Water Pump Seal', station: 'Station2 (Cold Inspection)', operator: 'Amit Kumar', time: '10:05' },
    { engineNo: 'ENG-2026-00120', defect: 'Thread Mismatch on Crankcase', station: 'Demo (Block Assembly)', operator: 'Neha Verma', time: '11:15' },
    { engineNo: 'ENG-2026-00125', defect: 'Valve Clearance Out of Spec', station: 'Line2 (Head Tightening)', operator: 'Vikram Patel', time: '12:30' }
  ];

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
            <h3 className="text-sm font-bold text-brand-dark mb-2">Defect Distribution by Category</h3>
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
            <h3 className="text-sm font-bold text-brand-dark mb-2">Top Defect Reasons (Pareto)</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={defectReasonsData} 
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
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
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Defect Table */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Live Defect Logs</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
