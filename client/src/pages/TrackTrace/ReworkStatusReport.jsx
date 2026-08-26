import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { exportToXLSX } from '../../utils/exportExcel';

export default function ReworkStatusReport() {
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
  const [status, setStatus] = useState('All');

  const topDefectsData = [
    { name: 'Torque Fail', count: 45 },
    { name: 'Leakage', count: 32 },
    { name: 'Missing Part', count: 28 },
    { name: 'Scratch', count: 15 },
    { name: 'Misalignment', count: 12 },
  ];

  const topStationsData = [
    { name: 'ST-04', count: 38 },
    { name: 'ST-09', count: 30 },
    { name: 'ST-02', count: 25 },
    { name: 'ST-11', count: 22 },
    { name: 'ST-15', count: 17 },
  ];

  const mockData = [
    { id: 1, engineNo: 'ENG-201', model: 'Pulsar 150', station: 'ST-04', reason: 'Torque Fail', detectedTime: '09:00', reworkStart: '09:15', reworkEnd: '09:30', status: 'Completed', operator: 'OP-RW1', location: 'RW-Area' },
    { id: 2, engineNo: 'ENG-202', model: 'Dominar 400', station: 'ST-09', reason: 'Leakage', detectedTime: '10:00', reworkStart: '10:10', reworkEnd: '-', status: 'In-Progress', operator: 'OP-RW2', location: 'RW-Area' },
    { id: 3, engineNo: 'ENG-203', model: 'Avenger 220', station: 'ST-02', reason: 'Missing Part', detectedTime: '10:30', reworkStart: '-', reworkEnd: '-', status: 'Pending', operator: '-', location: 'Buffer' },
    { id: 4, engineNo: 'ENG-204', model: 'Pulsar 220', station: 'ST-04', reason: 'Torque Fail', detectedTime: '11:00', reworkStart: '11:20', reworkEnd: '11:45', status: 'Completed', operator: 'OP-RW1', location: 'Line' },
    { id: 5, engineNo: 'ENG-205', model: 'Pulsar 150', station: 'ST-11', reason: 'Scratch', detectedTime: '11:30', reworkStart: '11:35', reworkEnd: '11:50', status: 'Rejected', operator: 'OP-RW3', location: 'Scrap' },
  ];

  const columns = [
    { header: 'Engine No (EIN)', accessor: 'engineNo' },
    { header: 'Model', accessor: 'model' },
    { header: 'Defect Station', accessor: 'station' },
    { header: 'Defect Reason', accessor: 'reason' },
    { header: 'Detected Date & Time', accessor: 'detectedTime' },
    { header: 'Rework Start Time', accessor: 'reworkStart' },
    { header: 'Rework End Time', accessor: 'reworkEnd' },
    { header: 'Rework Status', accessor: 'status' },
    { header: 'Rework Operator', accessor: 'operator' },
    { header: 'Current Location', accessor: 'location' },
  ];

  const exportToExcel = () => {
    exportToXLSX('ReworkStatusReport.xlsx', [
      { name: 'KPI Summary', rows: [['Total Rework', 'Pending', 'In-Progress', 'Completed'], [132, 28, 15, 89]] },
      { name: 'Top Defects', rows: [['Defect Name', 'Count'], ...topDefectsData.map(r => [r.name, r.count])] },
      { name: 'Rework Details', rows: [['Engine No', 'Model', 'Station', 'Reason', 'Detected Time', 'Start Time', 'End Time', 'Status', 'Operator', 'Location'], ...mockData.map(r => [r.engineNo, r.model, r.station, r.reason, r.detectedTime, r.reworkStart, r.reworkEnd, r.status, r.operator, r.location])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Rework Status Report"
        icon={RotateCcw}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'period', value: period, onChange: setPeriod },
          { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
          { type: 'dropdown', label: 'Shift', options: ['All', 'Shift 1', 'Shift 2', 'Shift 3'], value: shift, onChange: setShift },
          { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2', 'Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All', 'ST-01', 'ST-02', 'ST-03'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Model Family', options: ['All', 'Pulsar', 'Dominar', 'Avenger'], value: modelFamily, onChange: setModelFamily },
          { type: 'dropdown', label: 'Model', options: ['All', 'Pulsar 150', 'Pulsar 220', 'Dominar 400'], value: model, onChange: setModel },
          { type: 'dropdown', label: 'SKU', options: ['All', 'UG5', 'UG6', 'STD'], value: sku, onChange: setSku },
          { type: 'dropdown', label: 'Status', options: ['All', 'Pending', 'In-Progress', 'Completed', 'Rejected'], value: status, onChange: setStatus },
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Rework" value="132" trend="up" color="red" />
          <StatCard title="Pending" value="28" trend="neutral" color="orange" />
          <StatCard title="In-Progress" value="15" trend="up" color="blue" />
          <StatCard title="Completed" value="89" trend="up" color="green" />
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
          <DataTable columns={columns} data={mockData} />
        </div>
      </div>
    </div>
  );
}
