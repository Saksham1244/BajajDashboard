import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { CheckCircle2, FileSpreadsheet, RotateCcw , Download } from 'lucide-react';

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
);const KPICard = ({ title, trend, current, lastMonth }) => {
  const isDrop = trend < 0;
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

export default function StraightPassReport() {
  const [activeDate, setActiveDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
  const [activeYear, setActiveYear] = useState('2026');
  const [activeMonth, setActiveMonth] = useState('Aug');
  const [activeShift, setActiveShift] = useState('Shift 1');
  const [activeLine, setActiveLine] = useState('All');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = ['2023', '2024', '2025', '2026'];

  // Mock data for the bar chart (Hourly Straight Pass vs Rework)
  const hourlyData = [
    { time: '08:00', straight: 45, rework: 2 },
    { time: '09:00', straight: 52, rework: 1 },
    { time: '10:00', straight: 48, rework: 4 },
    { time: '11:00', straight: 55, rework: 0 },
    { time: '12:00', straight: 40, rework: 5 },
    { time: '13:00', straight: 50, rework: 2 },
    { time: '14:00', straight: 49, rework: 1 },
    { time: '15:00', straight: 53, rework: 3 },
  ];

  // Mock table data referencing DB columns like EngineNo, SKUName, etc.
  const tableData = [
    { engineNo: 'ENG-2026-00123', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '08:14 AM' },
    { engineNo: 'ENG-2026-00124', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Reworked Pass', time: '08:17 AM' },
    { engineNo: 'ENG-2026-00125', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '08:21 AM' },
    { engineNo: 'ENG-2026-00126', sku: 'Dominar 400', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '08:24 AM' },
    { engineNo: 'ENG-2026-00127', sku: 'Dominar 400', date: '2026-08-25', shift: 'Shift 1', status: 'Reworked Pass', time: '08:45 AM' },
    { engineNo: 'ENG-2026-00128', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:02 AM' },
    { engineNo: 'ENG-2026-00129', sku: 'Pulsar 150 UG5', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:05 AM' },
    { engineNo: 'ENG-2026-00130', sku: 'Avenger 220', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:12 AM' },
    { engineNo: 'ENG-2026-00131', sku: 'Avenger 220', date: '2026-08-25', shift: 'Shift 1', status: 'Straight Pass', time: '09:15 AM' },
    { engineNo: 'ENG-2026-00132', sku: 'Dominar 400', date: '2026-08-25', shift: 'Shift 1', status: 'Reworked Pass', time: '09:21 AM' },
  ];

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const kpiData = [
      ['Metric', 'Current', 'Last Month', 'Trend'],
      ['Straight Pass Ratio', '94.2%', '91.8%', 'UP'],
      ['Total Engines Tested', '450', '420', 'UP'],
      ['Rework Loop Count', '26', '34', 'DOWN'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), 'KPI Summary');

    const hourlySheet = [['Time', 'Straight Pass', 'Rework']];
    hourlyData.forEach(row => hourlySheet.push([row.time, row.straight, row.rework]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hourlySheet), 'Hourly Trend');

    const tableSheet = [['Engine No', 'SKU', 'Date', 'Shift', 'Status', 'Time']];
    tableData.forEach(row => tableSheet.push([row.engineNo, row.sku, row.date, row.shift, row.status, row.time]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tableSheet), 'Traceability Log');

    XLSX.writeFile(wb, 'Straight_Pass_Report.xlsx');
  };

  return (
        <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col h-full gap-3">
      
      {/* Top Horizontal Filter Bar */}
      <div className="print:hidden w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 sticky top-0 z-10 flex flex-wrap items-center gap-4">
        
        {/* Title Section */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
          <div className="w-8 h-8 bg-[#0369a1] rounded flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-black text-[#0369a1] leading-tight whitespace-nowrap">Straight Pass Report</h2>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <FilterSection title="Year" options={years} active={activeYear} onChange={setActiveYear} isDropdown={true} />
          <FilterSection title="Month" options={months} active={activeMonth} onChange={setActiveMonth} isDropdown={true} />
          <FilterSection title="Date" active={activeDate} onChange={setActiveDate} isDate={true} />
          <FilterSection title="Shift" options={['All', 'Shift 1', 'Shift 2', 'Shift 3']} active={activeShift} onChange={setActiveShift} isDropdown={true} />
          <FilterSection title="Line" options={['All', 'Line 1', 'Line 2', 'Sub-Assy']} active={activeLine} onChange={setActiveLine} isDropdown={true} />
          <FilterSection title="Model Family" options={['All', 'Pulsar', 'Dominar', 'Avenger']} active={'All'} onChange={()=>{}} isDropdown={true} />
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800 transition-colors h-[38px]">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Excel</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-[#0369a1] text-white px-4 py-2 rounded shadow hover:bg-[#02517d] transition-colors h-[38px] self-end flex-shrink-0">
              <Download className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3"><div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-1 gap-3">
          <KPICard 
            title="Total Engines Produced" 
            trend={12.5} 
            current="410" 
            lastMonth="360"
          />
          <KPICard 
            title="Straight Pass (FTR)" 
            trend={4.2} 
            current="392" 
            lastMonth="340"
          />
          <KPICard 
            title="Reworked Pass" 
            trend={-18.1} 
            current="18" 
            lastMonth="22"
          />
        </div>

        {/* Chart */}
        <div className="card flex-1 min-h-[280px]">
          <h3 className="text-sm font-bold text-brand-dark mb-4 border-b border-dashed border-slate-200 pb-2 p-3">Hourly Straight Pass vs Reworked Pass</h3>
          <div className="flex-1 min-h-[220px] px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} verticalAlign="bottom" height={36} />
                <Bar dataKey="straight" name="Straight Pass" fill="#10b981" stackId="a" maxBarSize={40} />
                <Bar dataKey="rework" name="Reworked Pass" fill="#f97316" stackId="a" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="card print:overflow-visible">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Recent Engine Dispatches</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-2 px-3 font-bold">Engine No</th>
                  <th className="py-2 px-3 font-bold">SKU Name</th>
                  <th className="py-2 px-3 font-bold">Date</th>
                  <th className="py-2 px-3 font-bold">Shift</th>
                  <th className="py-2 px-3 font-bold">Status</th>
                  <th className="py-2 px-3 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 text-sm">
                    <td className="py-2 px-3 font-medium text-brand-dark">{row.engineNo}</td>
                    <td className="py-2 px-3 text-slate-600">{row.sku}</td>
                    <td className="py-2 px-3 text-slate-600">{row.date}</td>
                    <td className="py-2 px-3 text-slate-600">{row.shift}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'Straight Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-xs">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}












