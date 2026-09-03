import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Activity, Gauge, TrendingUp, Clock } from 'lucide-react';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import useFilterOptions from '../hooks/useFilterOptions';

const GaugeChart = ({ title, value, color }) => {
  const numValue = Number(value) || 0;
  const data = [
    { name: 'Achieved', value: numValue }, 
    { name: 'Remaining', value: Math.max(0, 100 - numValue) }
  ];
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
  const filterOptions = useFilterOptions();
  const [activeLine, setActiveLine] = useState('All');
  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/dashboard/performance?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(activeLine)}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
      })
      .catch(err => {
        console.error('Error fetching performance metrics:', err);
      });
  }, [period, shift, startDate, endDate, activeLine]);

  const kpis = dbData?.kpis || { oee: 0, availability: 0, performance: 0, ole: 0 };
  
  const stackedData = dbData?.downtime?.map(d => ({
    name: d.name || d.category,
    runTime: d.runTime || 0,
    downTime: d.downTime || 0
  })) || [];

  const oleTrendData = useMemo(() => {
    if (dbData?.oleTrend && dbData.oleTrend.length > 0) {
      return dbData.oleTrend.map(r => ({
        time: r.time,
        ole: Number(r.ole || 0),
        availability: Number(r.availability || 0),
        performance: Number(r.performance || 0),
        target: Number(r.target || 85.0)
      }));
    }
    return [];
  }, [dbData?.oleTrend]);

  const exportToExcel = () => {
    exportToXLSX('Performance_Report.xlsx', [
      { 
        name: 'KPI Summary', 
        rows: [
          ['Metric', 'Value', 'Benchmark Target'],
          ['Plant OEE', `${kpis.oee}%`, '85.0%'],
          ['Availability Rate', `${kpis.availability}%`, '90.0%'],
          ['Performance Rate', `${kpis.performance}%`, '95.0%'],
          ['Overall Line Efficiency (OLE)', `${kpis.ole}%`, '85.0%']
        ] 
      },
      { 
        name: 'Runtime vs Downtime', 
        rows: [
          ['Category', 'Run Time (Mins)', 'Down Time (Mins)'], 
          ...stackedData.map(d => [d.name, d.runTime, d.downTime])
        ] 
      },
      { 
        name: 'Hourly OLE Efficiency', 
        rows: [
          ['Time Slot / Date', 'Actual OLE %', 'Availability %', 'Performance %', 'Target Benchmark %'], 
          ...oleTrendData.map(d => [d.time, d.ole, d.availability, d.performance, d.target])
        ] 
      }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Performance Report"
        icon={Activity}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: activeLine, onChange: setActiveLine }
        ]}
      />
      
      <div className="flex-1 flex flex-col gap-3">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard 
            title="Plant OEE" 
            value={`${kpis.oee}%`} 
            trend={Number(kpis.oee) >= 85 ? '+2.4%' : '-1.8%'}
            trendLabel="vs Benchmark"
            sub="Overall Equipment Efficiency" 
            color="blue" 
          />
          <StatCard 
            title="Availability Rate" 
            value={`${kpis.availability}%`} 
            trend={Number(kpis.availability) >= 90 ? '+1.2%' : '-0.9%'}
            trendLabel="Uptime Index"
            sub="Operating vs Planned Time" 
            color="green" 
          />
          <StatCard 
            title="Performance Rate" 
            value={`${kpis.performance}%`} 
            trend={Number(kpis.performance) >= 95 ? '+0.8%' : '-2.1%'}
            trendLabel="Throughput"
            sub="Speed & Throughput Index" 
            color="amber" 
          />
          <StatCard 
            title="Overall Line Eff. (OLE)" 
            value={`${kpis.ole}%`} 
            trend={Number(kpis.ole) >= 85 ? '+3.1%' : '-1.4%'}
            trendLabel="Line Yield"
            sub="Total Line Efficiency" 
            color="purple" 
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Runtime vs Downtime Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Runtime v/s Downtime by Category
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Operating Hours Analysis
              </span>
            </div>
            <div className="h-[240px]">
              {stackedData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No downtime events recorded
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="downTime" name="Down Time (mins)" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="runTime" name="Run Time (mins)" fill="#0284c7" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Hourly OLE Efficiency vs Target Chart */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Line Efficiency (OLE %) vs Target Benchmark
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target: 85.0%
              </span>
            </div>
            <div className="h-[240px]">
              {oleTrendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No OLE trajectory data for selected timeframe
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={oleTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }} 
                      stroke="#64748b" 
                      tickFormatter={(v) => (v && v.length > 10 ? v.substring(5) : v)}
                    />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700">
                              <p className="font-bold text-sky-400">{d.time}</p>
                              <p className="mt-1">Actual OLE: <span className="font-semibold text-emerald-400">{d.ole}%</span></p>
                              <p>Availability: <span className="font-semibold text-white">{d.availability}%</span></p>
                              <p>Performance: <span className="font-semibold text-white">{d.performance}%</span></p>
                              <p>Target Benchmark: <span className="font-semibold text-rose-400">{d.target}%</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ole" name="Actual OLE %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="target" name="Target Benchmark (85%)" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* 4 OEE Pillar Gauges */}
        <div className="card p-4 py-6 flex-1">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-600" />
              OEE & OLE Operational Performance Pillars
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Line C Assembly Operational Health
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeChart title="Availability Rate" value={Number(kpis.availability).toFixed(1)} color="#10b981" />
            <GaugeChart title="Performance Rate" value={Number(kpis.performance).toFixed(1)} color="#f59e0b" />
            <GaugeChart title="Line Efficiency (OLE)" value={Number(kpis.ole).toFixed(1)} color="#6366f1" />
            <GaugeChart title="Equipment Efficiency (OEE)" value={Number(kpis.oee).toFixed(1)} color="#0284c7" />
          </div>
        </div>
      </div>
    </div>
  );
}
