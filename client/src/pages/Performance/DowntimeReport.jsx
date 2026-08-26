import React, { useState } from 'react';
import { Timer } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';

export default function DowntimeReport() {
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

  const kpiData = { totalDowntime: 420, noOfLosses: 35, mostLostCat: 'Equipment Failure', avgLossDuration: 12 };
  
  const hourlyData = [
    { hour: '06:00', duration: 15 },
    { hour: '07:00', duration: 0 },
    { hour: '08:00', duration: 45 },
    { hour: '09:00', duration: 20 },
    { hour: '10:00', duration: 10 },
    { hour: '11:00', duration: 60 },
    { hour: '12:00', duration: 0 }
  ];

  const categoryData = [
    { category: 'Equipment Failure', duration: 180, occurrence: 5 },
    { category: 'Material Shortage', duration: 120, occurrence: 15 },
    { category: 'Setup/Adjustments', duration: 90, occurrence: 8 },
    { category: 'Quality Issues', duration: 30, occurrence: 7 }
  ];

  const tableData = [
    { category: 'Equipment Failure', subCategory: 'Motor Breakdown', startTime: '08:15', endTime: '09:00', duration: 45, occurrence: 1, machine: 'M-101', reason: 'Overheating' },
    { category: 'Material Shortage', subCategory: 'Part XYZ Missing', startTime: '11:00', endTime: '12:00', duration: 60, occurrence: 1, machine: 'M-102', reason: 'Supply Delay' },
    { category: 'Setup/Adjustments', subCategory: 'Tool Change', startTime: '06:30', endTime: '06:45', duration: 15, occurrence: 1, machine: 'M-103', reason: 'Wear and Tear' },
    { category: 'Quality Issues', subCategory: 'Defective Batch', startTime: '10:00', endTime: '10:10', duration: 10, occurrence: 1, machine: 'M-101', reason: 'Calibration Error' },
    { category: 'Equipment Failure', subCategory: 'Sensor Fault', startTime: '09:10', endTime: '09:30', duration: 20, occurrence: 1, machine: 'M-104', reason: 'Damaged wire' }
  ];

  const columns = [
    { header: 'Category', accessor: 'category' },
    { header: 'Sub-Category', accessor: 'subCategory' },
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Occurrence', accessor: 'occurrence' },
    { header: 'Machine', accessor: 'machine' },
    { header: 'Reason', accessor: 'reason' }
  ];

  const exportToExcel = () => {
    exportToXLSX('DowntimeReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Overall Downtime (mins)', kpiData.totalDowntime], ['No. of Losses', kpiData.noOfLosses], ['Most Lost Category', kpiData.mostLostCat], ['Avg Loss Duration', kpiData.avgLossDuration]] },
      { name: 'Category Downtime', rows: [['Category', 'Duration (mins)', 'Occurrence'], ...categoryData.map(d => [d.category, d.duration, d.occurrence])] },
      { name: 'Downtime Details', rows: [['Category', 'Sub-Category', 'Start Time', 'End Time', 'Duration (mins)', 'Occurrence', 'Machine', 'Reason'], ...tableData.map(d => [d.category, d.subCategory, d.startTime, d.endTime, d.duration, d.occurrence, d.machine, d.reason])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Downtime (Loss) Report"
        icon={Timer}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'period', value: period, onChange: setPeriod },
          { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
          { type: 'dropdown', label: 'Shift', options: ['All','Shift 1','Shift 2','Shift 3'], value: shift, onChange: setShift },
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02','ST-03'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Model Family', options: ['All','Pulsar','Dominar','Avenger'], value: modelFamily, onChange: setModelFamily },
          { type: 'dropdown', label: 'Model', options: ['All','Pulsar 150','Pulsar 220','Dominar 400'], value: model, onChange: setModel },
          { type: 'dropdown', label: 'SKU', options: ['All','UG5','UG6','STD'], value: sku, onChange: setSku }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Overall Downtime (mins)" value={kpiData.totalDowntime} />
          <StatCard title="No. of Losses" value={kpiData.noOfLosses} />
          <StatCard title="Most Lost Category" value={kpiData.mostLostCat} />
          <StatCard title="Avg Loss Duration (mins)" value={kpiData.avgLossDuration} />
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Overall Downtime Minutes by Period</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="#f43f5e" name="Duration (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Category-wise Downtime with Duration</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" orientation="left" stroke="#f43f5e" />
                  <YAxis yAxisId="right" orientation="right" stroke="#0369a1" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="duration" fill="#f43f5e" name="Duration (mins)" />
                  <Line yAxisId="right" type="monotone" dataKey="occurrence" stroke="#0369a1" name="Occurrence Count" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Category-wise Loss with Occurrence Count</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occurrence" fill="#f97316" name="Occurrence Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Downtime Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
