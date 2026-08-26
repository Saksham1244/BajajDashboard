import React, { useState, useMemo } from 'react';
import { UserCheck } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function WorkforceAllocationReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  
  const [line, setLine] = useState('All');

  const kpiData = { totalStations: 25, fullyStaffed: 20, underStaffed: 4, overStaffed: 1 };
  
  const allocationData = [
    { station: 'ST-01', planned: 5, actual: 5 },
    { station: 'ST-02', planned: 4, actual: 3 },
    { station: 'ST-03', planned: 6, actual: 6 },
    { station: 'ST-04', planned: 3, actual: 4 },
    { station: 'ST-05', planned: 5, actual: 3 }
  ];

  const tableData = [
    { station: 'ST-01', assignedOperator: 'John Doe, Jane Smith...', plannedCount: 5, actualCount: 5, gap: 0 },
    { station: 'ST-02', assignedOperator: 'Mike Johnson...', plannedCount: 4, actualCount: 3, gap: -1 },
    { station: 'ST-03', assignedOperator: 'Sarah Williams...', plannedCount: 6, actualCount: 6, gap: 0 },
    { station: 'ST-04', assignedOperator: 'David Brown, Tom Wilson...', plannedCount: 3, actualCount: 4, gap: 1 },
    { station: 'ST-05', assignedOperator: 'Emily Davis...', plannedCount: 5, actualCount: 3, gap: -2 }
  ];

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
    { header: 'Gap', accessor: (row) => getGapBadge(row.gap) }
  ];

  const exportToExcel = () => {
    exportToXLSX('WorkforceAllocationReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Stations', kpiData.totalStations], ['Fully Staffed', kpiData.fullyStaffed], ['Under-staffed', kpiData.underStaffed], ['Over-staffed', kpiData.overStaffed]] },
      { name: 'Allocation Details', rows: [['Station', 'Assigned Operator', 'Planned Count', 'Actual Count', 'Gap'], ...tableData.map(d => [d.station, d.assignedOperator, d.plannedCount, d.actualCount, d.gap])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Workforce Allocation Report"
        icon={UserCheck}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Stations" value={kpiData.totalStations} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Fully Staffed" value={kpiData.fullyStaffed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Under-staffed" value={kpiData.underStaffed} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Over-staffed" value={kpiData.overStaffed} />
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
