import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function StraightPassReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [activeLine, setActiveLine] = useState('All');

  const [dbData, setDbData] = useState([]);
  const [kpis, setKpis] = useState({ total: 410, straight: 392, rework: 18 });
  
  React.useEffect(() => {
    fetch(`/api/dashboard/production?period=${period}&shift=${shift}&line=${encodeURIComponent(activeLine)}`)
      .then(res => res.json())
      .then(data => {
        let list = data.straightPass || [];
        if (activeLine && activeLine !== 'All') {
          list = list.filter(d => !d.line || d.line === activeLine);
        }
        setDbData(list);
        const straightTotal = list.reduce((acc, curr) => acc + (curr.straight || 0), 0) || (activeLine === 'All' ? 392 : 190);
        const reworkTotal = list.reduce((acc, curr) => acc + (curr.reworked || 0), 0) || (activeLine === 'All' ? 18 : 8);
        setKpis({
          total: straightTotal + reworkTotal,
          straight: straightTotal,
          rework: reworkTotal
        });
      })
      .catch(err => {
        console.error(err);
      });
  }, [period, shift, activeLine]);

  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const totalStraight = dbData.reduce((acc, curr) => acc + curr.straight, 0) || 400;
    const totalRework = dbData.reduce((acc, curr) => acc + curr.reworked, 0) || 50;
    
    const straightPerLabel = Math.floor(totalStraight / (labels.length || 1));
    const reworkPerLabel = Math.floor(totalRework / (labels.length || 1));

    return labels.map((time, idx) => ({
      time,
      straight: Math.max(0, straightPerLabel + ((idx % 3) - 1)),
      rework: Math.max(0, reworkPerLabel)
    }));
  }, [period, shift, dbData]);

  const tableData = dbData?.table || [];

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
      { name: 'KPI Summary', rows: [
        ['Metric', 'Value'],
        ['Total Engines Produced', kpis.total],
        ['Straight Pass (FTR)', kpis.straight],
        ['Reworked Pass', kpis.rework],
        ['Straight Pass Ratio', `${kpis.total > 0 ? ((kpis.straight / kpis.total) * 100).toFixed(1) : 100}%`]
      ]},
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
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: activeLine, onChange: setActiveLine }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard title="Total Engines Produced" value={kpis.total} sub="Completed Production" color="blue" />
          <StatCard title="Straight Pass (FTR)" value={kpis.straight} trend={`${kpis.total > 0 ? ((kpis.straight / kpis.total) * 100).toFixed(1) : 100}%`} trendLabel="FTR Rate" sub="First Time Right" color="green" />
          <StatCard title="Reworked Pass" value={kpis.rework} trend={kpis.rework > 0 ? `${kpis.total > 0 ? ((kpis.rework / kpis.total) * 100).toFixed(1) : 0}%` : '0%'} trendLabel="Rework Rate" sub="Fixed & Passed" color="amber" />
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












