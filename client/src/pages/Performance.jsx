import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import { generateTimeLabels } from '../utils/timeDataGenerator';

const GaugeChart = ({ title, value, color }) => {
  const data = [{ name: 'Achieved', value }, { name: 'Remaining', value: 100 - value }];
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
          <span className="text-xl font-black" style={{ color }}>{value}%</span>
        </div>
      </div>
    </div>
  );
};

export default function Performance() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [dbData, setDbData] = useState(null);
  

  React.useEffect(() => {
    
    fetch(`http://localhost:5000/api/dashboard/performance?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
        
      })
      .catch(err => {
        console.error(err);
        
      });
  }, [period, shift]);

  const kpis = dbData?.kpis || { oee: 60.15, availability: 70.58, performance: 90.46, ole: 91.85 };
  
  const stackedData = dbData?.downtime?.map(d => ({
    name: d.category,
    runTime: 3000 - (d.duration * 10),
    downTime: d.duration * 10
  })) || [
    { name: 'Kiln Phase', runTime: 3000, downTime: 300 },
    { name: 'Pre Learning', runTime: 3100, downTime: 350 },
    { name: 'Packing', runTime: 3300, downTime: 400 },
    { name: 'Proportioning', runTime: 3500, downTime: 250 },
    { name: 'Grinding', runTime: 3600, downTime: 300 },
  ];

  const lineData = useMemo(() => {
    return generateTimeLabels(period, shift).map(time => ({
      time,
      cost: Math.floor(Math.random() * 100) + 150,
      forecast: Math.floor(Math.random() * 100) + 150
    }));
  }, [period, shift]);

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
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Product Quantity"  value="10,994" trend={14} subtitle="Target: 9,472" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Product Rework Qty"  value="58,089" trend={-88} subtitle="vs Last Month 150,626" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Production Cost"  value="$12 K" trend={-89} subtitle="vs Last Month $33 K" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Direct Labor Cost"  value="$3 K" trend={-90} subtitle="vs Last Month $7 K" />
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
