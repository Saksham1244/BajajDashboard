import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function DefectReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [dbData, setDbData] = useState(null);
  React.useEffect(() => {
    fetch(`/api/quality/defect?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate]);

  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const kpiData = dbData?.kpis || {
    totalProduction: "1250",
    totalDefects: "45",
    rft: 96.4
  };

  const defectTrendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((label, idx) => ({
      date: label,
      defects: idx % 3 === 0 ? 2 : 1
    }));
  }, [period, shift]);

  const defVal = parseInt(kpiData.totalDefects) || 0;
  
  const defectDistData = dbData?.distribution || [
    { name: 'Half Engine', value: Math.ceil(defVal * 0.44) },
    { name: 'Leakage', value: Math.floor(defVal * 0.33) },
    { name: 'PV', value: defVal - Math.ceil(defVal * 0.44) - Math.floor(defVal * 0.33) },
  ].filter(d => d.value > 0);

  const defectReasonsData = dbData?.reasons || [
    { name: 'Torque Failure', value: Math.ceil(defVal * 0.33) },
    { name: 'Missing Part', value: Math.ceil(defVal * 0.27) },
    { name: 'Scratch', value: Math.ceil(defVal * 0.18) },
    { name: 'Alignment', value: Math.ceil(defVal * 0.13) },
    { name: 'Other', value: defVal - Math.ceil(defVal * 0.33) - Math.ceil(defVal * 0.27) - Math.ceil(defVal * 0.18) - Math.ceil(defVal * 0.13) }
  ].filter(d => d.value > 0);

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Production" value={kpiData.totalProduction} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Defects" value={kpiData.totalDefects} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="RFT %" value={`${kpiData.rft}%`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Defect Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={defectTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="defects" stroke={COLORS[0]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Defect Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={defectDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {defectDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4 md:col-span-2">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Defect Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={defectReasonsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {defectReasonsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Defect Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
