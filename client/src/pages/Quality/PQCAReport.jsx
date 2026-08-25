import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'


const PIE_COLORS = ['#1A3D63', '#4A7FA7', '#B3CFE5', '#FA5D29']

const KPICard = ({ title, value, bgClass }) => (
  <div className={`kpi-block ${bgClass} py-4`}>
    <h3 className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2 text-center">{title}</h3>
    <span className="text-3xl font-black text-white leading-none">{value}</span>
  </div>
);

export default function PQCAReport() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/quality/pqca')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  if (!data) return <div className="p-8 text-center text-brand-secondary">Loading...</div>

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1">
      <FilterBar title="PQCA Report" />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
        <KPICard title="Total Checkpoints" value={data.kpis.total} bgClass="kpi-block-blue-3" />
        <KPICard title="Ok Checkpoints" value={data.kpis.ok} bgClass="kpi-block-green" />
        <KPICard title="NC Checkpoints" value={data.kpis.nc} bgClass="kpi-block-blue-1" />
        <KPICard title="Single occurrences NC" value={data.kpis.singleNc} bgClass="kpi-block-blue-2" />
        <KPICard title="Double occurrences NC" value={data.kpis.doubleNc} bgClass="kpi-block-blue-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Compliance Pie Chart */}
        <motion.div className="card flex flex-col items-center justify-center p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Compliance Pie Chart</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.compliance} cx="50%" cy="50%" labelLine={false} outerRadius={70} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.compliance.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category-wise NC Pie Chart */}
        <motion.div className="card flex flex-col items-center justify-center p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Category-wise NC (Pie Chart)</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryNc} cx="50%" cy="50%" labelLine={false} outerRadius={70} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.categoryNc.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 1) % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* NC Trend Line Chart */}
      <motion.div className="card mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">NC Trend Line Chart</h2>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} />
              <Tooltip cursor={{fill: '#F6FAFD'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(10,25,49,0.08)'}} />
              <Line type="monotone" dataKey="nc" name="NC Count" stroke="#FA5D29" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* NC Checkpoint Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">NC Checkpoint Table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                <th className="py-3 px-4">Checkpoint</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Actual Value</th>
                <th className="py-3 px-4">Expected Value</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.table.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                  <td className="py-3 px-4 font-medium text-brand-primary">{row.checkpoint}</td>
                  <td className="py-3 px-4">{row.category}</td>
                  <td className="py-3 px-4 font-medium">{row.value}</td>
                  <td className="py-3 px-4 text-brand-secondary">{row.expected}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-brand-danger/10 text-brand-danger">
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
  )
}

