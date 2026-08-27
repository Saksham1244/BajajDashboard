import React, { useState, useMemo } from 'react';
import { Shield } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function PokaYokeReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [device, setDevice] = useState('All');

  const customFilters = [
    { type: 'dropdown', label: 'Poka Yoke Device', options: ['All', 'PY-01 Torque', 'PY-02 Vision', 'PY-03 Sensor'], value: device, onChange: setDevice },
  ];

  const [dbData, setDbData] = useState({ hourlyOkNotOk: [], hourlyBypass: [] });
  
  React.useEffect(() => {
        fetch(`http://localhost:5000/api/process/pokayoke?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
              })
      .catch(err => {
        console.error(err);
              });
  }, [period, shift]);

  const hourlyData = useMemo(() => {
    if (dbData.hourlyData?.length) return dbData.hourlyData;
    const labels = generateTimeLabels(period, shift);
    return labels.map(label => ({
      hour: label,
      ok: Math.floor(Math.random() * 50) + 100, // Still mock randomized for variation if endpoint doesn't have 16h data
      nok: Math.floor(Math.random() * 5),
      bypass: Math.floor(Math.random() * 3),
    }));
  }, [period, shift, dbData]);

  const bypassLogData = useMemo(() => {
    if (dbData.bypassLogData?.length) return dbData.bypassLogData;
    return [
      { startTime: '09:15', endTime: '09:20', duration: 5, station: 'ST-01', device: 'PY-01 Torque', operator: 'John Doe', reason: 'Sensor malfunction' },
      { startTime: '11:30', endTime: '11:45', duration: 15, station: 'ST-02', device: 'PY-02 Vision', operator: 'Jane Smith', reason: 'Calibration error' },
      { startTime: '13:00', endTime: '13:10', duration: 10, station: 'ST-01', device: 'PY-01 Torque', operator: 'Alice Bob', reason: 'Maintenance' },
      { startTime: '14:20', endTime: '14:25', duration: 5, station: 'ST-02', device: 'PY-02 Vision', operator: 'Charlie Green', reason: 'Software glitch' },
      { startTime: '15:10', endTime: '15:30', duration: 20, station: 'ST-01', device: 'PY-01 Torque', operator: 'Bob Brown', reason: 'Sensor malfunction' },
    ];
  }, [dbData]);

  const kpi = dbData.kpi || {
    totalChecks: "665",
    okCount: "655",
    notOkCount: "10",
    bypassCount: "3"
  };

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
      { name: 'KPI Summary', rows: [['Total Checks', 'OK Count', 'NOT-OK Count', 'Bypass Count'], [kpi.totalChecks, kpi.okCount, kpi.notOkCount, kpi.bypassCount]] },
      { name: 'Hourly OK_NOK', rows: [['Time', 'OK Count', 'NOT-OK Count', 'Bypass Count'], ...hourlyData.map(d => [d.hour, d.ok, d.nok, d.bypass])] },
      { name: 'Bypass Log', rows: [['Start Time', 'End Time', 'Duration', 'Station', 'Device', 'Operator', 'Reason'], ...bypassLogData.map(d => [d.startTime, d.endTime, d.duration, d.station, d.device, d.operator, d.reason])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Poka Yoke Report"
        icon={Shield}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Checks" value={kpi.totalChecks} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="OK Count" value={kpi.okCount} color="text-green-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="NOT-OK Count" value={kpi.notOkCount} color="text-red-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Bypass Count" value={kpi.bypassCount} color="text-orange-600" />
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
