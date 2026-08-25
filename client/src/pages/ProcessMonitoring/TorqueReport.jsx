import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

export default function TorqueReport() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/process/torque')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  if (!data) return <div className="p-8 text-center text-brand-secondary">Loading...</div>

  return (
    <ReportLayout title="Torque Report" moduleType="process">
      
      <div className="grid grid-cols-1 gap-3">
        
        {/* Torque Line Chart */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-brand-dark">Engine wise torque value line chart</h2>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.torqueValues} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="engine" axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} dy={10} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F6FAFD'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(10,25,49,0.08)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', color: '#0A1931'}} />
                <Line type="monotone" dataKey="value" name="Actual Torque (Nm)" stroke="#4A7FA7" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="target" name="Target Torque (Nm)" stroke="#FA5D29" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Torque Table */}
        <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-brand-dark">Engine wise torque value table</h2>
            <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
              <span>Download</span> <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Engine UID</th>
                  <th className="py-3 px-4">Torque Device</th>
                  <th className="py-3 px-4">Torque Value (Nm)</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.torqueTable.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                    <td className="py-3 px-4">#{row.id}</td>
                    <td className="py-3 px-4 font-medium text-brand-primary">{row.engine}</td>
                    <td className="py-3 px-4">{row.device}</td>
                    <td className="py-3 px-4 font-medium">{row.value}</td>
                    <td className="py-3 px-4">{row.time}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'Pass' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </ReportLayout>
  )
}


