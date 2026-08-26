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

  const wipDistData = [
    { name: 'In-Process', value: 45 },
    { name: 'Rework', value: 12 },
    { name: 'Blocked', value: 5 },
    { name: 'Idle', value: 8 },
  ];

  const mockData = [
    { id: 1, engineNo: 'ENG-101', model: 'Pulsar 150', sku: 'UG5', station: 'ST-04', status: 'In-Process', entryTime: '10:00', duration: 1.5, operator: 'OP-01' },
    { id: 2, engineNo: 'ENG-102', model: 'Dominar 400', sku: 'STD', station: 'ST-02', status: 'Idle', entryTime: '09:30', duration: 2.0, operator: 'OP-02' },
    { id: 3, engineNo: 'ENG-103', model: 'Avenger 220', sku: 'STD', station: 'ST-07', status: 'Rework', entryTime: '10:15', duration: 1.25, operator: 'OP-03' },
    { id: 4, engineNo: 'ENG-104', model: 'Pulsar 220', sku: 'UG6', station: 'ST-01', status: 'Blocked', entryTime: '11:00', duration: 0.5, operator: 'OP-04' },
    { id: 5, engineNo: 'ENG-105', model: 'Pulsar 150', sku: 'UG5', station: 'ST-03', status: 'In-Process', entryTime: '11:15', duration: 0.25, operator: 'OP-05' },
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
          <StatCard title="Total WIP" value={dbData?.kpis?.total || "70"} trend="up" color="blue" />
          <StatCard title="In-Process" value={dbData?.kpis?.inProcess || "45"} trend="neutral" color="green" />
          <StatCard title="Rework" value={dbData?.kpis?.rework || "12"} trend="down" color="orange" />
          <StatCard title="Blocked" value={dbData?.kpis?.blocked || "5"} trend="up" color="red" />
          <StatCard title="Idle" value={dbData?.kpis?.idle || "8"} trend="down" color="purple" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4 col-span-1">
            <h3 className="text-sm font-bold text-brand-dark mb-3">WIP Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={dbData?.kpis?.distribution || wipDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(dbData?.kpis?.distribution || wipDistData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <DataTable columns={columns} data={dbData?.table || mockData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

