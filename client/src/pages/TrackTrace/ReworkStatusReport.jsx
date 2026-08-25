import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

const PIE_COLORS = ['#1A3D63', '#4A7FA7', '#B3CFE5', '#FA5D29']

export default function ReworkStatusReport() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/trace/rework')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  if (!data) return <div className="p-8 text-center text-brand-secondary">Loading...</div>

  return (
    <ReportLayout title="Rework Status Report" moduleType="trace">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Top Defects Pie Chart */}
        <motion.div className="card flex flex-col items-center justify-center p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Top defects in Pie chart</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.topDefects} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.topDefects.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Stations Pie Chart */}
        <motion.div className="card flex flex-col items-center justify-center p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Top defect station in Pie chart</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.topStations} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.topStations.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Rework Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">Rework Status table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                <th className="py-3 px-4">Engine UID</th>
                <th className="py-3 px-4">Defect</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.table.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="py-3 px-4 font-medium text-brand-primary">{row.engine}</td>
                  <td className="py-3 px-4">{row.defect}</td>
                  <td className="py-3 px-4">{row.station}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'Fixed' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </ReportLayout>
  )
}


