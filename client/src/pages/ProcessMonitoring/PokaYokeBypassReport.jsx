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
  const [dbData, setDbData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const [line, setLine] = React.useState('All');
  const [station, setStation] = React.useState('All');
  const [device, setDevice] = React.useState('All');
  const [model, setModel] = React.useState('All');
  const [sku, setSku] = React.useState('All');

  React.useEffect(() => {
    fetch(`/api/process/bypass?period=${period}&shift=${shift}&line=${line}&station=${station}&model=${model}&sku=${sku}&device=${device}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station, model, sku, device]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Device', options: ['All', 'PY-01 Torque', 'PY-02 Vision', 'PY-03 Sensor'], value: device, onChange: setDevice },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const rawTable = dbData?.table || dbData?.bypassLogs || [
    { id: '1', bypassId: 'BP-001', datetime: '2026-02-28 08:30', line: 'Line 1', station: 'Demo', device: 'PY-01 Torque', shift: 'Shift 1', model: 'Pulsar 150', sku: 'UG5', duration: 15, operator: 'Rahul Sharma', reason: 'Sensor calibration', authorizedBy: 'Supervisor Amit', status: 'Resolved' },
    { id: '2', bypassId: 'BP-002', datetime: '2026-02-28 09:15', line: 'Line 2', station: 'Line2', device: 'PY-02 Vision', shift: 'Shift 1', model: 'Pulsar 150', sku: 'UG5', duration: 10, operator: 'Priya Singh', reason: 'Camera glare issue', authorizedBy: 'Supervisor Amit', status: 'Resolved' },
    { id: '3', bypassId: 'BP-003', datetime: '2026-02-28 11:00', line: 'Line 1', station: 'Station2', device: 'PY-03 Sensor', shift: 'Shift 2', model: 'Avenger 220', sku: 'BS6', duration: 20, operator: 'Amit Kumar', reason: 'Proximity sensor glitch', authorizedBy: 'Supervisor Amit', status: 'Active' },
    { id: '4', bypassId: 'BP-004', datetime: '2026-02-28 14:30', line: 'Line 2', station: 'Demo', device: 'PY-01 Torque', shift: 'Shift 2', model: 'Dominar 400', sku: 'D400', duration: 12, operator: 'Neha Verma', reason: 'Tool replacement', authorizedBy: 'Supervisor Amit', status: 'Resolved' }
  ];

  const tableData = rawTable.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (device === 'All' || d.device === device || (d.device && d.device.includes(device)) || (device && device.includes(d.device))) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku)
  );

  const totalBypasses = dbData?.kpis?.totalBypasses || tableData.length;
  const activeBypasses = dbData?.kpis?.activeBypasses || tableData.filter(d => d.status === 'Active').length;
  const maxDuration = tableData.length > 0 ? Math.max(...tableData.map(d => d.duration || 0), 0) : 0;
  const totalDuration = tableData.reduce((acc, d) => acc + (d.duration || 0), 0);

  const tableColumns = [
    { header: 'Bypass ID', accessor: 'bypassId' },
    { header: 'Date & Time', accessor: 'datetime' },
    { header: 'Line', accessor: 'line' },
    { header: 'Station', accessor: 'station' },
    { header: 'Device', accessor: 'device' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Authorized By', accessor: 'authorizedBy' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PokaYokeBypassReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Bypasses', totalBypasses], ['Active Bypasses', activeBypasses], ['Max Duration', `${maxDuration} mins`], ['Total Duration', `${totalDuration} mins`]] },
      { name: 'Bypass Details', rows: [['Bypass ID', 'Date & Time', 'Line', 'Station', 'Device', 'Shift', 'Model', 'SKU', 'Duration', 'Operator', 'Reason', 'Authorized By'], ...tableData.map(d => [d.bypassId, d.datetime, d.line, d.station, d.device, d.shift, d.model, d.sku, d.duration, d.operator, d.reason, d.authorizedBy])] }
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
