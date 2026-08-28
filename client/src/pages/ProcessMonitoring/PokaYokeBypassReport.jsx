import React from 'react';
import { ShieldAlert } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function PokaYokeBypassReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [dbData, setDbData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const [line, setLine] = React.useState('All');
  const [station, setStation] = React.useState('All');
  const [device, setDevice] = React.useState('All');
  const [model, setModel] = React.useState('All');

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Device', options: ['All', 'PY-01 Torque', 'PY-02 Vision', 'PY-03 Sensor'], value: device, onChange: setDevice },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
  ];

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const allTableData = [
    { bypassId: 'BP-001', datetime: '2026-08-25 08:30', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 1', model: 'Pulsar 150', duration: 15, operator: 'John Doe', reason: 'Sensor Failure', authorizedBy: 'Manager A', status: 'Active' },
    { bypassId: 'BP-002', datetime: '2026-08-25 10:15', line: 'Line 2', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 1', model: 'Dominar 400', duration: 30, operator: 'Jane Smith', reason: 'Network Issue', authorizedBy: 'Manager B', status: 'Resolved' },
    { bypassId: 'BP-003', datetime: '2026-08-26 12:00', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 2', model: 'Pulsar 150', duration: 10, operator: 'Bob Brown', reason: 'Calibration', authorizedBy: 'Manager A', status: 'Resolved' },
    { bypassId: 'BP-004', datetime: '2026-08-26 14:45', line: 'Line 2', station: 'ST-03', device: 'PY-03 Sensor', shift: 'Shift 2', model: 'Dominar 400', duration: 45, operator: 'Alice Green', reason: 'Device Replacement', authorizedBy: 'Manager C', status: 'Active' },
    { bypassId: 'BP-005', datetime: '2026-08-27 16:30', line: 'Line 1', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 3', model: 'Pulsar 150', duration: 20, operator: 'Charlie Black', reason: 'Maintenance', authorizedBy: 'Manager B', status: 'Resolved' },
  ];

  const tableData = allTableData.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (device === 'All' || d.device === device) &&
    (model === 'All' || d.model === model)
  );

  const totalBypasses = Math.max(1, Math.round(tableData.length * (period === 'Month' ? 5 : period === 'Week' ? 2 : 1)));
  const activeBypasses = tableData.filter(d => d.status === 'Active').length;
  const maxDuration = Math.max(...tableData.map(d => d.duration), 15);
  const totalDuration = tableData.reduce((acc, d) => acc + d.duration, 0);

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
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Bypasses', totalBypasses], ['Active Bypasses', activeBypasses], ['Max Duration', `${maxDuration} mins`], ['Total Duration', `${totalDuration} mins`]] },
      { name: 'Bypass Details', rows: [['Bypass ID', 'Date & Time', 'Line', 'Station', 'Device', 'Shift', 'Model', 'Duration', 'Operator', 'Reason', 'Authorized By'], ...tableData.map(d => [d.bypassId, d.datetime, d.line, d.station, d.device, d.shift, d.model, d.duration, d.operator, d.reason, d.authorizedBy])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Poka Yoke Bypass Report"
        icon={ShieldAlert}
        period={period}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Bypasses" value={totalBypasses} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Active Bypasses" value={activeBypasses} color="text-orange-500" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Max Duration" value={`${maxDuration} mins`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Duration" value={`${totalDuration} mins`} />
        </div>
        
        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Bypass Details</h3>
          <DataTable columns={tableColumns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
