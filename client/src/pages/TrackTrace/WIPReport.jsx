import React, { useState, useMemo, useEffect } from 'react';
import { Layers } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function WIPReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [wipStatus, setWipStatus] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/trace/wip?period=${period}&shift=${shift}&wipStatus=${wipStatus}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, wipStatus]);
  const COLORS = ['#0369a1', '#f97316', '#f43f5e', '#8b5cf6'];
  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;
  const kpiValues = {
    total: Math.round(70 * scale),
    inProcess: Math.round(45 * scale),
    rework: Math.round(12 * scale),
    blocked: Math.round(5 * scale),
    idle: Math.round(8 * scale)
  };

  const wipDistData = [
    { name: 'In-Process', value: kpiValues.inProcess },
    { name: 'Rework', value: kpiValues.rework },
    { name: 'Blocked', value: kpiValues.blocked },
    { name: 'Idle', value: kpiValues.idle },
  ];

  const mockData = [
    ...Array(kpiValues.inProcess).fill().map((_, i) => ({ id: `IP-${i}`, engineNo: `ENG-IP${i}`, model: 'Pulsar 150', sku: 'UG5', station: 'ST-04', status: 'In-Process', entryTime: '10:00', duration: 1.5, operator: 'OP-01' })),
    ...Array(kpiValues.rework).fill().map((_, i) => ({ id: `RW-${i}`, engineNo: `ENG-RW${i}`, model: 'Avenger 220', sku: 'STD', station: 'ST-07', status: 'Rework', entryTime: '10:15', duration: 1.25, operator: 'OP-03' })),
    ...Array(kpiValues.blocked).fill().map((_, i) => ({ id: `BL-${i}`, engineNo: `ENG-BL${i}`, model: 'Pulsar 220', sku: 'UG6', station: 'ST-01', status: 'Blocked', entryTime: '11:00', duration: 0.5, operator: 'OP-04' })),
    ...Array(kpiValues.idle).fill().map((_, i) => ({ id: `ID-${i}`, engineNo: `ENG-ID${i}`, model: 'Dominar 400', sku: 'STD', station: 'ST-02', status: 'Idle', entryTime: '09:30', duration: 2.0, operator: 'OP-02' })),
  ];

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
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
      { name: 'WIP Summary', rows: [['Status', 'Count'], ['In-Process', 45], ['Rework', 12], ['Blocked', 5], ['Idle', 8], ['Total', 70]] },
      { name: 'Engine Details', rows: [['Engine No', 'Model', 'SKU', 'Current Station', 'WIP Status', 'Entry Time', 'Duration (hrs)', 'Operator'], ...(dbData?.table || mockData).map(r => [r.engineNo, r.model, r.sku, r.station, r.status, r.entryTime, r.duration, r.operator])] }
    ]);
  };

  const filteredDistData = (dbData?.kpis?.distribution || wipDistData).filter(
    item => wipStatus === 'All' || item.name === wipStatus
  );

  const filteredTableData = (dbData?.table || mockData).filter(
    row => wipStatus === 'All' || row.status === wipStatus
  );

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="WIP Report"
        icon={Layers}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'WIP Status', options: ['All', 'In-Process', 'Rework', 'Blocked', 'Idle'], value: wipStatus, onChange: setWipStatus }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total WIP" value={dbData?.kpis?.total || kpiValues.total} trend="up" color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="In-Process" value={dbData?.kpis?.inProcess || kpiValues.inProcess} trend="neutral" color="green" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Rework" value={dbData?.kpis?.rework || kpiValues.rework} trend="down" color="orange" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Blocked" value={dbData?.kpis?.blocked || kpiValues.blocked} trend="up" color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Idle" value={dbData?.kpis?.idle || kpiValues.idle} trend="down" color="purple" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4 col-span-1">
            <h3 className="text-sm font-bold text-brand-dark mb-3">WIP Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={filteredDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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

