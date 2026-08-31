import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function ReworkStatusReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [status, setStatus] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/trace/rework?period=${period}&shift=${shift}&status=${status}&line=${line}&station=${station}&model=${model}&sku=${sku}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, status, line, station, model, sku]);

  const rawData = dbData?.table || [
    { engineNo: 'ENG-3018', line: 'Line 2', station: 'Line2 (Head Tightening)', model: 'Pulsar 150', sku: 'UG5', reason: 'Torque Fail on Head Bolt #3', detectedTime: '2026-02-28 08:35', reworkStart: '08:45', reworkEnd: '09:05', status: 'Completed', operator: 'Amit Kumar', location: 'Line 2' },
    { engineNo: 'ENG-3022', line: 'Line 1', station: 'Demo (Block Assembly)', model: 'Pulsar 150', sku: 'UG5', reason: 'Casing Scratch defect', detectedTime: '2026-02-28 09:20', reworkStart: '09:30', reworkEnd: '-', status: 'In-Progress', operator: 'Rahul Sharma', location: 'Rework Bay 1' },
    { engineNo: 'ENG-3025', line: 'Line 1', station: 'Station2 (Cold Inspection)', model: 'Avenger 220', sku: 'BS6', reason: 'Leakage in oil seal test', detectedTime: '2026-02-28 10:15', reworkStart: '-', reworkEnd: '-', status: 'Pending', operator: 'Priya Singh', location: 'Buffer Zone' },
    { engineNo: 'ENG-3030', line: 'Line 2', station: 'Line2 (Head Tightening)', model: 'Dominar 400', sku: 'D400', reason: 'Thread Mismatch on crankcase', detectedTime: '2026-02-28 11:00', reworkStart: '11:15', reworkEnd: '11:50', status: 'Rejected', operator: 'Vikram Patel', location: 'Scrap Bin' }
  ];

  const filteredData = rawData.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station || (d.station && d.station.includes(station))) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku) &&
    (status === 'All' || d.status === status)
  );

  const topDefectsData = [
    { name: 'Torque Fail', count: filteredData.filter(t => t.reason?.includes('Torque')).length },
    { name: 'Casing Scratch', count: filteredData.filter(t => t.reason?.includes('Scratch')).length },
    { name: 'Leakage', count: filteredData.filter(t => t.reason?.includes('Leakage')).length },
    { name: 'Thread Mismatch', count: filteredData.filter(t => t.reason?.includes('Thread')).length }
  ].filter(d => d.count > 0);

  const topStationsData = [
    { name: 'Demo (Block Assembly)', count: filteredData.filter(t => t.station?.includes('Demo')).length },
    { name: 'Line2 (Head Tightening)', count: filteredData.filter(t => t.station?.includes('Line2')).length },
    { name: 'Station2 (Cold Inspection)', count: filteredData.filter(t => t.station?.includes('Station2')).length }
  ].filter(d => d.count > 0);

  const totalRework = filteredData.length;
  const inProgressCount = filteredData.filter(t => t.status === 'In-Progress').length;
  const completedCount = filteredData.filter(t => t.status === 'Completed').length;
  const rejectedCount = filteredData.filter(t => t.status === 'Rejected').length;
  const pendingCount = Math.max(0, totalRework - inProgressCount - completedCount - rejectedCount);

  const columns = [
    { header: 'Engine No (EIN)', accessor: 'engineNo' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Defect Station', accessor: 'station' },
    { header: 'Defect Reason', accessor: 'reason' },
    { header: 'Detected Date & Time', accessor: 'detectedTime' },
    { header: 'Rework Start Time', accessor: 'reworkStart' },
    { header: 'Rework End Time', accessor: 'reworkEnd' },
    { header: 'Rework Status', accessor: 'status', render: (val) => {
      let color = 'bg-gray-100 text-gray-700';
      if (val === 'Completed') color = 'bg-green-100 text-green-700';
      if (val === 'In-Progress') color = 'bg-blue-100 text-blue-700';
      if (val === 'Pending') color = 'bg-yellow-100 text-yellow-700';
      if (val === 'Rejected') color = 'bg-red-100 text-red-700';
      return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
    }},
    { header: 'Rework Operator', accessor: 'operator' },
    { header: 'Current Location', accessor: 'location' },
  ];

  const exportToExcel = () => {
    exportToXLSX('ReworkStatusReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Rework', totalRework], ['Pending', pendingCount], ['In-Progress', inProgressCount], ['Completed', completedCount]] },
      { name: 'Top Defects', rows: [['Defect Name', 'Count'], ...topDefectsData.map(r => [r.name, r.count])] },
      { name: 'Rework Details', rows: [['Engine No', 'Line', 'Model', 'SKU', 'Station', 'Reason', 'Detected Time', 'Start Time', 'End Time', 'Status', 'Operator', 'Location'], ...filteredData.map(r => [r.engineNo, r.line, r.model, r.sku, r.station, r.reason, r.detectedTime, r.reworkStart, r.reworkEnd, r.status, r.operator, r.location])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Rework Status Report"
        icon={RotateCcw}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
          { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
          { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
          { type: 'dropdown', label: 'Status', options: ['All', 'Pending', 'In-Progress', 'Completed', 'Rejected'], value: status, onChange: setStatus },
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Rework" value={totalRework} sub="Rework Logged" color="red" />
          <StatCard title="Pending" value={pendingCount} sub={`${totalRework > 0 ? ((pendingCount / totalRework) * 100).toFixed(1) : 0}% of Total`} color="amber" />
          <StatCard title="In-Progress" value={inProgressCount} sub={`${totalRework > 0 ? ((inProgressCount / totalRework) * 100).toFixed(1) : 0}% of Total`} color="blue" />
          <StatCard title="Completed" value={completedCount} sub={`${totalRework > 0 ? ((completedCount / totalRework) * 100).toFixed(1) : 0}% of Total`} color="green" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Defects</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={topDefectsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Defect Stations</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={topStationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Rework Details</h3>
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>
    </div>
  );
}
