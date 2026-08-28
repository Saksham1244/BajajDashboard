import React, { useState, useMemo } from 'react';
import { Timer } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';

export default function DowntimeReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [modelFamily, setModelFamily] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');

  const [dbData, setDbData] = useState([]);
  
  React.useEffect(() => {
        fetch(`/api/dashboard/performance?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data.downtime || []);
              })
      .catch(err => {
        console.error(err);
              });
  }, [period, shift]);

  const scale = period === 'Week' ? 0.25 : period === 'Day' ? 0.03 : period === 'Shift' ? 0.015 : 1;

  const totalDowntime = Math.round(420 * scale);
  const noOfLosses = Math.max(1, Math.round(35 * scale));
  const avgLossDuration = Math.round(totalDowntime / noOfLosses);
  const mostLostCat = 'Equipment Failure';

  const kpiData = { totalDowntime, noOfLosses, mostLostCat, avgLossDuration };
  
  const hourlyData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    const downtimePerLabel = Math.floor(totalDowntime / (labels.length || 1));
    return labels.map((time, idx) => ({
      time,
      duration: Math.max(0, downtimePerLabel + ((idx % 3) - 1))
    }));
  }, [period, shift, totalDowntime]);

  const categoryData = [
    { category: 'Equipment Failure', duration: Math.round(180 * scale), occurrence: Math.max(1, Math.round(5 * scale)) },
    { category: 'Material Shortage', duration: Math.round(120 * scale), occurrence: Math.max(1, Math.round(15 * scale)) },
    { category: 'Setup/Adjustments', duration: Math.round(90 * scale), occurrence: Math.max(1, Math.round(8 * scale)) },
    { category: 'Quality Issues', duration: Math.round(30 * scale), occurrence: Math.max(1, Math.round(7 * scale)) }
  ].filter(d => d.duration > 0 || d.occurrence > 0);

  const allTableData = [
    { line: 'Line 1', station: 'ST-01', modelFamily: 'Pulsar', model: 'Pulsar 150', sku: 'UG5', category: 'Equipment Failure', subCategory: 'Motor Breakdown', startTime: '08:15', endTime: '09:00', duration: 45, occurrence: 1, machine: 'M-101', reason: 'Overheating' },
    { line: 'Line 1', station: 'ST-02', modelFamily: 'Dominar', model: 'Dominar 400', sku: 'STD', category: 'Material Shortage', subCategory: 'Part XYZ Missing', startTime: '11:00', endTime: '12:00', duration: 60, occurrence: 1, machine: 'M-102', reason: 'Supply Delay' },
    { line: 'Line 2', station: 'ST-01', modelFamily: 'Pulsar', model: 'Pulsar 220', sku: 'UG6', category: 'Setup/Adjustments', subCategory: 'Tool Change', startTime: '06:30', endTime: '06:45', duration: 15, occurrence: 1, machine: 'M-103', reason: 'Wear and Tear' },
    { line: 'Line 2', station: 'ST-03', modelFamily: 'Pulsar', model: 'Pulsar 150', sku: 'UG5', category: 'Quality Issues', subCategory: 'Defective Batch', startTime: '10:00', endTime: '10:10', duration: 10, occurrence: 1, machine: 'M-101', reason: 'Calibration Error' },
    { line: 'Line 1', station: 'ST-01', modelFamily: 'Avenger', model: 'Avenger 220', sku: 'STD', category: 'Equipment Failure', subCategory: 'Sensor Fault', startTime: '09:10', endTime: '09:30', duration: 20, occurrence: 1, machine: 'M-104', reason: 'Damaged wire' }
  ];

  const tableData = allTableData.filter(d => 
    (line === 'All' || d.line === line) &&
    (station === 'All' || d.station === station) &&
    (modelFamily === 'All' || d.modelFamily === modelFamily) &&
    (model === 'All' || d.model === model) &&
    (sku === 'All' || d.sku === sku)
  );

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
      { name: 'KPI', rows: [['Metric', 'Value'], ['Overall Downtime (mins)', kpiData.totalDowntime], ['No. of Losses', kpiData.noOfLosses], ['Most Lost Category', kpiData.mostLostCat], ['Avg Loss Duration (mins)', kpiData.avgLossDuration]] },
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
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation },
          { type: 'dropdown', label: 'Model Family', options: filterOptions.modelFamilies, value: modelFamily, onChange: setModelFamily },
          { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
          { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Overall Downtime (mins)" value={kpiData.totalDowntime} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="No. of Losses" value={kpiData.noOfLosses} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Most Lost Category" value={kpiData.mostLostCat} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Avg Loss Duration (mins)" value={kpiData.avgLossDuration} />
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
