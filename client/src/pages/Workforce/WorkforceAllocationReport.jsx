import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo } from 'react';
import { UserCheck } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function WorkforceAllocationReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/workforce/allocation?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line]);

  const allTableData = dbData?.table || [];

  const tableData = allTableData.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.shift, shift)
  );

  const allocationData = tableData.map(d => ({
    station: d.station,
    planned: d.plannedCount || 0,
    actual: d.actualCount || 0
  }));

  const totalStations = tableData.length;
  const fullyStaffed = tableData.filter(d => d.gap === 0).length;
  const underStaffed = tableData.filter(d => d.gap < 0).length;
  const overStaffed = tableData.filter(d => d.gap > 0).length;

  const getGapBadge = (gap) => {
    if (gap === 0) return <span className="text-green-600 font-bold">0</span>;
    if (gap < 0) return <span className="text-red-600 font-bold">{gap}</span>;
    return <span className="text-amber-600 font-bold">+{gap}</span>;
  };

  const columns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Assigned Operator(s)', accessor: 'assignedOperator' },
    { header: 'Planned Count', accessor: 'plannedCount' },
    { header: 'Actual Count', accessor: 'actualCount' },
    { header: 'Gap', accessor: 'gap', render: (val) => getGapBadge(val) }
  ];

  const exportToExcel = () => {
    exportToXLSX('WorkforceAllocationReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Stations', totalStations], ['Fully Staffed', fullyStaffed], ['Under-staffed', underStaffed], ['Over-staffed', overStaffed]] },
      { name: 'Allocation Details', rows: [['Station', 'Assigned Operator', 'Planned Count', 'Actual Count', 'Gap'], ...tableData.map(d => [d.station, d.assignedOperator, d.plannedCount, d.actualCount, d.gap])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Workforce Allocation Report"
        icon={UserCheck}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Stations" value={totalStations} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Fully Staffed" value={fullyStaffed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Under-staffed" value={underStaffed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Over-staffed" value={overStaffed} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Planned vs Actual by Station</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={allocationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="station" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#0369a1" name="Planned Count" />
                <Bar dataKey="actual" fill="#10b981" name="Actual Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Allocation Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
