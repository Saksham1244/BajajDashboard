/**
 * StatCard — KPI summary card
 * Props:
 *   title   - string
 *   value   - string or number
 *   sub     - optional subtitle string
 *   trend   - optional number (positive = up, negative = down)
 *   color   - 'blue'|'green'|'red'|'amber'|'slate'|'purple'|'orange'
 *             OR a direct Tailwind text class e.g. 'text-orange-600' (backward compat)
 */
export default function StatCard({ title, value, sub, trend, color = 'blue' }) {
  const presets = {
    blue:   { border: 'border-t-[#0369a1]',  text: 'text-[#0369a1]' },
    green:  { border: 'border-t-emerald-600', text: 'text-emerald-600' },
    red:    { border: 'border-t-rose-600',    text: 'text-rose-600' },
    amber:  { border: 'border-t-amber-500',   text: 'text-amber-600' },
    orange: { border: 'border-t-orange-500',  text: 'text-orange-600' },
    slate:  { border: 'border-t-slate-600',   text: 'text-slate-600' },
    purple: { border: 'border-t-purple-600',  text: 'text-purple-600' },
  }

  // If color is a direct Tailwind class (legacy subagent usage), use it as text
  const isRaw = color.startsWith('text-') || color.startsWith('#')
  const borderClass = isRaw ? 'border-t-slate-400' : (presets[color]?.border ?? presets.blue.border)
  const textClass   = isRaw ? color                : (presets[color]?.text   ?? presets.blue.text)

  const isValidTrend = trend !== undefined && trend !== null && !isNaN(Number(trend));
  const trendVal = isValidTrend ? Number(trend) : 0;
  const trendUp = trendVal >= 0;

  return (
    <div className={`card flex flex-col gap-1.5 border-t-4 ${borderClass}`}>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{title}</p>
      <p className={`text-2xl font-black ${textClass} leading-none`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
      {isValidTrend && (
        <p className={`text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? '▲' : '▼'} {Math.abs(trendVal)}% vs last period
        </p>
      )}
    </div>
  )
}
