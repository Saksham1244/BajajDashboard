import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Search, AlertTriangle, Hammer, CheckCircle, Clock } from 'lucide-react'

const KPICard = ({ title, value, icon: Icon, bgClass }) => (
  <div className={`kpi-block ${bgClass}`}>
    <div className="flex justify-between items-center w-full mb-1">
      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{title}</span>
      <Icon className="w-4 h-4 text-white/80" />
    </div>
    <div className="flex items-end justify-between w-full mt-1">
      <span className="text-3xl font-black text-white leading-none">{value}</span>
    </div>
  </div>
);

export default function EngineReworkReport() {
  const [data, setData] = useState(null)
  const [engineUid, setEngineUid] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/trace/engine-rework')
      .then(res => res.json())
      .then(d => setData(d))
  }, [])

  return (
    <ReportLayout title="Engine Wise Rework Summary" moduleType="trace">

      {/* Engine UID Filter */}
      <div className="card p-2 px-3 flex gap-4 items-center shadow-sm mb-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white bg-brand-primary px-2.5 py-1.5 rounded-l-md -mr-2 z-10">
            Engine UID
          </label>
          <div className="flex items-center gap-2 px-2 py-1 bg-brand-bg rounded-r-md border border-slate-200 text-xs focus-within:border-brand-accent transition-colors flex-1 w-64">
            <input 
              type="text" 
              placeholder="Search UID..."
              value={engineUid}
              onChange={(e) => setEngineUid(e.target.value)}
              className="bg-transparent text-brand-primary outline-none w-full"
            />
            <Search className="w-3 h-3 text-brand-primary/50" />
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <KPICard title="Total Defects" value={data.kpis.totalDefects} icon={AlertTriangle} bgClass="kpi-block-blue-3" />
          <KPICard title="Rework Count" value={data.kpis.reworkCount} icon={Hammer} bgClass="kpi-block-blue-2" />
          <KPICard title="Final Status" value={data.kpis.finalStatus} icon={CheckCircle} bgClass="kpi-block-green" />
          <KPICard title="Total Rework Time" value={data.kpis.totalReworkTime} icon={Clock} bgClass="kpi-block-blue-1" />
        </div>
      )}

      {/* Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-brand-dark">Rework Status table</h2>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:underline">
            <span>Download</span> <Download className="w-4 h-4" />
          </button>
        </div>
        
        {data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg text-brand-primary font-medium text-sm border-b border-slate-200">
                  <th className="py-3 px-4">Defect</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Time Spent</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                    <td className="py-3 px-4 font-medium text-brand-danger">{row.defect}</td>
                    <td className="py-3 px-4">{row.station}</td>
                    <td className="py-3 px-4 text-brand-primary">{row.action}</td>
                    <td className="py-3 px-4 font-medium">{row.timeSpent}</td>
                    <td className="py-3 px-4">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-brand-secondary">Loading rework data...</div>
        )}
      </motion.div>
    </ReportLayout>
  )
}


