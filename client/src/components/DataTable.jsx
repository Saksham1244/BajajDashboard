/**
 * DataTable — reusable sortable table
 * Props:
 *   columns: [{ key|accessor: 'field', label|header: 'Header', align, render }]
 *   data: array of row objects
 *   totalRow: optional object for a bold TOTAL row
 */
export default function DataTable({ columns = [], data = [], totalRow = null }) {
  // Normalise — support both {key,label} and {accessor,header}
  const cols = columns.map(c => ({
    key:    c.key    ?? c.accessor,
    label:  c.label  ?? c.header,
    align:  c.align,
    render: c.render,
  }))

  return (
    <div className="card print:overflow-visible overflow-hidden">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              {cols.map(col => (
                <th key={col.key}
                  className={`py-3 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {cols.map(col => (
                  <td key={col.key}
                    className={`py-2.5 px-3 text-sm text-brand-dark ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
            {totalRow && (
              <tr className="bg-slate-100 border-t-2 border-slate-300">
                {cols.map(col => (
                  <td key={col.key}
                    className={`py-3 px-3 text-sm font-bold text-brand-dark ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                    {totalRow[col.key] ?? ''}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
