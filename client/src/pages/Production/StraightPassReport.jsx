import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function StraightPassReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [activeLine, setActiveLine] = useState('All');

  const [dbData, setDbData] = useState([]);
  const [kpis, setKpis] = useState({ total: 410, straight: 392, rework: 18 });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/dashboard/production?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data.straightPass || []);
        const straightTotal = (data.straightPass || []).reduce((acc, curr) => acc + curr.straight, 0);
        const reworkTotal = (data.straightPass || []).reduce((acc, curr) => acc + curr.reworked, 0);
        setKpis({
          total: straightTotal + reworkTotal,
          straight: straightTotal,
          rework: reworkTotal
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [period, shift]);

  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const totalStraight = dbData.reduce((acc, curr) => acc + curr.straight, 0) || 400;
    const totalRework = dbData.reduce((acc, curr) => acc + curr.reworked, 0) || 50;
    
    const straightPerLabel = Math.floor(totalStraight / (labels.length || 1));
    const reworkPerLabel = Math.floor(totalRework / (labels.length || 1));

    return labels.map(time => ({
      time,
      straight: Math.max(0, straightPerLabel + Math.floor(Math.random() * 6 - 3)),
      rework: Math.max(0, reworkPerLabel + Math.floor(Math.random() * 2 - 1))
    }));
  }, [period, shift, dbData]);

  const tableData = [
    { engineNo: 'ENG-2026-00123', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '08:14 AM' },
    { engineNo: 'ENG-2026-00124', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Reworked Pass', time: '08:17 AM' },
    { engineNo: 'ENG-2026-00125', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '08:21 AM' },
    { engineNo: 'ENG-2026-00126', sku: 'Dominar 400', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '08:24 AM' },
    { engineNo: 'ENG-2026-00127', sku: 'Dominar 400', date: '2026-08-25', shift: 'Shift 1', status: 'Reworked Pass', time: '08:45 AM' },
    { engineNo: 'ENG-2026-00128', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:02 AM' },
    { engineNo: 'ENG-2026-00129', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:05 AM' },
    { engineNo: 'ENG-2026-00130', sku: 'Avenger 220', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:12 AM' },
  ];

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'SKU Name', accessor: 'sku' },
    { header: 'Date', accessor: 'date' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Status', accessor: 'status' },
    { header: 'Time', accessor: 'time' }
  ];

  const exportToExcel = () => {
    exportToXLSX('Straight_Pass_Report.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Current', 'Last Month', 'Trend'], ['Straight Pass Ratio', '94.2%', '91.8%', 'UP'], ['Total Engines Tested', '450', '420', 'UP'], ['Rework Loop Count', '26', '34', 'DOWN']] },
      { name: 'Hourly Trend', rows: [['Time', 'Straight Pass', 'Rework'], ...hourlyData.map(r => [r.time, r.straight, r.rework])] },
      { name: 'Traceability Log', rows: [['Engine No', 'SKU', 'Date', 'Shift', 'Status', 'Time'], ...tableData.map(r => [r.engineNo, r.sku, r.date, r.shift, r.status, r.time])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Straight Pass Report"
        icon={CheckCircle2}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2', 'Sub-Assy'], value: activeLine, onChange: setActiveLine }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard autoScale title="Total Engines Produced" value={kpis.total.toLocaleString()} trend={12.5} subtitle="vs Last Month 360" />
          <StatCard autoScale title="Straight Pass (FTR)" value={kpis.straight.toLocaleString()} trend={4.2} subtitle="vs Last Month 340" />
          <StatCard autoScale title="Reworked Pass" value={kpis.rework.toLocaleString()} trend={-18.1} subtitle="vs Last Month 22" />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Hourly Straight Pass vs Reworked Pass</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="straight" name="Straight Pass" fill="#10b981" stackId="a" />
                <Bar dataKey="rework" name="Reworked Pass" fill="#f97316" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Recent Engine Dispatches</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}












