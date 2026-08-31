import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ClipboardList } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function MaterialRequestReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/material/request?period=${period}&shift=${shift}&line=${line}&station=${station}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
  ];

  const defaultTable = [
    { reqId: 'REQ-1001', material: 'Cylinder Block 150cc', line: 'Line 1', station: 'Demo', requestedQty: 50, issuedQty: 50, status: 'Fulfilled', reqTime: '08:15', fullTime: '08:25' },
    { reqId: 'REQ-1002', material: 'Piston Assembly 57mm', line: 'Line 1', station: 'Line2', requestedQty: 30, issuedQty: 30, status: 'Fulfilled', reqTime: '09:00', fullTime: '09:12' },
    { reqId: 'REQ-1003', material: 'Cylinder Head DOHC', line: 'Line 2', station: 'Station2', requestedQty: 25, issuedQty: 25, status: 'Fulfilled', reqTime: '09:30', fullTime: '09:40' },
    { reqId: 'REQ-1004', material: 'Camshaft Timing Gear Set', line: 'Line 1', station: 'Demo', requestedQty: 15, issuedQty: 0, status: 'Pending', reqTime: '10:10', fullTime: '-' },
    { reqId: 'REQ-1005', material: 'Spark Plug Twin-Spark', line: 'Line 2', station: 'Line2', requestedQty: 100, issuedQty: 100, status: 'Fulfilled', reqTime: '10:45', fullTime: '10:55' },
  ];

  const rawTable = (dbData?.table && dbData.table.length > 0) ? dbData.table : defaultTable;

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station)
  );

  const totalRequests = tableData.length;
  const fulfilledCount = tableData.filter(d => d.status === 'Approved' || d.status === 'Fulfilled').length;
  const pendingCount = tableData.filter(d => d.status === 'Pending').length;

  const kpi = {
    total: totalRequests,
    fulfilled: fulfilledCount,
    pending: pendingCount,
    avgTime: totalRequests > 0 ? 10 : 0
  };

  const reqData = useMemo(() => {
    const stationCounts = {};
    tableData.forEach(d => {
      const st = d.station || 'Demo';
      stationCounts[st] = (stationCounts[st] || 0) + 1;
    });
    const result = Object.entries(stationCounts).map(([st, requests]) => ({ station: st, requests }));
    return result.length > 0 ? result : [{ station: station !== 'All' ? station : 'No Data', requests: 0 }];
  }, [tableData, station]);

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      requests: tableData.length
    }));
  }, [period, shift, tableData.length]);

  const columns = [
    { header: 'Request ID', accessor: 'reqId' },
    { header: 'Line', accessor: 'line' },
    { header: 'Station', accessor: 'station' },
    { header: 'Material', accessor: 'material' },
    { header: 'Req Qty', accessor: 'requestedQty' },
    { header: 'Issued Qty', accessor: 'issuedQty' },
    { header: 'Req Time', accessor: 'reqTime' },
    { header: 'Fulfilled Time', accessor: 'fullTime' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const color = val === 'Fulfilled' || val === 'Approved' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100';
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{val}</span>;
    }}
  ];

  const exportToExcel = () => {
    exportToXLSX('MaterialRequestReport.xlsx', [
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Total Requests', kpi.total],
        ['Fulfilled', kpi.fulfilled],
        ['Pending', kpi.pending],
        ['Avg Fulfillment Time (mins)', kpi.avgTime]
      ]},
      { name: 'Request Details', rows: [
        ['Req ID', 'Line', 'Station', 'Material', 'Req Qty', 'Issued Qty', 'Req Time', 'Fulfilled Time', 'Status'],
        ...tableData.map(d => [d.reqId, d.line, d.station, d.material, d.requestedQty, d.issuedQty, d.reqTime, d.fullTime, d.status])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Material Request Report" icon={ClipboardList} period={period} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Requests"  value={kpi.total} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Fulfilled"  value={kpi.fulfilled} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Pending"  value={kpi.pending} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Fulfillment Time (mins)"  value={kpi.avgTime} />
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
