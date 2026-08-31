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

  const [dbData, setDbData] = useState(null);
  
  React.useEffect(() => {
    fetch(`/api/performance/downtime?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}&modelFamily=${encodeURIComponent(modelFamily)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station, modelFamily, model, sku]);

  const kpiData = dbData?.kpis || {
    totalDowntime: 0,
    noOfLosses: 0,
    mostLostCat: 'None',
    avgLossDuration: 0
  };
  
  const hourlyData = dbData?.hourly || [];
  const categoryData = dbData?.categories || [];
  const tableData = dbData?.table || [];

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
