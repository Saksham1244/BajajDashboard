/**
 * StatCard — KPI summary card
 * Props: title, value, sub, trend (number), color ('blue'|'green'|'red'|'amber'|'slate')
 */
export default function StatCard({ title, value, sub, trend, color = 'blue' }) {
  const colors = {
    blue:  { bg: 'bg-[#0369a1]', text: 'text-[#0369a1]', light: 'bg-blue-50' },
    green: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50' },
    red:   { bg: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
    slate: { bg: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-50' },
    purple:{ bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50' },
  }
  const c = colors[color] || colors.blue
  const trendUp = trend !== undefined && trend >= 0

  return (
    <div className={`card flex flex-col gap-2 border-t-4 ${c.bg.replace('bg-','border-t-')}`}>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-black ${c.text} leading-none`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? '▲' : '▼'} {Math.abs(trend)}% vs last period
        </p>
      )}
    </div>
  )
}
