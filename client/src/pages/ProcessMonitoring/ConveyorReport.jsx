import React, { useState } from 'react';
import { Workflow } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function ConveyorReport() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [shift, setShift] = useState('All');
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const filters = [
    { type: 'period', value: period, onChange: setPeriod },
    { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
    { type: 'dropdown', label: 'Shift', options: ['All', 'Shift 1', 'Shift 2', 'Shift 3'], value: shift, onChange: setShift },
    { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2'], value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: ['All', 'ST-01', 'ST-02'], value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model Family', options: ['All', 'Pulsar', 'Dominar'], value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: ['All', 'Pulsar 150', 'Dominar 400'], value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: ['All', 'UG5', 'STD'], value: sku, onChange: setSku },
  ];

  const affectedStationsData = [
    { station: 'ST-05', downtime: 45 },
    { station: 'ST-12', downtime: 30 },
    { station: 'ST-08', downtime: 25 },
    { station: 'ST-01', downtime: 20 },
    { station: 'ST-15', downtime: 15 },
  ];

  const affectedReasonsData = [
    { reason: 'Part Shortage', count: 12 },
    { reason: 'Quality Issue', count: 8 },
    { reason: 'Machine Breakdown', count: 6 },
    { reason: 'Operator Unavailable', count: 4 },
    { reason: 'Material Jam', count: 3 },
  ];

  const tableData = [
    { station: 'ST-05', plannedSpeed: 10, actualSpeed: 8, deviation: 20, stoppageCount: 3, totalStoppageTime: 45, status: 'Active' },
    { station: 'ST-12', plannedSpeed: 10, actualSpeed: 9, deviation: 10, stoppageCount: 2, totalStoppageTime: 30, status: 'Active' },
    { station: 'ST-08', plannedSpeed: 10, actualSpeed: 7, deviation: 30, stoppageCount: 5, totalStoppageTime: 25, status: 'Resolved' },
    { station: 'ST-01', plannedSpeed: 10, actualSpeed: 9.5, deviation: 5, stoppageCount: 1, totalStoppageTime: 20, status: 'Active' },
    { station: 'ST-15', plannedSpeed: 10, actualSpeed: 8.5, deviation: 15, stoppageCount: 2, totalStoppageTime: 15, status: 'Resolved' },
  ];

  const tableColumns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Planned Speed (m/min)', accessor: 'plannedSpeed' },
    { header: 'Actual Speed (m/min)', accessor: 'actualSpeed' },
    { header: 'Deviation %', accessor: 'deviation' },
    { header: 'Stoppage Count', accessor: 'stoppageCount' },
    { header: 'Total Stoppage Time (mins)', accessor: 'totalStoppageTime' },
    { header: 'Status', accessor: 'status' },
  ];

  const exportToExcel = () => {
    exportToXLSX('ConveyorReport.xlsx', [
      { name: 'KPI Summary', rows: [['Avg Speed', 'Max Deviation', 'Total Stoppages', 'Efficiency'], [8.4, 30, 13, 85]] },
      { name: 'Affected Stations', rows: [['Station', 'Downtime'], ...affectedStationsData.map(d => [d.station, d.downtime])] },
      { name: 'Conveyor Performance', rows: [['Station', 'Planned Speed', 'Actual Speed', 'Deviation %', 'Stoppage Count', 'Stoppage Time', 'Status'], ...tableData.map(d => [d.station, d.plannedSpeed, d.actualSpeed, d.deviation, d.stoppageCount, d.totalStoppageTime, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Conveyor Report"
        icon={Workflow}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Avg Speed (m/min)" value="8.4" />
          <StatCard title="Max Speed Deviation" value="30%" color="text-red-500" />
          <StatCard title="Total Stoppages" value="13" />
          <StatCard title="Conveyor Efficiency %" value="85%" color="text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Conveyor Speed Affected Stations</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={affectedStationsData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="station" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="downtime" name="Downtime (mins)" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Speed Affected Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={affectedReasonsData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="reason" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Stoppage Count" fill="#0369a1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Conveyor Performance Details</h3>
          <DataTable columns={tableColumns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
