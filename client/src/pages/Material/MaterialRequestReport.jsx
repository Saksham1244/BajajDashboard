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

  const tableData = (dbData?.table || []).filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station)
  );

  const kpi = {
    total: dbData?.kpis?.totalRequests || tableData.length,
    fulfilled: dbData?.kpis?.fulfilled || tableData.filter(d => d.status === 'Approved' || d.status === 'Fulfilled').length,
    pending: dbData?.kpis?.pending || tableData.filter(d => d.status === 'Pending').length,
    avgTime: tableData.length > 0 ? 10 : 0
  };

  const reqData = dbData?.reqData || [
    { station: 'Demo', requests: tableData.length }
  ].filter(d => d.requests > 0);

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((time) => ({
      time,
      requests: tableData.length
    }));
  }, [period, shift, tableData.length]);

  const columns = [
    { header: 'Request ID', accessor: 'reqId' },
    { header: 'Station', accessor: 'station' },
    { header: 'Material', accessor: 'material' },
    { header: 'Req Time', accessor: 'reqTime' },
    { header: 'Fulfilled Time', accessor: 'fullTime' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const color = val === 'Fulfilled' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100';
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
        ['Req ID', 'Station', 'Material', 'Req Time', 'Fulfilled Time', 'Status'],
        ...tableData.map(d => [d.reqId, d.station, d.material, d.reqTime, d.fullTime, d.status])
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
