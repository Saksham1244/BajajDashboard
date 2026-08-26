import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ClipboardList } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialRequestReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2'], value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: ['All', 'ST-01', 'ST-02', 'ST-03'], value: station, onChange: setStation },
  ];

  const reqData = [
    { station: 'ST-01', requests: 12 },
    { station: 'ST-02', requests: 8 },
    { station: 'ST-03', requests: 15 },
    { station: 'ST-04', requests: 5 },
  ];

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map(time => ({
      time,
      requests: Math.floor(Math.random() * 15) + 2
    }));
  }, [period, shift]);

  const tableData = [
    { reqId: 'REQ-001', station: 'ST-01', material: 'Bolt M8', reqTime: '10:00', fullTime: '10:15', status: 'Fulfilled' },
    { reqId: 'REQ-002', station: 'ST-02', material: 'Engine Block', reqTime: '10:30', fullTime: '-', status: 'Pending' },
    { reqId: 'REQ-003', station: 'ST-03', material: 'Wire Harness', reqTime: '11:00', fullTime: '11:10', status: 'Fulfilled' },
    { reqId: 'REQ-004', station: 'ST-01', material: 'Clutch Assy', reqTime: '11:45', fullTime: '12:00', status: 'Fulfilled' },
    { reqId: 'REQ-005', station: 'ST-04', material: 'Gasket', reqTime: '12:15', fullTime: '-', status: 'Pending' },
  ];

  const columns = [
    { header: 'Request ID', accessor: 'reqId' },
    { header: 'Station', accessor: 'station' },
    { header: 'Material', accessor: 'material' },
    { header: 'Req Time', accessor: 'reqTime' },
    { header: 'Fulfilled Time', accessor: 'fullTime' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const color = val === 'Fulfilled' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100';
      return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{val}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('MaterialRequestReport.xlsx', [
      { name: 'KPI', rows: [
        ['Total Requests', '40'],
        ['Fulfilled', '35'],
        ['Pending', '5'],
        ['Avg Fulfillment Time (mins)', '12']
      ]},
      { name: 'Request Details', rows: [
        ['Req ID', 'Station', 'Material', 'Req Time', 'Fulfilled Time', 'Status'],
        ...tableData.map(d => [d.reqId, d.station, d.material, d.reqTime, d.fullTime, d.status])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Request Report" icon={ClipboardList} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Requests" autoScale value="40" color="bg-blue-100" />
          <StatCard title="Fulfilled" autoScale value="35" color="bg-green-100" />
          <StatCard title="Pending" autoScale value="5" color="bg-orange-100" />
          <StatCard title="Avg Fulfillment Time (mins)" autoScale value="12" color="bg-purple-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Requests by Station</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={reqData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Requests Over Time</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke={COLORS[1]} />
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
