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

  const tableData = dbData?.table || [
    { id: 1, engineNo: 'ENG-3018', model: 'Pulsar 150', station: 'Line2 (Head Tightening)', reason: 'Torque Fail on Head Bolt #3', detectedTime: '08:35', reworkStart: '08:50', reworkEnd: '09:10', status: 'Completed', operator: 'Rahul Sharma', location: 'Rework Bay 1' },
    { id: 2, engineNo: 'ENG-3019', model: 'Dominar 400', station: 'Demo (Block Assembly)', reason: 'Casing Scratch on Clutch Cover', detectedTime: '09:20', reworkStart: '09:30', reworkEnd: '09:55', status: 'Completed', operator: 'Priya Singh', location: 'Rework Bay 2' },
    { id: 3, engineNo: 'ENG-3020', model: 'Avenger 220', station: 'Station2 (Cold Inspection)', reason: 'Leakage on Water Pump Seal', detectedTime: '10:05', reworkStart: '10:15', reworkEnd: '-', status: 'In-Progress', operator: 'Amit Kumar', location: 'Rework Bay 1' }
  ];

  const filteredData = tableData.filter(d => 
    status === 'All' || d.status === status
  );

  const topDefectsData = [
    { name: 'Torque Fail', count: tableData.filter(t => t.reason?.includes('Torque')).length || 4 },
    { name: 'Casing Scratch', count: tableData.filter(t => t.reason?.includes('Scratch')).length || 3 },
    { name: 'Leakage', count: tableData.filter(t => t.reason?.includes('Leakage')).length || 2 },
    { name: 'Thread Mismatch', count: tableData.filter(t => t.reason?.includes('Thread')).length || 1 }
  ];

  const topStationsData = [
    { name: 'Demo (Block Assembly)', count: tableData.filter(t => t.station?.includes('Demo')).length || 4 },
    { name: 'Line2 (Head Tightening)', count: tableData.filter(t => t.station?.includes('Line2')).length || 3 },
    { name: 'Station2 (Cold Inspection)', count: tableData.filter(t => t.station?.includes('Station2')).length || 2 }
  ];

  const totalRework = dbData?.kpis?.totalRework || tableData.length;
  const inProgressCount = dbData?.kpis?.inProgress || tableData.filter(t => t.status === 'In-Progress').length;
  const completedCount = dbData?.kpis?.completed || tableData.filter(t => t.status === 'Completed').length;
  const rejectedCount = dbData?.kpis?.rejected || tableData.filter(t => t.status === 'Rejected').length;
  const pendingCount = Math.max(0, totalRework - inProgressCount - completedCount - rejectedCount);

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
      { name: 'Rework Details', rows: [['Engine No', 'Model', 'Station', 'Reason', 'Detected Time', 'Start Time', 'End Time', 'Status', 'Operator', 'Location'], ...filteredData.map(r => [r.engineNo, r.model, r.station, r.reason, r.detectedTime, r.reworkStart, r.reworkEnd, r.status, r.operator, r.location])] }
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
