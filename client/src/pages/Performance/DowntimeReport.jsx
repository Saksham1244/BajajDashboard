import React, { useState, useMemo } from 'react';
import { Timer } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function DowntimeReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState([]);
  
  React.useEffect(() => {
        fetch(`http://localhost:5000/api/dashboard/performance?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data.downtime || []);
              })
      .catch(err => {
        console.error(err);
              });
  }, [period, shift]);

  const totalDowntime = dbData.reduce((acc, curr) => acc + curr.duration, 0) || 420;
  const noOfLosses = dbData.reduce((acc, curr) => acc + curr.occurrences, 0) || 35;
  const avgLossDuration = noOfLosses > 0 ? Math.round(totalDowntime / noOfLosses) : 0;
  let mostLostCat = 'None';
  if (dbData.length > 0) {
    const sorted = [...dbData].sort((a, b) => b.duration - a.duration);
    mostLostCat = sorted[0].category;
  }

  const kpiData = { totalDowntime, noOfLosses, mostLostCat, avgLossDuration };
  
  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const downtimePerLabel = Math.floor(totalDowntime / (labels.length || 1));
    return labels.map(time => ({
      time,
      duration: Math.max(0, downtimePerLabel + Math.floor(Math.random() * 10 - 5))
    }));
  }, [period, shift, dbData]);

  const categoryData = dbData.length > 0 ? dbData.map(d => ({
    category: d.category,
    duration: d.duration,
    occurrence: d.occurrences
  })) : [
    { category: 'Equipment Failure', duration: 180, occurrence: 5 },
    { category: 'Material Shortage', duration: 120, occurrence: 15 },
    { category: 'Setup/Adjustments', duration: 90, occurrence: 8 },
    { category: 'Quality Issues', duration: 30, occurrence: 7 }
  ];

  const tableData = [
    { category: 'Equipment Failure', subCategory: 'Motor Breakdown', startTime: '08:15', endTime: '09:00', duration: 45, occurrence: 1, machine: 'M-101', reason: 'Overheating' },
    { category: 'Material Shortage', subCategory: 'Part XYZ Missing', startTime: '11:00', endTime: '12:00', duration: 60, occurrence: 1, machine: 'M-102', reason: 'Supply Delay' },
    { category: 'Setup/Adjustments', subCategory: 'Tool Change', startTime: '06:30', endTime: '06:45', duration: 15, occurrence: 1, machine: 'M-103', reason: 'Wear and Tear' },
    { category: 'Quality Issues', subCategory: 'Defective Batch', startTime: '10:00', endTime: '10:10', duration: 10, occurrence: 1, machine: 'M-101', reason: 'Calibration Error' },
    { category: 'Equipment Failure', subCategory: 'Sensor Fault', startTime: '09:10', endTime: '09:30', duration: 20, occurrence: 1, machine: 'M-104', reason: 'Damaged wire' }
  ];

  const columns = [
    { header: 'Category', accessor: 'category' },
    { header: 'Sub-Category', accessor: 'subCategory' },
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration (mins)', accessor: 'duration' },
    { header: 'Occurrence', accessor: 'occurrence' },
    { header: 'Machine', accessor: 'machine' },
    { header: 'Reason', accessor: 'reason' }
  ];

  const exportToExcel = () => {
    exportToXLSX('DowntimeReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Overall Downtime (mins)', kpiData.totalDowntime], ['No. of Losses', kpiData.noOfLosses], ['Most Lost Category', kpiData.mostLostCat], ['Avg Loss Duration', kpiData.avgLossDuration]] },
      { name: 'Hourly Downtime', rows: [['Time', 'Duration (mins)'], ...hourlyData.map(d => [d.time, d.duration])] },
      { name: 'Category Downtime', rows: [['Category', 'Duration (mins)', 'Occurrence'], ...categoryData.map(d => [d.category, d.duration, d.occurrence])] },
      { name: 'Downtime Details', rows: [['Category', 'Sub-Category', 'Start Time', 'End Time', 'Duration (mins)', 'Occurrence', 'Machine', 'Reason'], ...tableData.map(d => [d.category, d.subCategory, d.startTime, d.endTime, d.duration, d.occurrence, d.machine, d.reason])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Downtime (Loss) Report"
        icon={Timer}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02','ST-03'], value: station, onChange: setStation },
          { type: 'dropdown', label: 'Model Family', options: ['All','Pulsar','Dominar','Avenger'], value: modelFamily, onChange: setModelFamily },
          { type: 'dropdown', label: 'Model', options: ['All','Pulsar 150','Pulsar 220','Dominar 400'], value: model, onChange: setModel },
          { type: 'dropdown', label: 'SKU', options: ['All','UG5','UG6','STD'], value: sku, onChange: setSku }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Overall Downtime (mins)" value={kpiData.totalDowntime} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="No. of Losses" value={kpiData.noOfLosses} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Most Lost Category" value={kpiData.mostLostCat} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Avg Loss Duration (mins)" value={kpiData.avgLossDuration} />
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Overall Downtime Minutes by Period</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="#f43f5e" name="Duration (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Category-wise Downtime with Duration</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" orientation="left" stroke="#f43f5e" />
                  <YAxis yAxisId="right" orientation="right" stroke="#0369a1" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="duration" fill="#f43f5e" name="Duration (mins)" />
                  <Line yAxisId="right" type="monotone" dataKey="occurrence" stroke="#0369a1" name="Occurrence Count" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Category-wise Loss with Occurrence Count</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occurrence" fill="#f97316" name="Occurrence Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Downtime Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
