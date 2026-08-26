import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { LayoutDashboard, CheckCircle2, Activity, Settings2, Network, ShieldCheck , Download , FileSpreadsheet } from 'lucide-react';

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
);

export default function ReportLayout({ title, children, moduleType = 'production' }) {
  const [activeDate, setActiveDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
  const [activeYear, setActiveYear] = useState('2026');
  const [activeMonth, setActiveMonth] = useState('Aug');
  const [activeShift, setActiveShift] = useState('All');
  const [activeLine, setActiveLine] = useState('All');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = ['2023', '2024', '2025', '2026'];
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Report Content', 'Status'],
      [title, 'Data will be dynamically populated once backend is wired.']
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_Report.xlsx`);
  };

  let Icon = LayoutDashboard;
  if (moduleType === 'performance') Icon = Activity;
  if (moduleType === 'quality') Icon = ShieldCheck;
  if (moduleType === 'trace') Icon = Network;
  if (moduleType === 'process') Icon = Settings2;

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3">
      
      {/* Top Horizontal Filter Bar */}
      <div className="print:hidden w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 sticky top-0 z-10 flex flex-wrap items-center gap-4">
        
        {/* Title Section */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
          <div className="w-8 h-8 bg-[#0369a1] rounded flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-black text-[#0369a1] leading-tight whitespace-nowrap">{title}</h2>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <FilterSection title="Year" options={years} active={activeYear} onChange={setActiveYear} isDropdown={true} />
          <FilterSection title="Month" options={months} active={activeMonth} onChange={setActiveMonth} isDropdown={true} />
          <FilterSection title="Date" active={activeDate} onChange={setActiveDate} isDate={true} />
          <FilterSection title="Shift" options={['All', 'Shift 1', 'Shift 2', 'Shift 3']} active={activeShift} onChange={setActiveShift} isDropdown={true} />
          <FilterSection title="Line" options={['All', 'Main Line', 'Sub Assy 1', 'Sub Assy 2']} active={activeLine} onChange={setActiveLine} isDropdown={true} />
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
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        
        {/* Dynamic Content */}
        {children}

      </div>
    </div>
  );
}







