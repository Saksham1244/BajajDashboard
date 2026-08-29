import React, { useState, useMemo } from 'react';
import { Network } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SkillMatrixDashboard() {
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

  const tableData = dbData?.table || [];

  const beginnerCount = dbData?.kpis?.beginner || tableData.filter(d => d.skillLevel === 'Beginner').length;
  const intermediateCount = dbData?.kpis?.intermediate || tableData.filter(d => d.skillLevel === 'Intermediate').length;
  const expertCount = dbData?.kpis?.expert || tableData.filter(d => d.skillLevel === 'Expert').length;
  const totalCount = tableData.length;

  const kpiData = { total: totalCount, beginner: beginnerCount, intermediate: intermediateCount, expert: expertCount };
  
  const skillDistData = [
    { name: 'Beginner', value: kpiData.beginner },
    { name: 'Intermediate', value: kpiData.intermediate },
    { name: 'Expert', value: kpiData.expert }
  ].filter(d => d.value > 0);
  
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  const coverageData = [
    { station: 'Demo', coverage: tableData.length > 0 ? 100 : 0 },
    { station: 'Line2', coverage: tableData.length > 0 ? 100 : 0 },
    { station: 'Station2', coverage: tableData.length > 0 ? 100 : 0 }
  ];

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { header: 'Operator Name', accessor: 'name' },
    { header: 'Station', accessor: 'station' },
    { header: 'Skill Level', accessor: 'skillLevel', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(val)}`}>{val}</span>
    )},
    { header: 'Certified', accessor: 'certified' },
    { header: 'Last Assessed', accessor: 'lastAssessed' }
  ];

  const exportToExcel = () => {
    exportToXLSX('SkillMatrixDashboard.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Operators', kpiData.total], ['Beginner', kpiData.beginner], ['Intermediate', kpiData.intermediate], ['Expert', kpiData.expert]] },
      { name: 'Skill Matrix', rows: [['Name', 'Station', 'Skill Level', 'Certified', 'Last Assessed'], ...tableData.map(d => [d.name, d.station, d.skillLevel, d.certified, d.lastAssessed])] },
      { name: 'Skill Coverage', rows: [['Station', 'Coverage %'], ...coverageData.map(d => [d.station, `${d.coverage}%`])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Skill Matrix Dashboard"
        icon={Network}
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
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Operators" value={kpiData.total} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Beginner" value={kpiData.beginner} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Intermediate" value={kpiData.intermediate} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Expert" value={kpiData.expert} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Skill Level Distribution</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={skillDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {skillDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Skill Coverage % per Station</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={coverageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="coverage" fill="#0369a1" name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Operator Skill Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
