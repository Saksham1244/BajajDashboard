import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Search } from 'lucide-react'

export default function GenealogyReport() {
  const [data, setData] = useState(null)
  const [engineUid, setEngineUid] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/trace/genealogy')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  return (
    <ReportLayout title="Genealogy Report" moduleType="trace">

      {/* Engine UID Filter */}
      <div className="card p-4 flex gap-4 items-center shadow-[0_2px_10px_0_rgba(10,25,49,0.02)] mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-brand-dark bg-brand-primary text-white px-3 py-2 rounded-l-md -mr-2 z-10">
            Engine UID
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-bg rounded-r-md border border-slate-200 text-sm focus-within:border-brand-accent transition-colors flex-1 w-64">
            <input 
              type="text" 
              placeholder="Search UID..."
              value={engineUid}
              onChange={(e) => setEngineUid(e.target.value)}
              className="bg-transparent text-brand-primary outline-none w-full"
            />
            <Search className="w-4 h-4 text-brand-primary/50" />
          </div>
        </div>
      </div>
      
      {/* Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">Complete History for searched engine UID</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        {data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                    <td className="py-3 px-4 font-medium text-brand-primary">{row.stage}</td>
                    <td className="py-3 px-4">{row.time}</td>
                    <td className="py-3 px-4">{row.station}</td>
                    <td className="py-3 px-4">{row.operator}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'OK' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-brand-secondary">Loading history...</div>
        )}
      </motion.div>
    </ReportLayout>
  )
}


