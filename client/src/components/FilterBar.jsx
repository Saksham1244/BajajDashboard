import { useState } from 'react'
import { Calendar } from 'lucide-react'

export default function FilterBar({ title, onPeriodChange }) {
  const [activePeriod, setActivePeriod] = useState('Shift')
  
  // Default to today's date (YYYY-MM-DD format for input compatibility)
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  const periods = ['Shift', 'Day', 'Week', 'Month']

  const handlePeriodChange = (period) => {
    setActivePeriod(period)
    if (onPeriodChange) onPeriodChange(period)
  }

  return (
    <div className="mb-2 flex items-center justify-between gap-4">
      <h1 className="text-lg font-black text-brand-dark whitespace-nowrap">{title}</h1>
      
      <div className="card p-1.5 px-2 flex flex-1 flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex gap-1">
          {periods.map(period => (
            <button 
              key={period} 
              onClick={() => handlePeriodChange(period)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase tracking-wider font-bold transition-all ${
                activePeriod === period 
                  ? 'bg-brand-dark text-white shadow-sm' 
                  : 'bg-brand-bg text-brand-primary hover:bg-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-bg rounded border border-slate-200 text-[11px] font-medium focus-within:border-brand-accent transition-colors">
            <Calendar className="w-3 h-3 text-brand-primary" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-brand-primary outline-none cursor-pointer"
            />
          </div>
          <span className="text-slate-400 font-medium text-[10px]">-</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-bg rounded border border-slate-200 text-[11px] font-medium focus-within:border-brand-accent transition-colors">
            <Calendar className="w-3 h-3 text-brand-primary" />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-brand-primary outline-none cursor-pointer"
            />
          </div>
          <select className="px-1.5 py-0.5 bg-brand-bg rounded border border-slate-200 text-[11px] text-brand-primary font-bold outline-none cursor-pointer focus:border-brand-accent transition-colors min-w-[90px]">
            {activePeriod === 'Shift' && (
              <>
                <option>All Hours</option>
                <option>08:00 - 09:00</option>
                <option>09:00 - 10:00</option>
                <option>10:00 - 11:00</option>
                <option>11:00 - 12:00</option>
                <option>12:00 - 13:00</option>
                <option>13:00 - 14:00</option>
                <option>14:00 - 15:00</option>
                <option>15:00 - 16:00</option>
              </>
            )}
            {activePeriod === 'Day' && (
              <>
                <option>All 2 Shifts</option>
                <option>Shift 1</option>
                <option>Shift 2</option>
              </>
            )}
            {activePeriod === 'Week' && (
              <>
                <option>All 7 Days</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </>
            )}
            {activePeriod === 'Month' && (
              <>
                <option>All 4 Weeks</option>
                <option>Week 1</option>
                <option>Week 2</option>
                <option>Week 3</option>
                <option>Week 4</option>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  )
}
