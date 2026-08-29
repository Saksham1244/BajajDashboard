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
export default function StatCard({ title, value, sub, trend, trendLabel, color = 'blue', autoScale = false, period = 'Month', sparkline = [40, 65, 55, 80, 95, 85, 90, 100] }) {
  const presets = {
    blue:   { border: 'border-t-[#0369a1]',  text: 'text-[#0369a1]', spark: 'bg-[#0369a1]' },
    green:  { border: 'border-t-emerald-600', text: 'text-emerald-600', spark: 'bg-emerald-600' },
    red:    { border: 'border-t-rose-600',    text: 'text-rose-600', spark: 'bg-rose-600' },
    amber:  { border: 'border-t-amber-500',   text: 'text-amber-600', spark: 'bg-amber-500' },
    orange: { border: 'border-t-orange-500',  text: 'text-orange-600', spark: 'bg-orange-500' },
    slate:  { border: 'border-t-slate-600',   text: 'text-slate-600', spark: 'bg-slate-600' },
    purple: { border: 'border-t-purple-600',  text: 'text-purple-600', spark: 'bg-purple-600' },
  }

  // If color is a direct Tailwind class (legacy subagent usage), use it as text
  const isRaw = typeof color === 'string' && (color.startsWith('text-') || color.startsWith('#'))
  const borderClass = isRaw ? 'border-t-slate-400' : (presets[color]?.border ?? presets.blue.border)
  const textClass   = isRaw ? color                : (presets[color]?.text   ?? presets.blue.text)
  const sparkColor  = isRaw ? 'bg-slate-400'       : (presets[color]?.spark  ?? presets.blue.spark)

  const isValidTrend = trend !== undefined && trend !== null && trend !== '';
  let trendVal = 0;
  let trendText = '';
  let trendUp = true;

  if (isValidTrend) {
    if (typeof trend === 'number') {
      trendVal = trend;
      trendUp = trendVal >= 0;
      trendText = `${trendUp ? '▲' : '▼'} ${Math.abs(trendVal)}%`;
    } else if (typeof trend === 'string') {
      trendText = trend;
      trendUp = !trend.includes('-') && !trend.includes('▼');
    }
  }

  let displayValue = value;
  if (typeof value === 'number') {
    displayValue = value.toLocaleString();
  } else if (autoScale && typeof value === 'string') {
    const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;
    // Extract numbers, multiply by scale, format back
    displayValue = value.replace(/[\d,]+(\.\d+)?/g, (match) => {
      const num = parseFloat(match.replace(/,/g, ''));
      const scaled = num * scale;
      if (scaled > 100 && scaled % 1 !== 0) return Math.round(scaled).toLocaleString();
      return Number.isInteger(scaled) ? scaled.toLocaleString() : scaled.toFixed(1);
    });
  }

  const maxSpark = Math.max(...(sparkline || [100]), 1);

  return (
    <div className={`card flex flex-col justify-between gap-1.5 border-t-4 ${borderClass} relative overflow-hidden`}>
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{title}</p>
        <p className={`text-2xl font-black ${textClass} leading-none mt-1`}>{displayValue}</p>
      </div>

      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="flex flex-col">
          {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
          {isValidTrend && (
            <p className={`text-[11px] font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trendText} {trendLabel ? trendLabel : ''}
            </p>
          )}
        </div>

        {/* Micro-Sparkline (Hourly Shift Trajectory) */}
        {sparkline && sparkline.length > 0 && (
          <div className="flex items-end gap-1 h-6 px-1 py-0.5 rounded bg-slate-50 border border-slate-100" title="Hourly Shift Momentum">
            {sparkline.map((val, idx) => {
              const heightPct = Math.max(15, Math.round((val / maxSpark) * 100));
              return (
                <div
                  key={idx}
                  className={`w-1 rounded-sm transition-all duration-300 ${sparkColor} ${idx === sparkline.length - 1 ? 'opacity-100' : 'opacity-60'}`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
