import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MaintenanceDashboard() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [machine, setMachine] = useState('All');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const colors = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

  const machineStatusData = [
    { name: 'Running', value: 45 },
    { name: 'Breakdown', value: 5 },
    { name: 'Maintenance', value: 2 },
    { name: 'Idle', value: 8 },
  ];
  
  const breakdownReasons = [
    { reason: 'Motor Failure', duration: 120, count: 5 },
    { reason: 'Sensor Error', duration: 90, count: 8 },
    { reason: 'Belt Snapped', duration: 75, count: 3 },
    { reason: 'Power Outage', duration: 60, count: 2 },
    { reason: 'Jam', duration: 45, count: 12 },
    { reason: 'Overheat', duration: 30, count: 4 },
    { reason: 'Calibration', duration: 20, count: 6 },
  ];

  const tableData = [
    { machine: 'M-01', status: 'Running', lastBreakdown: '2023-10-01', downtimeToday: 0, mttr: 45, mtbf: 120, availability: 98 },
    { machine: 'M-02', status: 'Breakdown', lastBreakdown: '2023-10-15', downtimeToday: 120, mttr: 60, mtbf: 80, availability: 85 },
    { machine: 'M-03', status: 'Maintenance', lastBreakdown: '2023-09-20', downtimeToday: 60, mttr: 30, mtbf: 200, availability: 95 },
    { machine: 'M-04', status: 'Idle', lastBreakdown: '2023-10-10', downtimeToday: 0, mttr: 50, mtbf: 150, availability: 92 },
    { machine: 'M-05', status: 'Running', lastBreakdown: '2023-10-05', downtimeToday: 0, mttr: 40, mtbf: 180, availability: 99 },
  ];

  const columns = [
    { header: 'Machine', accessorKey: 'machine' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Last Breakdown', accessorKey: 'lastBreakdown' },
    { header: 'Downtime Today (mins)', accessorKey: 'downtimeToday' },
    { header: 'MTTR (mins)', accessorKey: 'mttr' },
    { header: 'MTBF (hrs)', accessorKey: 'mtbf' },
    { header: 'Availability %', accessorKey: 'availability' },
  ];

  const exportToExcel = () => {
    exportToXLSX('MaintenanceDashboard.xlsx', [
      { name: 'KPI', rows: [
        ['Metric', 'Value'],
        ['Running', 45],
        ['Breakdown', 5],
        ['Maintenance', 2],
        ['Idle', 8],
        ['Total Downtime (mins)', 450],
        ['Breakdown Count', 12],
        ['MTTR (mins)', 45],
        ['MTBF (hrs)', 146],
        ['Machine Availability %', 94],
      ]},
      { name: 'Machine Status', rows: [['Status', 'Count'], ...machineStatusData.map(d => [d.name, d.value])] },
      { name: 'Breakdown Reasons', rows: [['Reason', 'Duration (mins)', 'Count'], ...breakdownReasons.map(d => [d.reason, d.duration, d.count])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Maintenance Dashboard"
        icon={Wrench}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Machine', options: ['All','M-01','M-02','M-03'], value: machine, onChange: setMachine },
        ]} 
      />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard title="Machine Status" value="45 / 5 / 2 / 8" subtitle="Run/Brk/Mnt/Idle" />
          <StatCard title="Total Downtime" value="450 mins" />
          <StatCard title="Breakdown Count" value="12" />
          <StatCard title="Avg MTTR" value="45 mins" />
          <StatCard title="Avg MTBF" value="146 hrs" />
          <StatCard title="Machine Availability" value="94.5 %" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Machine Status Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={machineStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {machineStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 7 Breakdown Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={breakdownReasons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" tick={{fontSize: 10}} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="duration" name="Duration (mins)" fill={colors[0]} />
                  <Line yAxisId="right" type="monotone" dataKey="count" name="Occurrence Count" stroke={colors[1]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
