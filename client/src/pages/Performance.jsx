import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import { generateTimeLabels } from '../utils/timeDataGenerator';

const GaugeChart = ({ title, value, color }) => {
  const numValue = Number(value) || 0;
  const data = [{ name: 'Achieved', value: numValue }, { name: 'Remaining', value: Math.max(0, 100 - numValue) }];
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-[13px] font-bold text-brand-dark mb-2">{title}</h3>
      <div className="h-[90px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="100%"
              startAngle={180} endAngle={0}
              innerRadius={50} outerRadius={70}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span className="text-xl font-black" style={{ color }}>{numValue.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default function Performance() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/dashboard/performance?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [period, shift, startDate, endDate]);

  const kpis = dbData?.kpis || { oee: 0, availability: 0, performance: 0, ole: 0 };
  
  const stackedData = dbData?.downtime?.map(d => ({
    name: d.name || d.category,
    runTime: d.runTime || 0,
    downTime: d.downTime || 0
  })) || [];

  const lineData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    if (!dbData || (!dbData.downtime && !dbData.kpis)) {
      return labels.map(time => ({ time, cost: 0, forecast: 0 }));
    }
    return labels.map((time, idx) => ({
      time,
      cost: Number(kpis.oee) > 0 ? (100 + ((idx * 5) % 20)) : 0,
      forecast: Number(kpis.oee) > 0 ? (105 + ((idx * 4) % 15)) : 0
    }));
  }, [period, shift, dbData, kpis.oee]);

  const exportToExcel = () => {
    exportToXLSX('Performance_Report.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Current', 'Trend'], ['OEE', '76.4%', '+2.1%'], ['Availability', '85.2%', '-0.5%'], ['Performance', '91.8%', '+1.2%'], ['Quality', '98.5%', '+0.1%']] },
      { name: 'MTBF & MTTR', rows: [['Phase', 'Run Time (hrs)', 'Down Time (hrs)'], ...stackedData.map(d => [d.name, d.runTime, d.downTime])] },
      { name: 'Production Cost', rows: [['Time', 'Product Cost', 'Forecast'], ...lineData.map(d => [d.time, d.cost, d.forecast])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Performance Report"
        icon={Activity}
        onExcelClick={exportToExcel}
        filters={getBaseFilters()}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Plant OEE" value={`${kpis.oee}%`} sub="Overall Equipment Efficiency" color="blue" />
          <StatCard title="Availability Rate" value={`${kpis.availability}%`} sub="Operating vs Planned Time" color="green" />
          <StatCard title="Performance Rate" value={`${kpis.performance}%`} sub="Speed & Throughput Index" color="amber" />
          <StatCard title="Overall Line Eff. (OLE)" value={`${kpis.ole}%`} sub="Total Line Efficiency" color="purple" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Runtime v/s Downtime</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="downTime" name="Down Time" fill="#475569" stackId="a" />
                  <Bar dataKey="runTime" name="Run Time" fill="#f97316" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Production Cost</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <AreaChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#fef08a" fill="#fef08a" fillOpacity={0.3} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="cost" name="Product Cost" stroke="#0ea5e9" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-4 py-6 flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeChart title="Product Availability" value={Number(kpis.availability).toFixed(1)} color="#f97316" />
            <GaugeChart title="Performance" value={Number(kpis.performance).toFixed(1)} color="#334155" />
            <GaugeChart title="Quality / OLE" value={Number(kpis.ole).toFixed(1)} color="#f97316" />
            <GaugeChart title="Equipment Efficiency" value={Number(kpis.oee).toFixed(1)} color="#334155" />
          </div>
        </div>
      </div>
    </div>
  );
}
