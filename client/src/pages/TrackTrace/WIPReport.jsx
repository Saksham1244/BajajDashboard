import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Package } from 'lucide-react'

export default function WIPReport() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/trace/wip')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  return (
    <ReportLayout title="WIP Report" moduleType="trace">

      {/* WIP Filters */}
      <div className="card p-4 flex gap-4 items-center shadow-[0_2px_10px_0_rgba(10,25,49,0.02)] mb-3">
        <select className="px-3 py-2 bg-brand-primary text-white rounded-md border-none text-sm font-medium outline-none cursor-pointer hover:opacity-90">
          <option>Line</option>
          <option>Line A</option>
          <option>Line B</option>
        </select>
        <select className="px-3 py-2 bg-brand-primary text-white rounded-md border-none text-sm font-medium outline-none cursor-pointer hover:opacity-90">
          <option>Wip Status</option>
          <option>In Progress</option>
          <option>Waiting</option>
        </select>
      </div>
      
      {/* KPI Card */}
      <motion.div className="card bg-brand-accent/5 border-none flex items-center gap-3 mb-3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
          <Package className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-brand-dark mb-1">Engine Quantity in WIP</h2>
          <div className="text-4xl font-bold text-brand-primary">
            {data ? data.totalWip : '...'}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">Engine details table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        {data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                  <th className="py-3 px-4">Engine UID</th>
                  <th className="py-3 px-4">Line</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.details.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                    <td className="py-3 px-4 font-medium text-brand-primary">{row.engine}</td>
                    <td className="py-3 px-4">{row.line}</td>
                    <td className="py-3 px-4">{row.station}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'In Progress' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-secondary/20 text-brand-primary'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-brand-secondary">Loading WIP data...</div>
        )}
      </motion.div>
    </ReportLayout>
  )
}


