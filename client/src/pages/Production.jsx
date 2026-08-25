import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { LayoutDashboard } from 'lucide-react';

const FilterSection = ({ title, options, active, onChange, isDropdown = false, isDate = false }) => (
  <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
    {isDate ? (
      <input 
        type="date" 
        value={active}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0369a1]"
      />
    ) : isDropdown ? (
      <select 
        value={active} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0369a1]"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <div className="flex gap-1">
        {options.map(opt => (
          <button 
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-1.5 text-[11px] font-bold rounded transition-colors ${active === opt ? 'bg-[#0369a1] text-white' : 'bg-slate-200 text-brand-dark hover:bg-slate-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    )}
  </div>
);// KPI Card matching the user's uploaded image mockup
const KPICard = ({ title, trend, current, lastMonth }) => {
  const isDrop = trend < 0;
  // User explicitly asked why a drop was green. We will make drops RED and rises GREEN.
  const colorClass = isDrop ? 'text-rose-500' : 'text-emerald-500';
  const Arrow = isDrop ? '↓' : '↑';

  return (
    <div className="card bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm min-h-[140px]">
      <h3 className="text-center font-bold text-brand-dark text-sm mb-3">{title}</h3>
      <div className="border-b border-dashed border-slate-200 w-full mb-3"></div>
      
      <div className={`text-center text-3xl font-black mb-4 tracking-tighter ${colorClass}`}>
        {trend !== 0 ? Arrow : ''} {Math.abs(trend)}%
      </div>
      
      <div className="flex justify-between items-center text-center mt-auto pt-2">
        <div className="flex-1 border-r border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current</p>
          <p className="text-lg font-black text-brand-dark leading-none">{current}</p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Month</p>
          <p className="text-lg font-black text-brand-dark leading-none">{lastMonth}</p>
        </div>
      </div>
    </div>
  );
};

export default function Production() {
  const [activeDate, setActiveDate] = useState('2026-08-25');
  const [activeYear, setActiveYear] = useState('2026');
  const [activeMonth, setActiveMonth] = useState('Aug');
  const [activeShift, setActiveShift] = useState('All');
  const [activeLine, setActiveLine] = useState('Main Line');
  const [activeModel, setActiveModel] = useState('All');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = ['2023', '2024', '2025', '2026'];

  // Hourly Plan vs Actual Data
  const hourlyData = [
    { time: '08:00', plan: 100, actual: 95 },
    { time: '09:00', plan: 100, actual: 105 },
    { time: '10:00', plan: 100, actual: 90 },
    { time: '11:00', plan: 100, actual: 102 },
    { time: '12:00', plan: 100, actual: 88 },
    { time: '13:00', plan: 100, actual: 98 },
    { time: '14:00', plan: 100, actual: 104 },
    { time: '15:00', plan: 100, actual: 85 },
  ];

  // SKU / Model Wise Data
  const skuData = [
    { name: 'Pulsar 150 UG5', plan: 400, actual: 380, wip: 45, rollover: 20 },
    { name: 'Dominar 400', plan: 250, actual: 235, wip: 22, rollover: 15 },
    { name: 'Avenger 220', plan: 150, actual: 152, wip: 10, rollover: 0 },
  ];

  // Pareto Chart Data (Production Shortfall Reasons)
  const paretoData = [
    { reason: 'Material Short', count: 28, cumPercent: 42 },
    { reason: 'Machine BD', count: 18, cumPercent: 69 },
    { reason: 'Quality Hold', count: 12, cumPercent: 87 },
    { reason: 'Setup Delay', count: 5, cumPercent: 95 },
    { reason: 'Other', count: 3, cumPercent: 100 },
  ];

  return (
        <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col h-full gap-3">
      
      {/* Top Horizontal Filter Bar */}
      <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 sticky top-0 z-10 flex flex-wrap items-center gap-4">
        
        {/* Title Section */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
          <div className="w-8 h-8 bg-[#0369a1] rounded flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-black text-[#0369a1] leading-tight whitespace-nowrap">Production Report</h2>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <FilterSection title="Year" options={years} active={activeYear} onChange={setActiveYear} isDropdown={true} />
          <FilterSection title="Month" options={months} active={activeMonth} onChange={setActiveMonth} isDropdown={true} />
          <FilterSection title="Date" active={activeDate} onChange={setActiveDate} isDate={true} />
          <FilterSection title="Shift" options={['All', 'Shift 1', 'Shift 2', 'Shift 3']} active={activeShift} onChange={setActiveShift} isDropdown={true} />
          <FilterSection title="Line" options={['All', 'Line 1', 'Line 2', 'Sub-Assy']} active={activeLine} onChange={setActiveLine} isDropdown={true} />
          <FilterSection title="Model Family" options={['All', 'Pulsar', 'Dominar', 'Avenger']} active={'All'} onChange={()=>{}} isDropdown={true} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3"><div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <KPICard 
            title="Total Production" 
            trend={12.4} 
            current="58,089" 
            lastMonth="51,680" 
          />
          <KPICard 
            title="Production Shortfall" 
            trend={-4.2} 
            current="842" 
            lastMonth="879" 
          />
          <KPICard 
            title="Current WIP" 
            trend={1.8} 
            current="142" 
            lastMonth="139" 
          />
          <KPICard 
            title="Rollover Quantity" 
            trend={-15.3} 
            current="85" 
            lastMonth="100" 
          />
        </div>

        {/* Middle Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[250px]">
          
          {/* Hourly Plan vs Actual */}
          <div className="card flex flex-col p-3">
            <h3 className="text-sm font-bold text-brand-dark mb-4 border-b border-dashed border-slate-200 pb-2">Hourly Plan vs Actual</h3>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} verticalAlign="bottom" height={36} />
                  <Bar dataKey="actual" name="Actual Prod." fill="#0ea5e9" maxBarSize={40} radius={[2,2,0,0]} />
                  <Line type="stepAfter" dataKey="plan" name="Hourly Target" stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pareto Chart for Shortfall */}
          <div className="card flex flex-col p-3">
            <h3 className="text-sm font-bold text-brand-dark mb-4 border-b border-dashed border-slate-200 pb-2">Shortfall Pareto (Loss Analysis)</h3>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="reason" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={5} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(v) => `${v}%`} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} verticalAlign="bottom" height={36} />
                  <Bar yAxisId="left" dataKey="count" name="Loss Count" fill="#f59e0b" maxBarSize={40} radius={[2,2,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumPercent" name="Cumulative %" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Bottom Table: SKU Wise Data */}
        <div className="card overflow-hidden">
          <h3 className="text-sm font-bold text-brand-dark mb-3 p-3 pb-0">Model & SKU Wise Production Status</h3>
          <div className="overflow-x-auto p-3 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 font-bold">SKU Name</th>
                  <th className="py-3 px-3 font-bold text-right">Plan Qty</th>
                  <th className="py-3 px-3 font-bold text-right">Actual Qty</th>
                  <th className="py-3 px-3 font-bold text-right">Variance</th>
                  <th className="py-3 px-3 font-bold text-right">WIP Status</th>
                  <th className="py-3 px-3 font-bold text-right">Rollover Plan</th>
                </tr>
              </thead>
              <tbody>
                {skuData.map((row, i) => {
                  const variance = row.actual - row.plan;
                  const varColor = variance >= 0 ? 'text-emerald-600' : 'text-rose-600';
                  
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 text-sm">
                      <td className="py-2 px-3 font-bold text-brand-dark">{row.name}</td>
                      <td className="py-2 px-3 text-right text-slate-600 font-medium">{row.plan}</td>
                      <td className="py-2 px-3 text-right font-black text-[#0369a1]">{row.actual}</td>
                      <td className={`py-2 px-3 text-right font-bold ${varColor}`}>
                        {variance > 0 ? '+' : ''}{variance}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold text-xs">{row.wip}</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold text-xs">{row.rollover}</span>
                      </td>
                    </tr>
                  )
                })}
                {/* Total Row */}
                <tr className="bg-slate-50 text-sm font-black border-t-2 border-slate-200">
                  <td className="py-3 px-3 text-brand-dark uppercase tracking-wider text-xs">Total</td>
                  <td className="py-3 px-3 text-right text-slate-700">800</td>
                  <td className="py-3 px-3 text-right text-[#0369a1]">767</td>
                  <td className="py-3 px-3 text-right text-rose-600">-33</td>
                  <td className="py-3 px-3 text-right text-amber-700">77</td>
                  <td className="py-3 px-3 text-right text-rose-700">35</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}


