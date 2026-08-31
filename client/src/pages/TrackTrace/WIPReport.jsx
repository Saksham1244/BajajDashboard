import React, { useState, useMemo, useEffect } from 'react';
import { Layers } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function WIPReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [wipStatus, setWipStatus] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/trace/wip?period=${period}&shift=${shift}&wipStatus=${encodeURIComponent(wipStatus)}&line=${encodeURIComponent(line)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, wipStatus, line]);
  const COLORS = ['#0369a1', '#f97316', '#f43f5e', '#8b5cf6'];
  
  const rawTableData = dbData?.details || dbData?.table || [];

  const filteredTableData = rawTableData.filter(row => 
    (line === 'All' || row.line === line) &&
    (wipStatus === 'All' || row.status === wipStatus)
  );

  const inProcessCount = filteredTableData.filter(d => d.status === 'In-Process').length;
  const reworkCount = filteredTableData.filter(d => d.status === 'Rework').length;
  const blockedCount = filteredTableData.filter(d => d.status === 'Blocked').length;
  const idleCount = filteredTableData.filter(d => d.status === 'Idle').length;
  const totalCount = filteredTableData.length;

  const kpiValues = {
    total: totalCount,
    inProcess: inProcessCount,
    rework: reworkCount,
    blocked: blockedCount,
    idle: idleCount
  };

  const wipDistData = [
    { name: 'In-Process', value: kpiValues.inProcess },
    { name: 'Rework', value: kpiValues.rework },
    { name: 'Blocked', value: kpiValues.blocked },
    { name: 'Idle', value: kpiValues.idle },
  ];

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Current Station', accessor: 'station' },
    { header: 'WIP Status', accessor: 'status' },
    { header: 'Entry Time', accessor: 'entryTime' },
    { header: 'Duration (hrs)', accessor: 'duration' },
    { header: 'Operator', accessor: 'operator' },
  ];

  const exportToExcel = () => {
    exportToXLSX('WIPReport.xlsx', [
      { name: 'WIP Summary', rows: [['Status', 'Count'], ['In-Process', kpiValues.inProcess], ['Rework', kpiValues.rework], ['Blocked', kpiValues.blocked], ['Idle', kpiValues.idle], ['Total', kpiValues.total]] },
      { name: 'Engine Details', rows: [['Engine No', 'Line', 'Model', 'SKU', 'Current Station', 'WIP Status', 'Entry Time', 'Duration (hrs)', 'Operator'], ...filteredTableData.map(r => [r.engineNo, r.line, r.model, r.sku, r.station, r.status, r.entryTime, r.duration, r.operator])] }
    ]);
  };

  const filteredDistData = wipDistData.filter(
    item => wipStatus === 'All' || item.name === wipStatus
  ).filter(d => d.value > 0);

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="WIP Report"
        icon={Layers}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'WIP Status', options: ['All', 'In-Process', 'Rework', 'Blocked', 'Idle'], value: wipStatus, onChange: setWipStatus }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total WIP" value={kpiValues.total} sub="Active Line Units" color="blue" />
          <StatCard title="In-Process" value={kpiValues.inProcess} sub={`${kpiValues.total > 0 ? ((kpiValues.inProcess / kpiValues.total) * 100).toFixed(1) : 0}% of WIP`} color="green" />
          <StatCard title="Rework" value={kpiValues.rework} sub={`${kpiValues.total > 0 ? ((kpiValues.rework / kpiValues.total) * 100).toFixed(1) : 0}% of WIP`} color="amber" />
          <StatCard title="Blocked" value={kpiValues.blocked} sub={`${kpiValues.total > 0 ? ((kpiValues.blocked / kpiValues.total) * 100).toFixed(1) : 0}% of WIP`} color="red" />
          <StatCard title="Idle" value={kpiValues.idle} sub={`${kpiValues.total > 0 ? ((kpiValues.idle / kpiValues.total) * 100).toFixed(1) : 0}% of WIP`} color="purple" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4 col-span-1">
            <h3 className="text-sm font-bold text-brand-dark mb-3">WIP Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={filteredDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {filteredDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[wipDistData.findIndex(d => d.name === entry.name) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4 col-span-2 flex flex-col">
            <h3 className="text-sm font-bold text-brand-dark mb-3">WIP Engine Details</h3>
            <div className="flex-1">
              <DataTable columns={columns} data={filteredTableData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

