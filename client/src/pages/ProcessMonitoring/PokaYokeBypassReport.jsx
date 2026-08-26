import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function PokaYokeBypassReport() {
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

  const tableData = [
    { bypassId: 'BP-001', datetime: '2023-10-25 08:30', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 1', model: 'Pulsar 150', duration: 15, operator: 'John Doe', reason: 'Sensor Failure', authorizedBy: 'Manager A' },
    { bypassId: 'BP-002', datetime: '2023-10-25 10:15', line: 'Line 2', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 1', model: 'Dominar 400', duration: 30, operator: 'Jane Smith', reason: 'Network Issue', authorizedBy: 'Manager B' },
    { bypassId: 'BP-003', datetime: '2023-10-25 12:00', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 2', model: 'Pulsar 150', duration: 10, operator: 'Bob Brown', reason: 'Calibration', authorizedBy: 'Manager A' },
    { bypassId: 'BP-004', datetime: '2023-10-25 14:45', line: 'Line 2', station: 'ST-03', device: 'PY-03 Sensor', shift: 'Shift 2', model: 'Dominar 400', duration: 45, operator: 'Alice Green', reason: 'Device Replacement', authorizedBy: 'Manager C' },
    { bypassId: 'BP-005', datetime: '2023-10-25 16:30', line: 'Line 1', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 3', model: 'Pulsar 150', duration: 20, operator: 'Charlie Black', reason: 'Maintenance', authorizedBy: 'Manager B' },
  ];

  const tableColumns = [
    { header: 'Bypass ID', accessor: 'bypassId' },
    { header: 'Date & Time', accessor: 'datetime' },
    { header: 'Line', accessor: 'line' },
    { header: 'Station', accessor: 'station' },
    { header: 'Device', accessor: 'device' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Model', accessor: 'model' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Authorized By', accessor: 'authorizedBy' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PokaYokeBypassReport.xlsx', [
      { name: 'KPI Summary', rows: [['Total Bypasses', 'Active Bypasses', 'Max Duration', 'Total Duration'], [5, 1, 45, 120]] },
      { name: 'Bypass Details', rows: [['Bypass ID', 'Date & Time', 'Line', 'Station', 'Device', 'Shift', 'Model', 'Duration', 'Operator', 'Reason', 'Authorized By'], ...tableData.map(d => [d.bypassId, d.datetime, d.line, d.station, d.device, d.shift, d.model, d.duration, d.operator, d.reason, d.authorizedBy])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Poka Yoke Bypass Report"
        icon={ShieldAlert}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Bypasses" value="5" />
          <StatCard title="Active Bypasses" value="1" color="text-orange-500" />
          <StatCard title="Max Duration" value="45 mins" />
          <StatCard title="Total Duration" value="120 mins" />
        </div>
        
        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Bypass Details</h3>
          <DataTable columns={tableColumns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
