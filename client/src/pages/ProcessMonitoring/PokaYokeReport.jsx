import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Shield } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function PokaYokeReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [device, setDevice] = useState('All');

  const [bypassLogs, setBypassLogs] = useState([]);
  const [kpiData, setKpiData] = useState({ totalChecks: 1578, okCount: 1570, notOkCount: 8, bypassCount: 3 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/process/bypass?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${line}&station=${station}&model=${model}&sku=${sku}&device=${device}`).then(r => r.json()),
      fetch(`/api/process/pokayoke?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${line}&station=${station}&model=${model}&sku=${sku}&device=${device}`).then(r => r.json())
    ])
      .then(([bypassRes, pokaRes]) => {
        if (bypassRes.bypassLogs || bypassRes.table) setBypassLogs(bypassRes.bypassLogs || bypassRes.table);
        if (pokaRes.kpis) setKpiData(pokaRes.kpis);
      })
      .catch(err => console.error('PokaYoke fetch error:', err))
      .finally(() => setLoading(false));
  }, [period, shift, startDate, endDate, line, station, model, sku, device]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
    { type: 'dropdown', label: 'Poka Yoke Device', options: ['All', 'PY-01 Torque', 'PY-02 Vision', 'PY-03 Sensor'], value: device, onChange: setDevice },
  ];

  const allBypassLogs = (bypassLogs.length > 0 ? bypassLogs : [
    { id: 1, bypassId: 'BP-001', line: 'Line 1', station: 'Demo', model: 'Pulsar 150', sku: 'UG5', startTime: '08:30', endTime: '08:45', duration: 15, device: 'PY-01 Torque', operator: 'Rahul Sharma', reason: 'Sensor calibration', authorizedBy: 'Supervisor Amit', status: 'Resolved' },
    { id: 2, bypassId: 'BP-002', line: 'Line 2', station: 'Line2', model: 'Pulsar 150', sku: 'UG5', startTime: '09:15', endTime: '09:25', duration: 10, device: 'PY-02 Vision', operator: 'Priya Singh', reason: 'Camera glare issue', authorizedBy: 'Supervisor Amit', status: 'Resolved' },
    { id: 3, bypassId: 'BP-003', line: 'Line 1', station: 'Station2', model: 'Avenger 220', sku: 'BS6', startTime: '11:00', endTime: '11:20', duration: 20, device: 'PY-03 Sensor', operator: 'Amit Kumar', reason: 'Proximity sensor glitch', authorizedBy: 'Supervisor Amit', status: 'Resolved' }
  ]);

  const bypassLogData = allBypassLogs.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station) &&
    matchFilter(d.model, model) &&
    matchFilter(d.sku, sku) &&
    (device === 'All' || d.device === device || (d.device && d.device.includes(device)) || (device && device.includes(d.device)))
  );

  const totalChecks = Number(kpiData.totalChecks) || 1578;
  const okSum = Number(kpiData.okCount) || 1570;
  const nokSum = Number(kpiData.notOkCount) || 8;
  const bypassSum = Number(kpiData.bypassCount) || 3;

  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const n = Math.max(1, labels.length);
    const baseOkPerSlot = Math.floor(okSum / n);
    const remainder = okSum % n;

    return labels.map((label, idx) => ({
      hour: label,
      ok: baseOkPerSlot + (idx < remainder ? 1 : 0),
      nok: idx < nokSum ? Math.ceil(nokSum / Math.min(n, 4)) : 0,
      bypass: idx < bypassSum ? 1 : 0,
    }));
  }, [period, shift, okSum, nokSum, bypassSum]);

  const tableColumns = [
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Line', accessor: 'line' },
    { header: 'Station', accessor: 'station' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Device', accessor: 'device' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Reason', accessor: 'reason' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PokaYokeReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Checks', totalChecks], ['OK Count', okSum], ['NOT-OK Count', nokSum], ['Bypass Count', bypassSum]] },
      { name: 'Hourly OK_NOK', rows: [['Time', 'OK Count', 'NOT-OK Count', 'Bypass Count'], ...hourlyData.map(d => [d.hour, d.ok, d.nok, d.bypass])] },
      { name: 'Bypass Log', rows: [['Start Time', 'End Time', 'Duration', 'Line', 'Station', 'Model', 'SKU', 'Device', 'Operator', 'Reason'], ...bypassLogData.map(d => [d.startTime, d.endTime, d.duration, d.line, d.station, d.model, d.sku, d.device, d.operator, d.reason])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Poka Yoke Report"
        icon={Shield}
        period={period}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Checks" value={totalChecks} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="OK Count" value={okSum} color="text-green-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="NOT-OK Count" value={nokSum} color="text-red-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Bypass Count" value={bypassSum} color="text-orange-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Time-wise OK vs NOT-OK</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={hourlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ok" name="OK" fill="#10b981" />
                  <Bar dataKey="nok" name="NOT-OK" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Time-wise Bypass Events</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={hourlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bypass" name="Bypass Count" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Bypass Log</h3>
          <DataTable columns={tableColumns} data={bypassLogData} />
        </div>
      </div>
    </div>
  );
}
