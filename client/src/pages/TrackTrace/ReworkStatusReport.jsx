import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function ReworkStatusReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [status, setStatus] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/trace/rework?period=${period}&shift=${shift}&status=${status}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, status]);

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const topDefectsData = [
    { name: 'Torque Fail', count: Math.max(1, Math.round(45 * scale)) },
    { name: 'Leakage', count: Math.max(1, Math.round(32 * scale)) },
    { name: 'Missing Part', count: Math.max(1, Math.round(28 * scale)) },
    { name: 'Scratch', count: Math.max(1, Math.round(15 * scale)) },
    { name: 'Misalignment', count: Math.max(1, Math.round(12 * scale)) },
  ];

  const topStationsData = [
    { name: 'ST-04', count: Math.max(1, Math.round(38 * scale)) },
    { name: 'ST-09', count: Math.max(1, Math.round(30 * scale)) },
    { name: 'ST-02', count: Math.max(1, Math.round(25 * scale)) },
    { name: 'ST-11', count: Math.max(1, Math.round(22 * scale)) },
    { name: 'ST-15', count: Math.max(1, Math.round(17 * scale)) },
  ];

  const allMockData = [
    { id: 1, engineNo: 'ENG-201', model: 'Pulsar 150', station: 'ST-04', reason: 'Torque Fail', detectedTime: '09:00', reworkStart: '09:15', reworkEnd: '09:30', status: 'Completed', operator: 'OP-RW1', location: 'RW-Area' },
    { id: 2, engineNo: 'ENG-202', model: 'Dominar 400', station: 'ST-09', reason: 'Leakage', detectedTime: '10:00', reworkStart: '10:10', reworkEnd: '-', status: 'In-Progress', operator: 'OP-RW2', location: 'RW-Area' },
    { id: 3, engineNo: 'ENG-203', model: 'Avenger 220', station: 'ST-02', reason: 'Missing Part', detectedTime: '10:30', reworkStart: '-', reworkEnd: '-', status: 'Pending', operator: '-', location: 'Buffer' },
    { id: 4, engineNo: 'ENG-204', model: 'Pulsar 220', station: 'ST-04', reason: 'Torque Fail', detectedTime: '11:00', reworkStart: '11:20', reworkEnd: '11:45', status: 'Completed', operator: 'OP-RW1', location: 'Line' },
    { id: 5, engineNo: 'ENG-205', model: 'Pulsar 150', station: 'ST-11', reason: 'Scratch', detectedTime: '11:30', reworkStart: '11:35', reworkEnd: '11:50', status: 'Rejected', operator: 'OP-RW3', location: 'Scrap' },
  ];

  const mockData = allMockData.filter(d => 
    status === 'All' || d.status === status
  );

  const totalRework = Math.max(1, Math.round(132 * scale));
  const pendingCount = Math.max(0, Math.round(28 * scale));
  const inProgressCount = Math.max(0, Math.round(15 * scale));
  const completedCount = Math.max(0, Math.round(89 * scale));

  const columns = [
    { header: 'Engine No (EIN)', accessor: 'engineNo' },
    { header: 'Model', accessor: 'model' },
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
      { name: 'Rework Details', rows: [['Engine No', 'Model', 'Station', 'Reason', 'Detected Time', 'Start Time', 'End Time', 'Status', 'Operator', 'Location'], ...mockData.map(r => [r.engineNo, r.model, r.station, r.reason, r.detectedTime, r.reworkStart, r.reworkEnd, r.status, r.operator, r.location])] }
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
          { type: 'dropdown', label: 'Status', options: ['All', 'Pending', 'In-Progress', 'Completed', 'Rejected'], value: status, onChange: setStatus },
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Rework" value={totalRework} trend="up" color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending" value={pendingCount} trend="neutral" color="orange" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="In-Progress" value={inProgressCount} trend="up" color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Completed" value={completedCount} trend="up" color="green" />
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
          <DataTable columns={columns} data={mockData} />
        </div>
      </div>
    </div>
  );
}
