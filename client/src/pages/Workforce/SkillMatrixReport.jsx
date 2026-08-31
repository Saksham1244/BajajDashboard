import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function SkillMatrixReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/workforce/skill-matrix?period=${period}&shift=${shift}&line=${line}&station=${station}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift, line, station]);

  const allTableData = (dbData?.table || [
    { operator: 'Rahul Sharma', line: 'Line 1', station: 'Demo', skillLevel: 'Expert', certified: 'Yes' },
    { operator: 'Priya Singh', line: 'Line 2', station: 'Line2', skillLevel: 'Intermediate', certified: 'Yes' },
    { operator: 'Amit Kumar', line: 'Line 1', station: 'Station2', skillLevel: 'Beginner', certified: 'No' },
    { operator: 'Neha Verma', line: 'Line 2', station: 'Demo', skillLevel: 'Intermediate', certified: 'Yes' },
    { operator: 'Vikram Patel', line: 'Line 1', station: 'Line2', skillLevel: 'Expert', certified: 'Yes' },
    { operator: 'Sneha Gupta', line: 'Line 2', station: 'Station2', skillLevel: 'Beginner', certified: 'No' }
  ]).map(d => ({
    ...d,
    operator: d.operator || d.name || 'Operator'
  }));

  const tableData = allTableData.filter(d => 
    matchFilter(d.line, line) &&
    matchFilter(d.station, station)
  );

  const totalOps = tableData.length;
  const certifiedCount = tableData.filter(d => d.certified === 'Yes').length;
  const certifiedPct = totalOps > 0 ? Math.round((certifiedCount / totalOps) * 100) : 0;
  const multiSkilled = tableData.filter(d => d.skillLevel === 'Expert' || d.skillLevel === 'Intermediate').length;
  const skillGaps = tableData.filter(d => d.skillLevel === 'Beginner').length;

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertifiedBadge = (certified) => {
    return certified === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const columns = [
    { header: 'Operator', accessor: 'operator' },
    { header: 'Station', accessor: 'station' },
    { header: 'Skill Level', accessor: 'skillLevel', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(val)}`}>{val}</span>
    )},
    { header: 'Certified', accessor: 'certified', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCertifiedBadge(val)}`}>{val}</span>
    )}
  ];

  const exportToExcel = () => {
    exportToXLSX('SkillMatrixReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Operators', totalOps], ['Certified %', `${certifiedPct}%`], ['Multi-skilled Operators', multiSkilled], ['Skill Gaps', skillGaps]] },
      { name: 'Skill Details', rows: [['Operator', 'Station', 'Skill Level', 'Certified'], ...tableData.map(d => [d.operator, d.station, d.skillLevel, d.certified])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Skill Matrix Report"
        icon={GraduationCap}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Operators" value={totalOps} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Certified %" value={`${certifiedPct}%`} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Multi-skilled Operators" value={multiSkilled} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Skill Gaps" value={skillGaps} />
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Operator Skill Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
