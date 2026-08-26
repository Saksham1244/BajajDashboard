import React, { useState, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function SkillMatrixReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const kpiData = { total: 150, certifiedPct: 85, multiSkilled: 42, skillGaps: 12 };
  
  const tableData = [
    { operator: 'John Doe', station: 'ST-01', skillLevel: 'Expert', certified: 'Yes' },
    { operator: 'Jane Smith', station: 'ST-02', skillLevel: 'Intermediate', certified: 'Yes' },
    { operator: 'Mike Johnson', station: 'ST-03', skillLevel: 'Beginner', certified: 'No' },
    { operator: 'Sarah Williams', station: 'ST-04', skillLevel: 'Expert', certified: 'Yes' },
    { operator: 'David Brown', station: 'ST-05', skillLevel: 'Intermediate', certified: 'Yes' },
    { operator: 'Emily Davis', station: 'ST-01', skillLevel: 'Beginner', certified: 'No' },
    { operator: 'Tom Wilson', station: 'ST-02', skillLevel: 'Expert', certified: 'Yes' }
  ];

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
    { header: 'Skill Level', accessor: (row) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(row.skillLevel)}`}>{row.skillLevel}</span> },
    { header: 'Certified', accessor: (row) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCertifiedBadge(row.certified)}`}>{row.certified}</span> }
  ];

  const exportToExcel = () => {
    exportToXLSX('SkillMatrixReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Operators', kpiData.total], ['Certified %', kpiData.certifiedPct], ['Multi-skilled Operators', kpiData.multiSkilled], ['Skill Gaps', kpiData.skillGaps]] },
      { name: 'Skill Details', rows: [['Operator', 'Station', 'Skill Level', 'Certified'], ...tableData.map(d => [d.operator, d.station, d.skillLevel, d.certified])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Skill Matrix Report"
        icon={GraduationCap}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All','Line 1','Line 2','Sub-Assy'], value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: ['All','ST-01','ST-02','ST-03','ST-04','ST-05'], value: station, onChange: setStation }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard autoScale title="Total Operators" value={kpiData.total} />
          <StatCard autoScale title="Certified %" value={`${kpiData.certifiedPct}%`} />
          <StatCard autoScale title="Multi-skilled Operators" value={kpiData.multiSkilled} />
          <StatCard autoScale title="Skill Gaps" value={kpiData.skillGaps} />
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Operator Skill Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
