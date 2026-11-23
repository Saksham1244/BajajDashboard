import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wrench, 
  RotateCcw, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  AlertOctagon, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  X, 
  Package, 
  ShieldAlert, 
  CheckCircle, 
  FileSpreadsheet, 
  Printer,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';

export default function ReworkAnalysisReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();

  // Filters
  const [line, setLine] = useState('All');
  const [selectedDefect, setSelectedDefect] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Closed'

  // Expandable rows state
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Report Data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch report data
  const fetchData = () => {
    setLoading(true);
    const query = new URLSearchParams({
      period: period || 'Shift',
      shift: shift || 'All',
      startDate: startDate || '',
      endDate: endDate || '',
      line: line || 'All',
      defect: selectedDefect || 'All'
    });

    fetch(`/api/quality/rework-analysis?${query.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rework analysis:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [period, shift, startDate, endDate, line, selectedDefect]);

  // KPIs
  const kpis = data?.kpis || {
    totalProduction: 0,
    totalDefects: 0,
    distinctEngines: 0,
    closedDefects: 0,
    activeDefects: 0
  };

  const trendData = data?.trend || [];
  const topDefects = data?.topDefects || [];
  const rawTable = data?.table || [];
  const liveShift = data?.liveShift || { shift: 'Shift 1', timeRange: '06:00 - 14:00', isActive: true };

  // Filtered Table Rows
  const filteredTable = useMemo(() => {
    let list = rawTable;

    // Filter by card status
    if (statusFilter === 'Active') {
      list = list.filter(r => r.defectStatusCode !== 2);
    } else if (statusFilter === 'Closed') {
      list = list.filter(r => r.defectStatusCode === 2);
    }

    // Filter by table search input
    if (tableSearch.trim()) {
      const term = tableSearch.toLowerCase();
      list = list.filter(r => 
        (r.engineNo && r.engineNo.toLowerCase().includes(term)) ||
        (r.remark && r.remark.toLowerCase().includes(term)) ||
        (r.inspectionPoint && r.inspectionPoint.toLowerCase().includes(term)) ||
        (r.defectPoint && r.defectPoint.toLowerCase().includes(term)) ||
        (r.updatedBy && r.updatedBy.toLowerCase().includes(term)) ||
        (r.engineStatus && r.engineStatus.toLowerCase().includes(term))
      );
    }

    return list;
  }, [rawTable, statusFilter, tableSearch]);

  // Toggle row expansion
  const toggleRow = (defectLogId) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(defectLogId)) {
        next.delete(defectLogId);
      } else {
        next.add(defectLogId);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const toggleAllRows = () => {
    if (expandedRows.size === filteredTable.length) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(filteredTable.map(r => r.defectLogId)));
    }
  };

  // Status Badge Styling Helper
  const getStatusBadge = (statusName, statusCode) => {
    const s = String(statusName || '').toLowerCase();
    if (s.includes('ok') || statusCode === 15 || statusCode === 25) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/40';
    }
    if (s.includes('hold') || statusCode === 22) {
      return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-300/40';
    }
    if (s.includes('scrapped') || s.includes('rejected') || statusCode === 18 || statusCode === 28) {
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-300/40';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40';
  };

  // Excel Export
  const exportToExcel = () => {
    exportToXLSX('Rework_Analysis_Report.xlsx', [
      {
        name: 'KPI Summary',
        rows: [
          ['Metric', 'Value', 'Note'],
          ['Total Production', kpis.totalProduction, 'Total Engines Completed'],
          ['Total Defect', kpis.totalDefects, `On basis of engine count: ${kpis.distinctEngines} Engines`],
          ['Closed Defect', kpis.closedDefects, 'Passed Quality Gate / Repaired'],
          ['Active Defect', kpis.activeDefects, 'In Rework / Active Hold']
        ]
      },
      {
        name: 'Defect Trend',
        rows: [
          ['Time Interval', 'Rework Total', 'Rework OK', 'Rework NOK / Scrapped'],
          ...trendData.map(t => [t.time, t.rework, t.reworkOk, t.reworkNok])
        ]
      },
      {
        name: 'Top 5 Defects',
        rows: [
          ['Rank', 'Defect Name', 'Occurrences', 'Share %'],
          ...topDefects.map((d, i) => [i + 1, d.name, d.count, d.percentage])
        ]
      },
      {
        name: 'Defect Details & Actions',
        rows: [
          ['DefectLogID', 'Inspection Point', 'Defect Point', 'Engine No', 'Remark', 'Date & Time', 'Engine Status', 'Defect Status', 'Updated By', 'Last Updated Time', 'Actions Count', 'Latest Action Remark'],
          ...filteredTable.map(r => [
            r.defectLogId,
            r.inspectionPoint,
            r.defectPoint,
            r.engineNo,
            r.remark,
            r.dateTime,
            r.engineStatus,
            r.defectStatus,
            r.updatedBy,
            r.lastUpdatedTime,
            r.actions?.length || 0,
            r.actions?.[0]?.remark || '-'
          ])
        ]
      }
    ]);
  };

  // Custom filters for StandardFilterBar
  const defectOptions = useMemo(() => {
    const names = Array.from(new Set(rawTable.map(r => r.remark).filter(Boolean)));
    return ['All', ...names];
  }, [rawTable]);

  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Defect Filter', options: defectOptions, value: selectedDefect, onChange: setSelectedDefect }
  ];

  const allFilters = [...getBaseFilters(), ...customFilters];

  return (
    <div className="pb-6 max-w-[1700px] mx-auto px-1 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: StandardFilterBar with Live Shift Indicator */}
      <div className="relative">
        <StandardFilterBar
          title="Rework Analysis Report"
          icon={Wrench}
          onExcelClick={exportToExcel}
          filters={allFilters}
        />
        {/* Live Shift Badge */}
        <div className="absolute right-28 top-3 hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300/60 rounded-full text-xs font-semibold text-emerald-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Shift: {liveShift.shift}</span>
          <span className="text-emerald-600/70 font-normal">({liveShift.timeRange})</span>
        </div>
      </div>

      {/* SECTION 2: 4 Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Total Production */}
        <div 
          onClick={() => setStatusFilter('All')}
          className="cursor-pointer bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs hover:border-brand-blue hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-sky-600 transition">
              Total Production
            </span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">
            {kpis.totalProduction.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Completed Engines in Period
          </div>
        </div>

        {/* Card 2: Total Defect (On basis of engine count) */}
        <div 
          onClick={() => setStatusFilter('All')}
          className={`cursor-pointer bg-white rounded-xl border p-3.5 shadow-xs hover:shadow-md transition group ${statusFilter === 'All' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-amber-200/80 hover:border-amber-400'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition">
              Total Defect
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">
            {kpis.totalDefects}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
            On basis of engine count: {kpis.distinctEngines} Engines
          </div>
        </div>

        {/* Card 3: Closed Defect */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Closed' ? 'All' : 'Closed')}
          className={`cursor-pointer bg-white rounded-xl border p-3.5 shadow-xs hover:shadow-md transition group ${statusFilter === 'Closed' ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-emerald-200/80 hover:border-emerald-400'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition">
              Closed Defect
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">
            {kpis.closedDefects}
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Passed Quality Gate / Repaired
          </div>
        </div>

        {/* Card 4: Active Defect */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active')}
          className={`cursor-pointer bg-white rounded-xl border p-3.5 shadow-xs hover:shadow-md transition group ${statusFilter === 'Active' ? 'border-rose-400 ring-2 ring-rose-400/20' : 'border-rose-200/80 hover:border-rose-400'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-rose-600 transition">
              Active Defect
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">
            {kpis.activeDefects}
          </div>
          <div className="mt-2 text-[11px] font-medium text-rose-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            In Rework / Active Hold
          </div>
        </div>
      </div>

      {/* SECTION 3: Charts (Defect Trend on basis of time + Top 5 defects) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Chart: Defect Trend on basis of time */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-dark" />
                <h3 className="text-sm font-bold text-slate-800">
                  Defect Trend on basis of time
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Defect analysis reports on basis of defect filter
              </p>
            </div>

            {/* Filter Pill */}
            {selectedDefect !== 'All' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
                <span>Filter: {selectedDefect}</span>
                <button 
                  onClick={() => setSelectedDefect('All')}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition"
                  title="Clear defect filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Showing All Defects ({kpis.totalDefects})
              </span>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  formatter={(value) => (
                    <span className="text-slate-700 font-semibold">{value}</span>
                  )}
                />
                <Bar dataKey="rework" name="Rework" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reworkOk" name="Rework OK" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reworkNok" name="Rework NOK" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Top 5 defects (On basis of occurance) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-dark" />
                <h3 className="text-sm font-bold text-slate-800">
                  Top 5 defects (On basis of occurance)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any defect bar to drill down trend & table
              </p>
            </div>
            {selectedDefect !== 'All' && (
              <button 
                onClick={() => setSelectedDefect('All')}
                className="text-[11px] font-semibold text-brand-blue hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2.5">
            {topDefects.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">No defects reported in this period</div>
            ) : (
              topDefects.map((def, idx) => {
                const isSelected = selectedDefect === def.name;
                const maxCount = topDefects[0]?.count || 1;
                const barWidth = Math.max(12, Math.round((def.count / maxCount) * 100));

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDefect(isSelected ? 'All' : def.name)}
                    className={`p-2 rounded-lg cursor-pointer transition border ${isSelected ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400/40' : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="truncate max-w-[200px]" title={def.name}>
                        {idx + 1}. {def.name}
                      </span>
                      <span className="font-mono text-slate-600 ml-2">
                        {def.count} <span className="text-[10px] text-slate-400 font-normal">({def.percentage})</span>
                      </span>
                    </div>
                    {/* Progress visual bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-indigo-600' : 'bg-sky-600'}`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: Defect Details Table with Engine No & Expandable Action Drilldown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-dark" />
              <h3 className="text-sm font-bold text-slate-800">
                Defect detaials in table with engine no
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              defect trend on basis of selected defect in defect analysis report
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'All' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-600 hover:text-brand-dark'}`}
              >
                All ({rawTable.length})
              </button>
              <button
                onClick={() => setStatusFilter('Active')}
                className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'Active' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-brand-dark'}`}
              >
                Active ({kpis.activeDefects})
              </button>
              <button
                onClick={() => setStatusFilter('Closed')}
                className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'Closed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-brand-dark'}`}
              >
                Closed ({kpis.closedDefects})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search engine no, defect..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue w-56"
              />
            </div>

            {/* Expand / Collapse All Button */}
            <button
              onClick={toggleAllRows}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {expandedRows.size === filteredTable.length && filteredTable.length > 0 ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Selected Defect Active Indicator */}
        {selectedDefect !== 'All' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-amber-800">
            <span>Filtered for defect: <b>"{selectedDefect}"</b></span>
            <button 
              onClick={() => setSelectedDefect('All')}
              className="text-amber-900 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filter
            </button>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">Expand</th>
                <th className="py-2.5 px-3">Inspection Point</th>
                <th className="py-2.5 px-3">Defect Point</th>
                <th className="py-2.5 px-3">Engine No</th>
                <th className="py-2.5 px-3">Remark</th>
                <th className="py-2.5 px-3">DateTime</th>
                <th className="py-2.5 px-3">Engine Status</th>
                <th className="py-2.5 px-3">Defect Status</th>
                <th className="py-2.5 px-3">Updated By</th>
                <th className="py-2.5 px-3">Last Updated Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    Loading rework analysis records...
                  </td>
                </tr>
              ) : filteredTable.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No defect records found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTable.map((row) => {
                  const isExpanded = expandedRows.has(row.defectLogId);
                  const actions = row.actions || [];

                  return (
                    <React.Fragment key={row.defectLogId}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${isExpanded ? 'bg-indigo-50/20' : ''}`}
                        onClick={() => toggleRow(row.defectLogId)}
                      >
                        {/* Expand Button */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleRow(row.defectLogId); }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 transition"
                            title={isExpanded ? 'Collapse Actions' : 'Expand Actions'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-600 font-bold" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Inspection Point */}
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                            <span className="truncate max-w-[140px]" title={row.inspectionPoint}>{row.inspectionPoint}</span>
                          </div>
                        </td>

                        {/* Defect Point */}
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <span className="truncate max-w-[140px]" title={row.defectPoint}>{row.defectPoint}</span>
                        </td>

                        {/* Engine No */}
                        <td className="py-2.5 px-3 font-bold font-mono text-brand-dark">
                          {row.engineNo}
                        </td>

                        {/* Remark */}
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          <span className="line-clamp-1 max-w-[240px]" title={row.remark}>
                            {row.remark}
                          </span>
                        </td>

                        {/* DateTime */}
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {row.dateTime}
                        </td>

                        {/* Engine Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(row.engineStatus, row.engineStatusCode)}`}>
                            {row.engineStatus}
                          </span>
                        </td>

                        {/* Defect Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${row.defectStatusCode === 2 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {row.defectStatus}
                          </span>
                        </td>

                        {/* Updated By */}
                        <td className="py-2.5 px-3 font-medium text-slate-600">
                          {row.updatedBy}
                        </td>

                        {/* Last Updated Time */}
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {row.lastUpdatedTime}
                        </td>
                      </tr>

                      {/* Expandable Child Row: Rework Actions Log */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/30">
                          <td colSpan={10} className="p-3 pl-12 pr-6">
                            <div className="bg-white rounded-lg border border-indigo-200 shadow-2xs p-3">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                                  <span className="text-xs font-bold text-slate-800">
                                    Action Rework Log (Prod_DefectAction_Log)
                                  </span>
                                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                                    {actions.length} {actions.length === 1 ? 'Action' : 'Actions'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Defect Log #{row.defectLogId} • Engine: {row.engineNo}
                                </span>
                              </div>

                              {actions.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-400">
                                  No rework actions recorded yet for this defect ticket.
                                </div>
                              ) : (
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                      <th className="py-1.5 px-2.5 w-24">ActionID</th>
                                      <th className="py-1.5 px-2.5">Remark</th>
                                      <th className="py-1.5 px-2.5 w-36">Status</th>
                                      <th className="py-1.5 px-2.5 w-32">UpdatedBy</th>
                                      <th className="py-1.5 px-2.5 w-40">Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {actions.map((act, actIdx) => (
                                      <tr key={actIdx} className="hover:bg-slate-50/50">
                                        <td className="py-2 px-2.5 font-bold font-mono text-indigo-700">
                                          #{act.actionId}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-700 font-medium">
                                          {act.remark}
                                        </td>
                                        <td className="py-2 px-2.5">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${act.statusCode === 2 || act.statusCode === 3 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            {act.status}
                                          </span>
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-600 font-medium">
                                          {act.updatedBy}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-400 text-[11px]">
                                          {act.timestamp}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <b className="text-slate-800">{filteredTable.length}</b> of <b className="text-slate-800">{rawTable.length}</b> records
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active: <b className="text-rose-600">{kpis.activeDefects}</b></span>
            <span>Closed: <b className="text-emerald-600">{kpis.closedDefects}</b></span>
            <span>Distinct Engines: <b className="text-indigo-600">{kpis.distinctEngines}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
