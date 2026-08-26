import React from 'react';
import { ShieldAlert } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function PokaYokeBypassReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [dbData, setDbData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const customFilters = [];

  React.useEffect(() => {
    setLoading(true);
    // You can share the pokayoke endpoint or use a specific bypass one if it exists.
    fetch(`http://localhost:5000/api/process/bypass?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [period, shift]);

  const tableData = React.useMemo(() => {
    if (dbData.table?.length) return dbData.table;
    return [
      { bypassId: 'BP-001', datetime: '2023-10-25 08:30', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 1', model: 'Pulsar 150', duration: 15, operator: 'John Doe', reason: 'Sensor Failure', authorizedBy: 'Manager A' },
      { bypassId: 'BP-002', datetime: '2023-10-25 10:15', line: 'Line 2', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 1', model: 'Dominar 400', duration: 30, operator: 'Jane Smith', reason: 'Network Issue', authorizedBy: 'Manager B' },
      { bypassId: 'BP-003', datetime: '2023-10-25 12:00', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 2', model: 'Pulsar 150', duration: 10, operator: 'Bob Brown', reason: 'Calibration', authorizedBy: 'Manager A' },
      { bypassId: 'BP-004', datetime: '2023-10-25 14:45', line: 'Line 2', station: 'ST-03', device: 'PY-03 Sensor', shift: 'Shift 2', model: 'Dominar 400', duration: 45, operator: 'Alice Green', reason: 'Device Replacement', authorizedBy: 'Manager C' },
      { bypassId: 'BP-005', datetime: '2023-10-25 16:30', line: 'Line 1', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 3', model: 'Pulsar 150', duration: 20, operator: 'Charlie Black', reason: 'Maintenance', authorizedBy: 'Manager B' },
    ];
  }, [dbData]);

  const kpi = dbData.kpis || {
    totalBypasses: 5,
    activeBypasses: 1,
    maxDuration: '45 mins',
    totalDuration: '120 mins'
  };

  const tableColumns = [
    { header: 'Bypass ID', accessor: 'id' },
    { header: 'Date & Time', accessor: 'date' },
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
      { name: 'KPI Summary', rows: [['Total Bypasses', 'Active Bypasses', 'Max Duration', 'Total Duration'], [kpi.totalBypasses, kpi.activeBypasses, kpi.maxDuration, kpi.totalDuration]] },
      { name: 'Bypass Details', rows: [['Bypass ID', 'Date & Time', 'Line', 'Station', 'Device', 'Shift', 'Model', 'Duration', 'Operator', 'Reason', 'Authorized By'], ...tableData.map(d => [d.id || d.bypassId, d.date || d.datetime, d.line, d.station, d.device, d.shift, d.model, d.duration, d.operator, d.reason, d.authorizedBy])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Poka Yoke Bypass Report"
        icon={ShieldAlert}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Bypasses" value={kpi.totalBypasses} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Active Bypasses" value={kpi.activeBypasses} color="text-orange-500" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Max Duration" value={kpi.maxDuration} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Duration" value={kpi.totalDuration} />
        </div>
        
        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Bypass Details</h3>
          <DataTable columns={tableColumns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
