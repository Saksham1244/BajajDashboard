import { matchFilter } from '../../utils/filterUtils';
import React from 'react';
import { Workflow } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function ConveyorReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [dbData, setDbData] = React.useState(null);

  const [line, setLine] = React.useState('All');
  const [station, setStation] = React.useState('All');
  const [model, setModel] = React.useState('All');
  const [sku, setSku] = React.useState('All');

  React.useEffect(() => {
    fetch(`/api/process/conveyor?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, startDate, endDate, line, station, model, sku]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const rawTable = dbData?.table || [];

  const tableData = rawTable.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station) &&
    matchFilter(d.model, model) &&
    matchFilter(d.sku, sku)
  );

  const affectedStationsData = (dbData?.stations || []).slice(0, 5);

  const totalStoppages = dbData?.kpis?.totalStoppages ?? tableData.reduce((acc, d) => acc + (Number(d.stoppageCount) || 0), 0);
  const avgSpeed = dbData?.kpis?.speedMpm ?? (tableData.length > 0 ? (tableData.reduce((acc, d) => acc + (Number(d.actualSpeed) || 0), 0) / tableData.length).toFixed(1) : '0.0');
  const maxDeviation = dbData?.kpis?.maxDeviation ?? (tableData.length > 0 ? tableData[0].deviation : '0%');
  const efficiency = dbData?.kpis?.uptimePct ? `${dbData.kpis.uptimePct}%` : (tableData.length > 0 ? '100%' : '0%');

  const affectedReasonsData = (dbData?.reasons || []).slice(0, 5);

  const tableColumns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Line', accessor: 'line' },
    { header: 'Model', accessor: 'model' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Planned Speed (m/min)', accessor: 'plannedSpeed' },
    { header: 'Actual Speed (m/min)', accessor: 'actualSpeed' },
    { header: 'Deviation %', accessor: 'deviation' },
    { header: 'Stoppage Count', accessor: 'stoppageCount' },
    { header: 'Total Stoppage Time (mins)', accessor: 'totalStoppageTime' },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{val}</span>
    )},
  ];

  const exportToExcel = () => {
    exportToXLSX('ConveyorReport.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Avg Speed', `${avgSpeed} m/min`], ['Max Deviation', maxDeviation], ['Total Stoppages', totalStoppages], ['Efficiency', efficiency]] },
      { name: 'Affected Stations', rows: [['Station', 'Downtime'], ...affectedStationsData.map(d => [d.station, d.downtime])] },
      { name: 'Conveyor Performance', rows: [['Station', 'Line', 'Model', 'SKU', 'Planned Speed', 'Actual Speed', 'Deviation %', 'Stoppage Count', 'Stoppage Time', 'Status'], ...tableData.map(d => [d.station, d.line, d.model, d.sku, d.plannedSpeed, d.actualSpeed, d.deviation, d.stoppageCount, d.totalStoppageTime, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Conveyor Report"
        icon={Workflow}
        period={period}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Speed (m/min)" value={avgSpeed} color="blue" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Max Speed Deviation" value={maxDeviation} color="red" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Stoppages" value={totalStoppages} color="orange" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Conveyor Efficiency %" value={efficiency} color="green" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Conveyor Speed Affected Stations</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={affectedStationsData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="station" 
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700">
                            <p className="font-bold text-amber-400">{data.station}</p>
                            <p className="mt-1">Downtime: <span className="font-semibold text-white">{data.downtime} mins</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="downtime" name="Downtime (mins)" fill="#f97316" maxBarSize={45} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Speed Affected Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={affectedReasonsData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="reason" 
                    interval={0}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => (val && val.length > 14 ? `${val.substring(0, 12)}…` : val)}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700">
                            <p className="font-bold text-sky-400">{data.reason}</p>
                            <p className="mt-1">Stoppage Count: <span className="font-semibold text-white">{data.count}</span></p>
                            <p>Downtime: <span className="font-semibold text-amber-400">{data.downtime || 0} mins</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Stoppage Count" fill="#0284c7" maxBarSize={45} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Conveyor Performance Details</h3>
          <DataTable columns={tableColumns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
