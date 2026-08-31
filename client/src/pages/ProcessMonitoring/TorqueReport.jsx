import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function TorqueReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [device, setDevice] = useState('All');
  const [torqueData, setTorqueData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/process/torque?device=${device}&sku=${sku}&line=${line}&station=${station}&model=${model}&period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.table) {
          setTorqueData(data.table);
        }
      })
      .catch(err => console.error('Torque fetch error:', err))
      .finally(() => setLoading(false));
  }, [device, sku, line, station, model, period, shift, startDate, endDate]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
    { type: 'dropdown', label: 'Torque Device', options: ['All', 'TD-01', 'TD-02', 'TD-03'], value: device, onChange: setDevice },
  ];

  const rawData = (torqueData.length > 0 ? torqueData : [
    { engineNo: 'ENG-2026-001', model: 'Pulsar 150', sku: 'UG5', line: 'Line 1', station: 'Demo', device: 'TD-01', value: 45.2, minSpec: 42.0, maxSpec: 48.0, result: 'OK', datetime: '2026-02-28 08:30', operator: 'Rahul Sharma' },
    { engineNo: 'ENG-2026-002', model: 'Pulsar 150', sku: 'UG5', line: 'Line 1', station: 'Demo', device: 'TD-01', value: 44.8, minSpec: 42.0, maxSpec: 48.0, result: 'OK', datetime: '2026-02-28 08:45', operator: 'Rahul Sharma' },
    { engineNo: 'ENG-2026-003', model: 'Avenger 220', sku: 'BS6', line: 'Line 2', station: 'Line2', device: 'TD-02', value: 50.1, minSpec: 42.0, maxSpec: 48.0, result: 'NOK', datetime: '2026-02-28 09:10', operator: 'Priya Singh' },
    { engineNo: 'ENG-2026-004', model: 'Dominar 400', sku: 'D400', line: 'Line 1', station: 'Station2', device: 'TD-03', value: 46.5, minSpec: 42.0, maxSpec: 48.0, result: 'OK', datetime: '2026-02-28 09:30', operator: 'Amit Kumar' }
  ]);

  const filteredData = rawData.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station) &&
    matchFilter(d.model, model) &&
    matchFilter(d.sku, sku) &&
    (device === 'All' || d.device === device)
  );

  const totalReadings = filteredData.length;
  const okCount = filteredData.filter(d => d.result === 'OK').length;
  const notOkCount = totalReadings - okCount;
  const avgTorque = totalReadings > 0 ? (filteredData.reduce((acc, d) => acc + (Number(d.value) || 0), 0) / totalReadings).toFixed(1) : '0.0';

  const tableColumns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Line', accessor: 'line' },
    { header: 'Station', accessor: 'station' },
    { header: 'Torque Device', accessor: 'device' },
    { header: 'Torque Value (Nm)', accessor: 'value' },
    { header: 'Min Spec', accessor: 'minSpec' },
    { header: 'Max Spec', accessor: 'maxSpec' },
    { header: 'Result', accessor: 'result', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val}</span>
    )},
    { header: 'Date & Time', accessor: 'datetime' },
    { header: 'Operator', accessor: 'operator' },
  ];

  const exportToExcel = () => {
    exportToXLSX('TorqueReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Readings', totalReadings], ['OK Count', okCount], ['NOT-OK Count', notOkCount], ['Avg Torque', `${avgTorque} Nm`]] },
      { name: 'Torque Trend', rows: [['Engine No', 'Torque Value'], ...filteredData.map(d => [d.engineNo, d.value])] },
      { name: 'Torque Details', rows: [['Engine No', 'Model', 'SKU', 'Line', 'Station', 'Device', 'Value', 'Min', 'Max', 'Result', 'Datetime', 'Operator'], ...filteredData.map(d => [d.engineNo, d.model, d.sku, d.line, d.station, d.device, d.value, d.minSpec, d.maxSpec, d.result, d.datetime, d.operator])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Torque Report"
        icon={Settings2}
        period={period}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Readings" value={totalReadings} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="OK Count" value={okCount} color="text-green-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="NOT-OK Count" value={notOkCount} color="text-red-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Torque (Nm)" value={`${avgTorque} Nm`} />
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Engine-wise Torque Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="engineNo" />
                <YAxis domain={[35, 55]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Torque Value (Nm)" stroke="#0369a1" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="minSpec" name="Min Spec" stroke="#f43f5e" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="maxSpec" name="Max Spec" stroke="#f43f5e" strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Torque Details</h3>
          <DataTable columns={tableColumns} data={filteredData} />
        </div>
      </div>
    </div>
  );
}
