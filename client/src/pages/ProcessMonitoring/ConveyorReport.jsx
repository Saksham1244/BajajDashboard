import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

const PIE_COLORS = ['#1A3D63', '#4A7FA7', '#B3CFE5', '#FA5D29']

export default function ConveyorReport() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/process/conveyor')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  if (!data) return <div className="p-8 text-center text-brand-secondary">Loading...</div>

  return (
    <ReportLayout title="Conveyor Report" moduleType="process">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        
        {/* Stations Pie Chart */}
        <motion.div className="card flex flex-col items-center justify-center p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Top 5 Conveyor Speed Affected Stations Pie Chart</h2>
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

        {/* Reasons Pie Chart */}
        <motion.div className="card flex flex-col items-center justify-center p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Top 5 Conveyor Speed Affected Reasons Pie Chart</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.topReasons} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.topReasons.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Conveyor Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">Conveyor Performance table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.performanceTable.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="py-3 px-4 font-medium text-brand-primary">{row.line}</td>
                  <td className="py-3 px-4">{row.station}</td>
                  <td className="py-3 px-4 text-brand-danger">{row.reason}</td>
                  <td className="py-3 px-4 font-medium">{row.duration}</td>
                  <td className="py-3 px-4">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </ReportLayout>
  )
}


