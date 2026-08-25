import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

export default function PokaYokeBypassReport() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/process/pokayoke')
      .then(res => res.json())
      .then(d => setData(d.hourlyBypass || []))
  }, [])

  return (
    <ReportLayout title="Poka Yoke Bypass Report" moduleType="process">
      
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">Poka Yoke Bypass disable table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                <th className="py-3 px-4">Hour</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4">Duration (Mins)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="py-3 px-4">{row.hour}</td>
                  <td className="py-3 px-4">{row.start}</td>
                  <td className="py-3 px-4">{row.end}</td>
                  <td className="py-3 px-4">{row.duration}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">No bypass data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </ReportLayout>
  )
}


