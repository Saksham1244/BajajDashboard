import React from 'react';
import { Workflow } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function ConveyorReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [dbData, setDbData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const customFilters = [];

  React.useEffect(() => {
        fetch(`http://localhost:5000/api/process/conveyor?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
              })
      .catch(err => {
        console.error(err);
              });
  }, [period, shift]);

  const affectedStationsData = React.useMemo(() => {
    if (dbData.affectedStationsData?.length) return dbData.affectedStationsData;
    return [
      { station: 'ST-05', downtime: 45 },
      { station: 'ST-12', downtime: 30 },
      { station: 'ST-08', downtime: 25 },
      { station: 'ST-01', downtime: 20 },
      { station: 'ST-15', downtime: 15 },
    ];
  }, [dbData]);

  const affectedReasonsData = React.useMemo(() => {
    if (dbData.affectedReasonsData?.length) return dbData.affectedReasonsData;
    return [
      { reason: 'Part Shortage', count: 12 },
      { reason: 'Quality Issue', count: 8 },
      { reason: 'Machine Breakdown', count: 6 },
      { reason: 'Operator Unavailable', count: 4 },
      { reason: 'Material Jam', count: 3 },
    ];
  }, [dbData]);

  const tableData = React.useMemo(() => {
    if (dbData.tableData?.length) return dbData.tableData;
    return [
      { station: 'ST-05', plannedSpeed: 10, actualSpeed: 8, deviation: 20, stoppageCount: 3, totalStoppageTime: 45, status: 'Active' },
      { station: 'ST-12', plannedSpeed: 10, actualSpeed: 9, deviation: 10, stoppageCount: 2, totalStoppageTime: 30, status: 'Active' },
      { station: 'ST-08', plannedSpeed: 10, actualSpeed: 7, deviation: 30, stoppageCount: 5, totalStoppageTime: 25, status: 'Resolved' },
      { station: 'ST-01', plannedSpeed: 10, actualSpeed: 9.5, deviation: 5, stoppageCount: 1, totalStoppageTime: 20, status: 'Active' },
      { station: 'ST-15', plannedSpeed: 10, actualSpeed: 8.5, deviation: 15, stoppageCount: 2, totalStoppageTime: 15, status: 'Resolved' },
    ];
  }, [dbData]);

  const kpi = dbData.kpi || {
    avgSpeed: 8.4,
    maxDeviation: '30%',
    totalStoppages: 13,
    efficiency: '85%'
  };

  const tableColumns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Planned Speed (m/min)', accessor: 'plannedSpeed' },
    { header: 'Actual Speed (m/min)', accessor: 'actualSpeed' },
    { header: 'Deviation %', accessor: 'deviation' },
    { header: 'Stoppage Count', accessor: 'stoppageCount' },
    { header: 'Total Stoppage Time (mins)', accessor: 'totalStoppageTime' },
    { header: 'Status', accessor: 'status' },
  ];

  const exportToExcel = () => {
    exportToXLSX('ConveyorReport.xlsx', [
      { name: 'KPI Summary', rows: [['Avg Speed', 'Max Deviation', 'Total Stoppages', 'Efficiency'], [kpi.avgSpeed, kpi.maxDeviation, kpi.totalStoppages, kpi.efficiency]] },
      { name: 'Affected Stations', rows: [['Station', 'Downtime'], ...affectedStationsData.map(d => [d.station, d.downtime])] },
      { name: 'Conveyor Performance', rows: [['Station', 'Planned Speed', 'Actual Speed', 'Deviation %', 'Stoppage Count', 'Stoppage Time', 'Status'], ...tableData.map(d => [d.station, d.plannedSpeed, d.actualSpeed, d.deviation, d.stoppageCount, d.totalStoppageTime, d.status])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Conveyor Report"
        icon={Workflow}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Avg Speed (m/min)" value={kpi.avgSpeed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Max Speed Deviation" value={kpi.maxDeviation} color="text-red-500" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Stoppages" value={kpi.totalStoppages} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Conveyor Efficiency %" value={kpi.efficiency} color="text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Conveyor Speed Affected Stations</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
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
            <h3 className="text-sm font-bold text-brand-dark mb-3">Top 5 Speed Affected Reasons</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
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
