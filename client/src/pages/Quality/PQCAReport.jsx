import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ClipboardCheck } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function PQCAReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [dbData, setDbData] = useState(null);
  React.useEffect(() => {
    fetch(`http://localhost:5000/api/quality/pqca?period=${period}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period]);

  const [line, setLine] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');

  const kpiData = dbData?.kpis || {
    totalCheckpoints: 500,
    ok: 480,
    nc: 20,
    singleNc: 15,
    doubleNc: 5,
  };

  const complianceData = [
    { name: 'OK', value: 480 },
    { name: 'NC', value: 20 },
  ];

  const categoryNcData = [
    { name: 'Visual', value: 10 },
    { name: 'Functional', value: 5 },
    { name: 'Measurement', value: 5 },
  ];

  const ncTrendData = useMemo(() => {
    return generateTimeLabels(period, shift).map(label => ({
      date: label,
      nc: Math.floor(Math.random() * 8)
    }));
  }, [period, shift]);

  const tableData = dbData?.table || [
    { checkpoint: 'Oil Level', category: 'Visual', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 150' },
    { checkpoint: 'Torque Value', category: 'Measurement', status: 'NC', why: 'Tool issue', action: 'Recalibrated', repeated: 'No', model: 'Dominar 400' },
    { checkpoint: 'Engine Noise', category: 'Functional', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 220' },
    { checkpoint: 'Paint Quality', category: 'Visual', status: 'NC', why: 'Dust', action: 'Cleaned', repeated: 'Yes', model: 'Avenger' },
    { checkpoint: 'Clearance', category: 'Measurement', status: 'OK', why: '-', action: '-', repeated: 'No', model: 'Pulsar 150' },
  ];

  const columns = [
    { header: 'Checkpoint', accessorKey: 'checkpoint' },
    { header: 'Category', accessorKey: 'category' },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.original.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.original.status}
        </span>
      )
    },
    { header: 'Why', accessorKey: 'why' },
    { header: 'Immediate Action', accessorKey: 'action' },
    { header: 'Repeated', accessorKey: 'repeated' },
    { header: 'Model', accessorKey: 'model' },
  ];

  const exportToExcel = () => {
    exportToXLSX('PQCAReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Checkpoints', kpiData.totalCheckpoints], ['OK', kpiData.ok], ['NC', kpiData.nc], ['Single Occurrence NC', kpiData.singleNc], ['Double Occurrence NC', kpiData.doubleNc]] },
      { name: 'Compliance', rows: [['Status', 'Count'], ...complianceData.map(d => [d.name, d.value])] },
      { name: 'NC Trend', rows: [['Time', 'NC'], ...ncTrendData.map(d => [d.date, d.nc])] },
      { name: 'Checkpoint Details', rows: [['Checkpoint', 'Category', 'Status', 'Why', 'Immediate Action', 'Repeated', 'Model'], ...tableData.map(d => [d.checkpoint, d.category, d.status, d.why, d.action, d.repeated, d.model])] },
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model Family', options: ['All','Pulsar','Dominar','Avenger'], value: modelFamily, onChange: setModelFamily },
    { type: 'dropdown', label: 'Model', options: ['All','Pulsar 150','Pulsar 220','Dominar 400'], value: model, onChange: setModel },
  ];

  const filters = [...getBaseFilters(), ...customFilters];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="PQCA Report"
        icon={ClipboardCheck}
        onExcelClick={exportToExcel}
        filters={filters}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total Checkpoints" value={kpiData.totalCheckpoints} />
          <StatCard title="OK" value={kpiData.ok} />
          <StatCard title="NC" value={kpiData.nc} />
          <StatCard title="Single Occurrence NC" value={kpiData.singleNc} />
          <StatCard title="Double Occurrence NC" value={kpiData.doubleNc} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Compliance</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complianceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    <Cell fill={COLORS[2]} />
                    <Cell fill={COLORS[4]} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Category-wise NC</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryNcData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {categoryNcData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">NC Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ncTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nc" stroke={COLORS[4]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Checkpoint Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
