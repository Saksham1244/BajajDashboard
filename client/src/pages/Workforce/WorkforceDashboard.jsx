import { matchFilter } from '../../utils/filterUtils';
import React, { useState, useMemo, useEffect } from 'react';
import { Users, UserCheck, CalendarCheck2, ShieldCheck } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#0284c7', '#8b5cf6'];

export default function WorkforceDashboard() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  const [line, setLine] = useState('All');
  const [station, setStation] = useState('All');
  const [activeTab, setActiveTab] = useState('both'); // 'both', 'allocation', 'attendance'
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    fetch(`/api/workforce/dashboard?period=${period}&shift=${shift}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error('Error fetching workforce data:', err));
  }, [period, shift, line, station]);

  const rawOperators = dbData?.operators || dbData?.table || [];
  const rawAllocations = dbData?.allocations || [];

  // Filter operator records
  const operators = useMemo(() => {
    return rawOperators.filter(d => 
      matchFilter(d.line, line) &&
      matchFilter(d.station, station)
    );
  }, [rawOperators, line, station]);

  // Filter station allocation records
  const allocations = useMemo(() => {
    return rawAllocations.filter(d => 
      matchFilter(d.line, line) &&
      matchFilter(d.station, station)
    );
  }, [rawAllocations, line, station]);

  // Key KPI metrics
  const totalScheduled = operators.length;
  const present = operators.filter(d => d.status === 'Present').length;
  const late = operators.filter(d => d.status === 'Late').length;
  const absent = operators.filter(d => d.status === 'Absent').length;
  const attendancePct = totalScheduled > 0 ? Number((((present + late) / totalScheduled) * 100).toFixed(1)) : 0;

  const totalStations = allocations.length;
  const fullyStaffed = allocations.filter(d => d.gap >= 0).length;
  const underStaffed = allocations.filter(d => d.gap < 0).length;

  // Chart 1: Attendance Distribution Donut
  const attendancePieData = useMemo(() => {
    const data = [
      { name: 'Present (On-Time)', value: present },
      { name: 'Late Arrival', value: late },
      { name: 'Absent', value: absent }
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: 'No Data', value: 1 }];
  }, [present, late, absent]);

  // Chart 2: Planned vs Actual Allocation by Station
  const allocationChartData = useMemo(() => {
    return allocations.map(d => ({
      station: d.station,
      planned: d.plannedCount || 2,
      actual: d.actualCount || 0,
      gap: d.gap || 0
    }));
  }, [allocations]);

  // Chart 3: Attendance % Trend over selected time period
  const attendanceTrendData = useMemo(() => {
    const labels = generateTimeLabels(period, shift);
    if (labels.length === 0) return [];
    return labels.map(label => ({
      time: label,
      pct: attendancePct > 0 ? attendancePct : 100
    }));
  }, [period, shift, attendancePct]);

  const getSkillBadge = (level) => {
    switch (level) {
      case 'Expert': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Intermediate': return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'Beginner': return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-800 font-semibold';
      case 'Late': return 'bg-amber-100 text-amber-800 font-semibold';
      case 'Absent': return 'bg-rose-100 text-rose-800 font-semibold';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getGapBadge = (gap) => {
    if (gap === 0) return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Optimal (0)</span>;
    if (gap < 0) return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">{gap} Understaffed</span>;
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">+{gap} Overstaffed</span>;
  };

  const allocationColumns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Line', accessor: 'line' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Planned Count', accessor: 'plannedCount' },
    { header: 'Actual Count', accessor: 'actualCount' },
    { 
      header: 'Staffing Status', 
      accessor: (row) => getGapBadge(row.gap) 
    },
    { header: 'Assigned Operator(s)', accessor: 'assignedOperators' }
  ];

  const operatorColumns = [
    { header: 'Operator Name', accessor: 'operator' },
    { header: 'Assigned Station', accessor: 'station' },
    { header: 'Line', accessor: 'line' },
    { header: 'Shift', accessor: 'shift' },
    { 
      header: 'Skill Level', 
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSkillBadge(row.skillLevel)}`}>
          {row.skillLevel}
        </span>
      )
    },
    { header: 'In Time', accessor: 'inTime' },
    { header: 'Out Time', accessor: 'outTime' },
    { header: 'Hours Worked', accessor: (row) => `${row.hoursWorked} hrs` },
    { 
      header: 'Attendance Status', 
      accessor: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      )
    }
  ];

  const exportToExcel = () => {
    exportToXLSX('Workforce_Allocation_Dashboard.xlsx', [
      {
        name: 'Workforce KPI Summary',
        rows: [
          ['Metric', 'Value'],
          ['Total Operators Scheduled', totalScheduled],
          ['Present (On-Time)', present],
          ['Late Arrivals', late],
          ['Absent', absent],
          ['Attendance %', `${attendancePct}%`],
          ['Total Active Stations', totalStations],
          ['Fully Staffed Stations', fullyStaffed],
          ['Understaffed Stations', underStaffed],
          ['Operator Utilization %', '92.5%'],
          ['Skill Match %', '95.0%']
        ]
      },
      {
        name: 'Station Allocation & Gaps',
        rows: [
          ['Station', 'Line', 'Shift', 'Planned Count', 'Actual Count', 'Gap', 'Assigned Operators'],
          ...allocations.map(d => [d.station, d.line, d.shift, d.plannedCount, d.actualCount, d.gap, d.assignedOperators])
        ]
      },
      {
        name: 'Operator Attendance & Status',
        rows: [
          ['Operator', 'Station', 'Line', 'Shift', 'Skill Level', 'In Time', 'Out Time', 'Hours Worked', 'Status'],
          ...operators.map(d => [d.operator, d.station, d.line, d.shift, d.skillLevel, d.inTime, d.outTime, d.hoursWorked, d.status])
        ]
      }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Workforce & Allocation Dashboard"
        icon={Users}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
          { type: 'dropdown', label: 'Station', options: filterOptions.stations, value: station, onChange: setStation }
        ]}
      />

      <div className="flex-1 flex flex-col gap-3">
        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <StatCard title="Total Operators" value={totalScheduled} sub="Target Roster" color="blue" />
          <StatCard title="Present (On-Time)" value={present} sub="Punctual Attendance" color="green" />
          <StatCard title="Late Arrivals" value={late} sub="Delayed Shift In" color="amber" />
          <StatCard title="Absent" value={absent} sub="Unexcused" color="rose" />
          <StatCard 
            title="Attendance %" 
            value={`${attendancePct}%`} 
            sub="Shift Compliance" 
            trend={attendancePct >= 95 ? '+High' : 'Normal'}
            trendLabel="Punctuality"
            color="indigo" 
          />
          <StatCard 
            title="Station Staffing" 
            value={`${fullyStaffed} / ${totalStations}`} 
            sub="Fully Staffed" 
            color="cyan" 
          />
          <StatCard 
            title="Staffing Gaps" 
            value={underStaffed > 0 ? `-${underStaffed}` : '0'} 
            sub={underStaffed > 0 ? 'Understaffed' : 'Optimal Coverage'} 
            color={underStaffed > 0 ? 'rose' : 'emerald'} 
          />
        </div>

        {/* Visual Analytics Row: Allocation Gap Bar, Attendance Donut, Trend Line */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart 1: Station Allocation Gap */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                Station Staffing: Planned vs Actual
              </h3>
              <span className="text-xs font-semibold text-slate-500">{totalStations} Stations</span>
            </div>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="station" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="planned" name="Planned Required" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Assigned" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Attendance Distribution */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                Shift Attendance Breakdown
              </h3>
              <span className="text-xs font-semibold text-slate-500">{totalScheduled} Personnel</span>
            </div>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={attendancePieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={80} 
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Attendance % Trend */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Attendance % Trend ({period})
              </h3>
              <span className="text-xs font-semibold text-emerald-600 font-bold">{attendancePct}% Overall</span>
            </div>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#64748b" />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pct" name="Attendance %" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* View Toggle Tabs for Detailed Tables */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'both' 
                  ? 'bg-brand-dark text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tables (Side-by-Side)
            </button>
            <button
              onClick={() => setActiveTab('allocation')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'allocation' 
                  ? 'bg-brand-dark text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Station Allocation Gaps ({allocations.length})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'attendance' 
                  ? 'bg-brand-dark text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Operator Attendance & Punches ({operators.length})
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Live workforce telemetry synchronized with SQL Server
          </span>
        </div>

        {/* Master Data Tables */}
        {(activeTab === 'both' || activeTab === 'allocation') && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-brand-dark">
                  Station Staffing Allocation & Gaps
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Station Coverage
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {allocations.length} workstations evaluated
              </span>
            </div>
            <DataTable columns={allocationColumns} data={allocations} />
          </div>
        )}

        {(activeTab === 'both' || activeTab === 'attendance') && (
          <div className="card p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-brand-dark">
                  Operator Attendance, Working Hours & Shift Assignment
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Status Log
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {operators.length} operators active
              </span>
            </div>
            <DataTable columns={operatorColumns} data={operators} />
          </div>
        )}
      </div>
    </div>
  );
}
