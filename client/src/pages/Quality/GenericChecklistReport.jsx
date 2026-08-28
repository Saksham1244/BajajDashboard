import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'


export default function GenericChecklistReport({ title, typeStr }) {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch(`/api/quality/checklist?type=${typeStr}`)
      .then(res => res.json())
      .then(d => setData(d))
  }, [typeStr])

  if (!data) return <div className="p-8 text-center text-brand-secondary">Loading...</div>

  return (
    <ReportLayout title={title} moduleType="quality">
      
      {/* Checklist Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">{title} Table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                <th className="py-3 px-4">Parameter</th>
                <th className="py-3 px-4">Standard</th>
                <th className="py-3 px-4">Actual</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.table.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="py-3 px-4 font-medium text-brand-primary">{row.param}</td>
                  <td className="py-3 px-4">{row.standard}</td>
                  <td className="py-3 px-4">{row.actual}</td>
                  <td className="py-3 px-4">{row.inspector}</td>
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
      </motion.div>
    </ReportLayout>
  )
}



