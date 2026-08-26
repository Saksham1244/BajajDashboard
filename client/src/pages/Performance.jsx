import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import * as XLSX from 'xlsx'
import { ArrowUp, ArrowDown, Activity, Download, FileSpreadsheet } from 'lucide-react'

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
)

const GaugeChart = ({ title, value, color }) => {
  const data = [{ name: 'Achieved', value }, { name: 'Remaining', value: 100 - value }]
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
  )
}

const TopKPI = ({ title, mainTrend, subTitle1, subVal1, subTitle2, subVal2, upIsGood = true }) => {
  const trendColor = mainTrend >= 0
    ? (upIsGood ? 'text-emerald-500' : 'text-rose-500')
    : (upIsGood ? 'text-rose-500' : 'text-emerald-500')
  const Icon = mainTrend >= 0 ? ArrowUp : ArrowDown;

  return (
    <div className="card border-t-4 border-t-slate-200 flex flex-col pt-3">
      <h3 className="text-sm font-bold text-brand-dark text-center border-b border-dashed border-slate-200 pb-2 mb-2">{title}</h3>
      <div className="flex justify-center items-center gap-1 mb-3">
        <Icon className={`w-4 h-4 ${trendColor}`} />
        <span className={`text-lg font-black ${trendColor}`}>{Math.abs(mainTrend)}%</span>
      </div>
      <div className="flex justify-between px-4 text-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold uppercase">{subTitle1}</span>
          <span className="text-sm font-black text-brand-dark">{subVal1}</span>
        </div>
        <div className="w-px bg-slate-200 mx-2"></div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold uppercase">{subTitle2}</span>
          <span className="text-sm font-black text-brand-dark">{subVal2}</span>
        </div>
      </div>
    </div>
  )
}

export default function Performance() {
  const [activeDate, setActiveDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
  const [activeYear, setActiveYear] = useState('2026')
  const [activeMonth, setActiveMonth] = useState('Aug')

  const stackedData = [
    { name: 'Kiln Phase', runTime: 3000, downTime: 300 },
    { name: 'Pre Learning', runTime: 3100, downTime: 350 },
    { name: 'Packing', runTime: 3300, downTime: 400 },
    { name: 'Proportioning', runTime: 3500, downTime: 250 },
    { name: 'Grinding', runTime: 3600, downTime: 300 },
  ]

  const lineData = [
    { name: 'Feb-24', cost: 200, forecast: 200 },
    { name: 'Apr-24', cost: 180, forecast: 180 },
    { name: 'Jun-24', cost: 190, forecast: 190 },
    { name: 'Aug-24', cost: 250, forecast: 250 },
    { name: 'Oct-24', cost: 150, forecast: 150 },
    { name: 'Dec-24', cost: 180, forecast: 180 },
    { name: 'Feb-25', cost: null, forecast: 300 },
    { name: 'Apr-25', cost: null, forecast: 1000 },
  ]

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const kpiData = [
      ['Metric', 'Current', 'Trend'],
      ['OEE', '76.4%', '+2.1%'],
      ['Availability', '85.2%', '-0.5%'],
      ['Performance', '91.8%', '+1.2%'],
      ['Quality', '98.5%', '+0.1%'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), 'KPI Summary');

    const mtbfSheet = [['Phase', 'Run Time (hrs)', 'Down Time (hrs)']];
    stackedData.forEach(d => mtbfSheet.push([d.name, d.runTime, d.downTime]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mtbfSheet), 'MTBF & MTTR');

    const costSheet = [['Month', 'Product Cost', 'Forecast']];
    lineData.forEach(d => costSheet.push([d.name, d.cost ?? '', d.forecast]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(costSheet), 'Production Cost');

    XLSX.writeFile(wb, 'Performance_Report.xlsx');
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col h-full gap-3">

      {/* Top Horizontal Filter Bar */}
      <div className="print:hidden w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 sticky top-0 z-10 flex flex-wrap items-center gap-4">

        {/* Title Section */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
          <div className="w-8 h-8 bg-[#0369a1] rounded flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-black text-[#0369a1] leading-tight whitespace-nowrap">Performance Report</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <FilterSection title="Year" options={['2023', '2024', '2025', '2026']} active={activeYear} onChange={setActiveYear} isDropdown={true} />
          <FilterSection title="Month" options={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']} active={activeMonth} onChange={setActiveMonth} isDropdown={true} />
          <FilterSection title="Date" active={activeDate} onChange={setActiveDate} isDate={true} />
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800 transition-colors h-[38px]">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Excel</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-[#0369a1] text-white px-4 py-2 rounded shadow hover:bg-[#02517d] transition-colors h-[38px]">
              <Download className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3">

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <TopKPI title="Product Quantity" mainTrend={14} subTitle1="Product" subVal1="10,994" subTitle2="Target" subVal2="9,472" />
          <TopKPI title="Product Rework Qty" mainTrend={-88} subTitle1="Current" subVal1="58,089" subTitle2="Last Month" subVal2="150,626" upIsGood={false} />
          <TopKPI title="Production Cost" mainTrend={-89} subTitle1="Current" subVal1="$12 K" subTitle2="Last Month" subVal2="$33 K" upIsGood={false} />
          <TopKPI title="Direct Labor Cost" mainTrend={-90} subTitle1="Current" subVal1="$3 K" subTitle2="Last Month" subVal2="$7 K" upIsGood={false} />
        </div>

        {/* Middle Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="card">
            <h3 className="text-sm font-bold text-brand-dark mb-4 border-b border-dashed border-slate-200 pb-2 text-center">Runtime v/s Downtime</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend iconType="square" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                  <Bar dataKey="downTime" name="Down Time" fill="#475569" maxBarSize={30} stackId="a" />
                  <Bar dataKey="runTime" name="Run Time" fill="#f97316" maxBarSize={30} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold text-brand-dark mb-4 border-b border-dashed border-slate-200 pb-2 text-center">Monthly Production Cost</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} angle={-45} textAnchor="end" height={40} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Legend iconType="plainline" wrapperStyle={{fontSize: '11px'}} />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#fef08a" fill="#fef08a" fillOpacity={0.3} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="cost" name="Product Cost" stroke="#0ea5e9" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Gauges */}
        <div className="card py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GaugeChart title="Product Availability" value={70.58} color="#f97316" />
            <GaugeChart title="Performance" value={90.46} color="#334155" />
            <GaugeChart title="Quality" value={91.85} color="#f97316" />
            <GaugeChart title="Equipment Efficiency" value={60.15} color="#334155" />
          </div>
        </div>

      </div>
    </div>
  )
}
