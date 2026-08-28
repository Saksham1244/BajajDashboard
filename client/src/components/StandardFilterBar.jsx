import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'

const today = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

/**
 * StandardFilterBar
 * Props:
 *   title        - Report title string
 *   icon         - Lucide icon component
 *   onExcelClick - function to call when Excel button clicked
 *   onPrintClick - function (defaults to window.print)
 *   filters      - array of filter configs (see below)
 *
 * Filter config shapes:
 *   { type: 'period', value, onChange }  — Shift/Day/Month toggle
 *   { type: 'daterange', from, onFromChange, to, onToChange }
 *   { type: 'dropdown', label, options, value, onChange }
 *   { type: 'search', label, value, onChange, placeholder }
 */
export default function StandardFilterBar({ title, icon: Icon, onExcelClick, filters = [], onPrintClick }) {
  return (
    <div className="print:hidden w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 sticky top-0 z-10">
      <div className="flex flex-wrap items-end gap-3">

        {/* Title */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200 flex-shrink-0">
          {Icon && (
            <div className="w-8 h-8 bg-[#0369a1] rounded flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <h2 className="text-base font-black text-[#0369a1] leading-tight whitespace-nowrap">{title}</h2>
        </div>

        {/* Filters */}
        {filters.map((f, i) => {
          if (f.type === 'period') return (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</span>
                <div className="flex rounded overflow-hidden border border-slate-200">
                {['Shift', 'Day', 'Week', 'Month'].map(p => (
                  <button key={p} onClick={() => f.onChange(p)}
                    className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${f.value === p ? 'bg-[#0369a1] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )
          if (f.type === 'daterange') return (
            <div key={i} className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</span>
                <input type="date" value={f.from} onChange={e => f.onFromChange(e.target.value)}
                  className="text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0369a1]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</span>
                <input type="date" value={f.to} onChange={e => f.onToChange(e.target.value)}
                  className="text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0369a1]" />
              </div>
            </div>
          )
          if (f.type === 'dropdown') return (
            <div key={i} className="flex flex-col gap-1 min-w-[115px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>{f.label}</span>
                {f.activeShift && <span className="text-[9px] text-emerald-600 font-bold lowercase">live: {f.activeShift}</span>}
              </span>
              <select value={f.value} onChange={e => f.onChange(e.target.value)}
                className="text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0369a1]">
                {f.options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt} {f.activeShift === opt ? '🟢 (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )
          if (f.type === 'search') return (
            <div key={i} className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{f.label}</span>
              <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder || 'Search...'}
                className="text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0369a1] w-full" />
            </div>
          )
          return null
        })}

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button onClick={onExcelClick}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800 transition-colors h-[34px] text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button onClick={onPrintClick || (() => window.print())}
            className="flex items-center gap-2 bg-[#0369a1] text-white px-4 py-2 rounded shadow hover:bg-[#02517d] transition-colors h-[34px] text-xs font-bold uppercase tracking-wider">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>

      </div>
    </div>
  )
}
