import React, { useState, useEffect, useMemo } from 'react';
import { Shield } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function PokaYokeReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const [device, setDevice] = useState('All');
  const [bypassLogs, setBypassLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/process/bypass?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.bypassLogs) {
          setBypassLogs(data.bypassLogs);
        }
      })
      .catch(err => console.error('Bypass fetch error:', err))
      .finally(() => setLoading(false));
  }, [period, shift, startDate, endDate]);

  const customFilters = [
    { type: 'dropdown', label: 'Poka Yoke Device', options: ['All', 'PY-01 Torque', 'PY-02 Vision', 'PY-03 Sensor'], value: device, onChange: setDevice },
  ];

  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    return labels.map((label, idx) => ({
      hour: label,
      ok: 120 + ((idx * 7) % 25),
      nok: idx % 5 === 0 ? 1 : 0,
      bypass: idx % 7 === 0 ? 1 : 0,
    }));
  }, [period, shift]);

  const bypassLogData = (bypassLogs.length > 0 ? bypassLogs : [
    { id: 1, startTime: '09:15', endTime: '09:20', duration: 5, station: 'ST-01', device: 'PY-01 Torque Bypass', operator: 'Rahul Sharma', reason: 'Sensor calibration', authorizedBy: 'Supervisor Amit', status: 'Resolved' }
  ]).filter(d => device === 'All' || d.device === device || device.includes(d.device));

  const okSum = hourlyData.reduce((acc, d) => acc + d.ok, 0);
  const nokSum = hourlyData.reduce((acc, d) => acc + d.nok, 0);
  const bypassSum = hourlyData.reduce((acc, d) => acc + d.bypass, 0);
  const totalChecks = okSum + nokSum;

  const tableColumns = [
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Station', accessor: 'station' },
    { header: 'Device', accessor: 'device' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Reason', accessor: 'reason' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PokaYokeReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Checks', totalChecks], ['OK Count', okSum], ['NOT-OK Count', nokSum], ['Bypass Count', bypassSum]] },
      { name: 'Hourly OK_NOK', rows: [['Time', 'OK Count', 'NOT-OK Count', 'Bypass Count'], ...hourlyData.map(d => [d.hour, d.ok, d.nok, d.bypass])] },
      { name: 'Bypass Log', rows: [['Start Time', 'End Time', 'Duration', 'Station', 'Device', 'Operator', 'Reason'], ...bypassLogData.map(d => [d.startTime, d.endTime, d.duration, d.station, d.device, d.operator, d.reason])] }
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
