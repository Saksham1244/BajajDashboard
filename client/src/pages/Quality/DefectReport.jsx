import React, { useState } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function DefectReport() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [shift, setShift] = useState('All');
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const kpiData = {
    totalProduction: 1250,
    totalDefects: 45,
    rft: 96.4
  };

  const defectTrendData = [
    { date: '2023-01-01', defects: 5 },
    { date: '2023-01-02', defects: 8 },
    { date: '2023-01-03', defects: 4 },
    { date: '2023-01-04', defects: 6 },
    { date: '2023-01-05', defects: 9 },
  ];

  const defectDistData = [
    { name: 'Half Engine', value: 20 },
    { name: 'Leakage', value: 15 },
    { name: 'PV', value: 10 },
  ];

  const defectReasonsData = [
    { name: 'Torque Failure', value: 15 },
    { name: 'Missing Part', value: 12 },
    { name: 'Scratch', value: 8 },
    { name: 'Wrong Orientation', value: 10 },
  ];

  const tableData = [
    { engineNo: 'ENG001', defect: 'Torque Failure', station: 'ST-01', operator: 'John Doe', time: '10:00 AM' },
    { engineNo: 'ENG002', defect: 'Missing Part', station: 'ST-02', operator: 'Jane Smith', time: '10:15 AM' },
    { engineNo: 'ENG003', defect: 'Scratch', station: 'ST-03', operator: 'Mike Johnson', time: '10:30 AM' },
    { engineNo: 'ENG004', defect: 'Wrong Orientation', station: 'ST-01', operator: 'John Doe', time: '10:45 AM' },
    { engineNo: 'ENG005', defect: 'Torque Failure', station: 'ST-02', operator: 'Jane Smith', time: '11:00 AM' },
  ];

  const columns = [
    { header: 'Engine No', accessorKey: 'engineNo' },
    { header: 'Defect', accessorKey: 'defect' },
    { header: 'Station', accessorKey: 'station' },
    { header: 'Operator', accessorKey: 'operator' },
    { header: 'Time', accessorKey: 'time' },
  ];

  const exportToExcel = () => {
    exportToXLSX('DefectReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Production', kpiData.totalProduction], ['Total Defects', kpiData.totalDefects], ['RFT %', kpiData.rft]] },
      { name: 'Defect Trend', rows: [['Date', 'Defects'], ...defectTrendData.map(d => [d.date, d.defects])] },
      { name: 'Defect Distribution', rows: [['Category', 'Count'], ...defectDistData.map(d => [d.name, d.value])] },
      { name: 'Defect Details', rows: [['Engine No', 'Defect', 'Station', 'Operator', 'Time'], ...tableData.map(d => [d.engineNo, d.defect, d.station, d.operator, d.time])] },
    ]);
  };

  const filters = [
    { type: 'period', value: period, onChange: setPeriod },
    { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
    { type: 'dropdown', label: 'Shift', options: ['All','Shift 1','Shift 2','Shift 3'], value: shift, onChange: setShift },
    { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02','ST-03'], value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model Family', options: ['All','Pulsar','Dominar','Avenger'], value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: ['All','Pulsar 150','Pulsar 220','Dominar 400'], value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: ['All','UG5','UG6','STD'], value: sku, onChange: setSku },
  ];

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
          <StatCard title="Total Production" value={kpiData.totalProduction} />
          <StatCard title="Total Defects" value={kpiData.totalDefects} />
          <StatCard title="RFT %" value={`${kpiData.rft}%`} />
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
