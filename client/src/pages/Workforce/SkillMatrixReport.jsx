import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo, useEffect } from 'react';
import { GraduationCap, Award, CheckCircle2, AlertTriangle, BookOpen, UserCheck } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SKILL_COLORS = {
  Expert: '#10b981',
  Intermediate: '#0284c7',
  Beginner: '#f59e0b'
};

export default function SkillMatrixReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/workforce/skill-matrix?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error('Error fetching skill matrix:', err));
  }, [period, shift, line, station]);

  const allTableData = useMemo(() => {
    return (dbData?.table || []).map(d => ({
      ...d,
      operator: d.operator || d.name || 'Operator',
      multiSkilled: d.multiSkilled || (d.skillLevel === 'Expert' ? 'Yes' : 'No')
    }));
  }, [dbData?.table]);

  const tableData = useMemo(() => {
    return allTableData.filter(d => 
      matchFilter(d.line, line) &&
      matchFilter(d.station, station)
    );
  }, [allTableData, line, station]);

  const totalOps = tableData.length;
  const certifiedCount = tableData.filter(d => d.certified === 'Yes').length;
  const certifiedPct = totalOps > 0 ? Number(((certifiedCount / totalOps) * 100).toFixed(1)) : 0;
  const expertCount = tableData.filter(d => d.skillLevel === 'Expert').length;
  const intermediateCount = tableData.filter(d => d.skillLevel === 'Intermediate').length;
  const beginnerCount = tableData.filter(d => d.skillLevel === 'Beginner').length;
  const multiSkilledCount = tableData.filter(d => d.multiSkilled === 'Yes').length;
  const skillGaps = beginnerCount;

  // Skill Level Distribution Donut
  const skillDistData = useMemo(() => {
    return [
      { name: 'Expert', value: expertCount, color: SKILL_COLORS.Expert },
      { name: 'Intermediate', value: intermediateCount, color: SKILL_COLORS.Intermediate },
      { name: 'Beginner', value: beginnerCount, color: SKILL_COLORS.Beginner }
    ].filter(d => d.value > 0);
  }, [expertCount, intermediateCount, beginnerCount]);

  // Station Skill Coverage % Bar Chart
  const coverageData = useMemo(() => {
    if (dbData?.stationCoverage && dbData.stationCoverage.length > 0) {
      return dbData.stationCoverage.filter(d => matchFilter(d.station, station));
    }
    const stationMap = {};
    tableData.forEach(d => {
      const st = d.station || 'General';
      if (!stationMap[st]) stationMap[st] = { station: st, total: 0, qualified: 0 };
      stationMap[st].total += 1;
      if (d.skillLevel === 'Expert' || d.skillLevel === 'Intermediate' || d.certified === 'Yes') {
        stationMap[st].qualified += 1;
      }
    });
    return Object.values(stationMap).map(st => ({
      station: st.station,
      coverage: st.total > 0 ? Math.round((st.qualified / st.total) * 100) : 0,
      total: st.total,
      qualified: st.qualified
    }));
  }, [dbData?.stationCoverage, tableData, station]);

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Intermediate': return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'Beginner': return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getCertifiedBadge = (certified) => {
    return certified === 'Yes' 
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
      : 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  const columns = [
    { header: 'Operator Name', accessor: 'operator' },
    { header: 'Station', accessor: 'station' },
    { header: 'Line', accessor: 'line' },
    { 
      header: 'Skill Level', 
      accessor: (row) => (
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getBadgeColor(row.skillLevel)}`}>
          {row.skillLevel}
        </span>
      )
    },
    { 
      header: 'Certified QA', 
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCertifiedBadge(row.certified)}`}>
          {row.certified}
        </span>
      )
    },
    { 
      header: 'Multi-Skilled', 
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.multiSkilled === 'Yes' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
          {row.multiSkilled}
        </span>
      )
    },
    { header: 'Last Assessed', accessor: 'lastAssessed' }
  ];

  const exportToExcel = () => {
    exportToXLSX('Skill_Matrix_Competency_Report.xlsx', [
      { 
        name: 'KPI Summary', 
        rows: [
          ['Metric', 'Value'],
          ['Total Operators', totalOps],
          ['Certified Personnel %', `${certifiedPct}%`],
          ['Expert Level (Level 3)', expertCount],
          ['Intermediate Level (Level 2)', intermediateCount],
          ['Beginner Level (Level 1)', beginnerCount],
          ['Multi-Skilled Operators', multiSkilledCount],
          ['Skill Gaps (Training Need)', skillGaps]
        ]
      },
      { 
        name: 'Operator Skill Matrix', 
        rows: [
          ['Operator Name', 'Station', 'Line', 'Skill Level', 'Certified', 'Multi-Skilled', 'Last Assessed'],
          ...tableData.map(d => [d.operator, d.station, d.line, d.skillLevel, d.certified, d.multiSkilled, d.lastAssessed])
        ]
      },
      {
        name: 'Station Skill Coverage',
        rows: [
          ['Station', 'Coverage %', 'Total Operators', 'Qualified Operators'],
          ...coverageData.map(d => [d.station, `${d.coverage}%`, d.total, d.qualified])
        ]
      }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Skill Matrix & Competency Report"
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
        {/* Executive Skill & Competency KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <StatCard title="Total Operators" value={totalOps} sub="Active Personnel" color="blue" />
          <StatCard 
            title="Certified %" 
            value={`${certifiedPct}%`} 
            sub="Standard Certified" 
            trend={certifiedPct >= 80 ? '+Target Met' : 'In Progress'} 
            trendLabel="Audit Standard" 
            color="green" 
          />
          <StatCard title="Expert (L3)" value={expertCount} sub="Mentors & Leads" color="emerald" />
          <StatCard title="Intermediate (L2)" value={intermediateCount} sub="Autonomous Ops" color="sky" />
          <StatCard title="Beginner (L1)" value={beginnerCount} sub="Under Mentorship" color="amber" />
          <StatCard title="Multi-Skilled" value={multiSkilledCount} sub="Cross-Line Ready" color="indigo" />
          <StatCard 
            title="Skill Gaps" 
            value={skillGaps} 
            sub="Upskilling Priority" 
            color={skillGaps > 0 ? 'rose' : 'emerald'} 
          />
        </div>

        {/* Visual Charts: Skill Distribution Donut + Station Coverage Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Chart 1: Skill Distribution */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                Skill Level Distribution (L1 - L3)
              </h3>
              <span className="text-xs font-semibold text-slate-500">{totalOps} Operators Profiled</span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {skillDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Station Skill Coverage */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Skill Qualification Coverage % per Station
              </h3>
              <span className="text-xs font-semibold text-emerald-600 font-bold">L2/L3 Qualified Ratio</span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="station" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={v => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    formatter={(val, name, item) => [`${val}% (${item.payload.qualified}/${item.payload.total} Ops)`, 'Coverage']}
                  />
                  <Legend />
                  <Bar dataKey="coverage" name="Qualified Coverage %" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Master Operator Skill Matrix Table */}
        <div className="card p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-brand-dark">
                Operator Skill Matrix & Competency Registry
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Official Certification Registry
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {tableData.length} records active
            </span>
          </div>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}

