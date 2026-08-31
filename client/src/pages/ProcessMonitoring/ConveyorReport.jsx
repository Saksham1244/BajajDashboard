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
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [dbData, setDbData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const [line, setLine] = React.useState('All');
  const [station, setStation] = React.useState('All');
  const [model, setModel] = React.useState('All');
  const [sku, setSku] = React.useState('All');

  React.useEffect(() => {
    fetch(`/api/process/conveyor?period=${period}&shift=${shift}&line=${line}&station=${station}&model=${model}&sku=${sku}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station, model, sku]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
  ];

  const rawTable = dbData?.table || [
    { line: 'Line 1', station: 'Demo', model: 'Pulsar 150', sku: 'UG5', plannedSpeed: 2.5, actualSpeed: 2.4, deviation: '-4.0%', stoppageCount: 2, totalStoppageTime: 8, status: 'Active' },
    { line: 'Line 2', station: 'Line2', model: 'Pulsar 150', sku: 'UG5', plannedSpeed: 2.5, actualSpeed: 2.5, deviation: '0.0%', stoppageCount: 0, totalStoppageTime: 0, status: 'Normal' },
    { line: 'Line 1', station: 'Station2', model: 'Avenger 220', sku: 'BS6', plannedSpeed: 2.5, actualSpeed: 2.1, deviation: '-16.0%', stoppageCount: 3, totalStoppageTime: 15, status: 'Active' },
    { line: 'Line 2', station: 'Demo', model: 'Dominar 400', sku: 'D400', plannedSpeed: 2.5, actualSpeed: 2.3, deviation: '-8.0%', stoppageCount: 1, totalStoppageTime: 5, status: 'Normal' }
  ];

  const tableData = rawTable.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku)
  );

  const affectedStationsData = dbData?.stations || tableData.map(d => ({
    station: d.station,
    downtime: d.totalStoppageTime || 0
  }));

  const totalStoppages = dbData?.kpis?.totalStoppages || tableData.reduce((acc, d) => acc + (d.stoppageCount || 0), 0);
  const avgSpeed = dbData?.kpis?.speedMpm || (tableData.length > 0 ? (tableData.reduce((acc, d) => acc + d.actualSpeed, 0) / tableData.length).toFixed(1) : '0.0');
  const maxDeviation = dbData?.kpis?.maxDeviation || (tableData.length > 0 ? tableData[0].deviation : '0%');
  const efficiency = dbData?.kpis?.uptimePct ? `${dbData.kpis.uptimePct}%` : '96.2%';

  const affectedReasonsData = dbData?.reasons || (totalStoppages > 0 ? [
    { reason: 'Part Shortage', count: Math.ceil(totalStoppages * 0.4) },
    { reason: 'Quality Issue', count: Math.ceil(totalStoppages * 0.3) },
    { reason: 'Machine Breakdown', count: Math.floor(totalStoppages * 0.3) }
  ] : []);

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
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Conveyor Speed Affected Stations</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={affectedStationsData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="station" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="downtime" name="Downtime (mins)" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top Speed Affected Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={affectedReasonsData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="reason" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Stoppage Count" fill="#0369a1" />
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
