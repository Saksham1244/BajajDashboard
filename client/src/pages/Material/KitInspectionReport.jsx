import React, { useState, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PackageSearch } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

const COLORS = ['#0369a1','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308'];

export default function KitInspectionReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const customFilters = [
    { type: 'dropdown', label: 'Model', options: ['All', 'Pulsar 150', 'Dominar 400'], value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: ['All', 'UG5', 'UG6'], value: sku, onChange: setSku },
  ];

  const defectData = [
    { defect: 'Missing Part', count: 12 },
    { defect: 'Wrong Part', count: 5 },
    { defect: 'Damaged Part', count: 3 },
  ];

  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map(time => ({
      time,
      inspected: Math.floor(Math.random() * 20) + 10,
      defects: Math.floor(Math.random() * 5)
    }));
  }, [period, shift]);

  const tableData = [
    { kitId: 'KIT-201', model: 'Pulsar 150', status: 'OK', defect: '-', operator: 'John Doe', time: '10:15' },
    { kitId: 'KIT-202', model: 'Dominar 400', status: 'NOK', defect: 'Missing Part', operator: 'Jane Smith', time: '10:45' },
    { kitId: 'KIT-203', model: 'Pulsar 150', status: 'OK', defect: '-', operator: 'John Doe', time: '11:00' },
    { kitId: 'KIT-204', model: 'Avenger 220', status: 'OK', defect: '-', operator: 'Mike Ross', time: '11:30' },
    { kitId: 'KIT-205', model: 'Pulsar 150', status: 'NOK', defect: 'Wrong Part', operator: 'Jane Smith', time: '12:00' },
  ];

  const columns = [
    { header: 'Kit ID', accessor: 'kitId' },
    { header: 'Model', accessor: 'model' },
    { header: 'Status', accessor: 'status', render: (val) => {
      const color = val === 'OK' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
      return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{val}</span>;
    }},
    { header: 'Defect', accessor: 'defect' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Time', accessor: 'time' },
  ];

  const exportToExcel = () => {
    exportToXLSX('KitInspectionReport.xlsx', [
      { name: 'KPI', rows: [
        ['Total Inspected', '150'],
        ['OK', '130'],
        ['NOK', '20'],
        ['Pass Rate %', '86.6%']
      ]},
      { name: 'Inspection Details', rows: [
        ['Kit ID', 'Model', 'Status', 'Defect', 'Operator', 'Time'],
        ...tableData.map(d => [d.kitId, d.model, d.status, d.defect, d.operator, d.time])
      ]}
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar title="Kit Inspection Report" icon={PackageSearch} onExcelClick={exportToExcel} filters={[...getBaseFilters(), ...customFilters]} />
      
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard autoScale title="Total Inspected"  value="150" color="bg-blue-100" />
          <StatCard autoScale title="OK"  value="130" color="bg-green-100" />
          <StatCard autoScale title="NOK"  value="20" color="bg-red-100" />
          <StatCard autoScale title="Pass Rate %"  value="86.6%" color="bg-purple-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Defect Count by Type</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={defectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="defect" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={COLORS[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Inspection Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inspected" stroke={COLORS[0]} name="Inspected" />
                  <Line type="monotone" dataKey="defects" stroke={COLORS[4]} name="Defects" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
