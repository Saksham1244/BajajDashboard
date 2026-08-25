import ReportLayout from '../../components/ReportLayout'
import { useEffect, useState } from 'react'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function PokaYokeReport() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/process/pokayoke')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])

  if (!data) return <div className="p-8 text-center text-brand-secondary">Loading...</div>

  return (
    <ReportLayout title="Poka Yoke Report" moduleType="process">
      
      <div className="grid grid-cols-1 gap-3">
        
        {/* OK/Not OK Chart */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-brand-dark">Hour wise OK/NotOk chart</h2>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyOkNotOk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F6FAFD'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(10,25,49,0.08)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', color: '#0A1931'}} />
                <Bar dataKey="ok" name="OK Count" fill="#4A7FA7" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="notOk" name="Not OK Count" fill="#FA5D29" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bypass Chart */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-brand-dark">Hour wise bypass chart (Start, End, Duration)</h2>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyBypass} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#1A3D63', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F6FAFD'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(10,25,49,0.08)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', color: '#0A1931'}} />
                <Line type="monotone" dataKey="duration" name="Bypass Duration (Mins)" stroke="#1A3D63" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </ReportLayout>
  )
}


