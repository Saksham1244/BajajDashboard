import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';
import { 
  Network, 
  Layers, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wrench,
  FileSpreadsheet
} from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useFilterOptions from '../../hooks/useFilterOptions';

const ALL_WIP_AND_KIT_STATUSES = [
  // Kitting / Pre-Line Statuses
  'Plan',
  'Kit Started',
  'Kit Inspected',
  'VR Engine on Main Line',
  // Active Assembly Line WIP Statuses
  'EIN Engine on Main Line',
  'OK Bypass',
  'Completed Engine',
  'FG Engine',
  'Engine Scrapped/dismantled',
  'Material Hold',
  'Material Hold cleared',
  'For Prod Rework',
  'Prod Rework OK',
  'Prod Hold',
  'Prod Hold Cleared',
  'Prod Rejected',
  'For IPQC rework',
  'IPQC Rework OK',
  'IPQC Hold',
  'IPQC Hold Cleared',
  'IPQC Rejected',
  'FQC Rework',
  'FG Rework OK',
  'FQC Hold',
  'FQC Hold Cleared',
  'FG Rejected'
];

export default function EngineWIPStatusReport() {
  const filterOptions = useFilterOptions();

  const [activeLine, setActiveLine] = useState('All');
  const [activeModel, setActiveModel] = useState('All');
  const [activeSku, setActiveSku] = useState('All');
  const [activeTab, setActiveTab] = useState('engine'); // 'engine' | 'kitting'

  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const query = new URLSearchParams({
      line: activeLine || 'All',
      model: activeModel || 'All',
      sku: activeSku || 'All'
    });

    fetch(`/api/production/engine-wip?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setDbData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching engine WIP data:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeLine, activeModel, activeSku]);

  const kpis = dbData?.kpis || {
    totalActiveWip: 0,
    plan: 0,
    started: 0,
    completed: 0,
    rework: 0,
    scrapped: 0,
    hold: 0
  };

  const wipSummary = useMemo(() => {
    const raw = dbData?.wipSummary || [];
    const countMap = {};
    raw.forEach(item => {
      countMap[item.name] = item.count;
    });
    // Ensure each and every status (including kit statuses) is shown even if zero value is there
    return ALL_WIP_AND_KIT_STATUSES.map(name => ({
      name,
      count: countMap[name] !== undefined ? countMap[name] : 0,
      isKit: ['Plan', 'Kit Started', 'Kit Inspected', 'VR Engine on Main Line'].includes(name)
    }));
  }, [dbData]);
  const engineDetails = useMemo(() => dbData?.engineDetails || [], [dbData]);
  const kittingDetails = useMemo(() => dbData?.kittingDetails || [], [dbData]);

  // Color map for WIP statuses in table (22 active plant statuses)
  const getStatusBadge = (st) => {
    const s = String(st || '').toLowerCase();
    if (s.includes('completed') || s.includes('fg engine') || s.includes('rework ok') || s.includes('cleared')) 
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s.includes('rework')) 
      return 'bg-amber-100 text-amber-800 border-amber-300';
    if (s.includes('hold')) 
      return 'bg-orange-100 text-orange-800 border-orange-300';
    if (s.includes('rejected') || s.includes('scrapped') || s.includes('dismantled')) 
      return 'bg-rose-100 text-rose-800 border-rose-300';
    if (s.includes('ein') || s.includes('main line') || s.includes('bypass') || s.includes('started') || s.includes('active')) 
      return 'bg-sky-100 text-sky-800 border-sky-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // Color map for Kitting statuses (Plan, Kit Started, Kit Inspected, VR Engine on Main Line)
  const getKitStatusBadge = (st) => {
    const s = String(st || '').toLowerCase();
    if (s.includes('inspected') || s === 'ok') 
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s.includes('started')) 
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (s.includes('vr engine')) 
      return 'bg-purple-100 text-purple-800 border-purple-300';
    if (s.includes('plan')) 
      return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // Excel Export
  const exportToExcel = () => {
    exportToXLSX('Engine_WIP_Status_Report.xlsx', [
      {
        name: 'WIP Status Summary',
        rows: [
          ['Status', 'Quantity'],
          ['Total Active WIP', kpis.totalActiveWip],
          ['Plan', kpis.plan],
          ['Started / In Process', kpis.started],
          ['Completed', kpis.completed],
          ['Rework / Not OK', kpis.rework],
          ['Hold', kpis.hold],
          ['Scrapped', kpis.scrapped]
        ]
      },
      {
        name: 'Active Engine WIP Details',
        rows: [
          ['Engine No', 'Plan', 'SKU', 'Line', 'Start Time', 'Status', 'Not OK Station', 'Re-Entry Station'],
          ...engineDetails.map(d => [
            d.engineNo,
            d.plan,
            d.sku,
            d.line,
            d.startTime,
            d.status,
            d.notOkStation || '-',
            d.reEntryStation || '-'
          ])
        ]
      },
      {
        name: 'Kitting Status Details',
        rows: [
          ['Kit ID', 'Line', 'Model', 'Date', 'Shift', 'Status', 'Inspector', 'Time'],
          ...kittingDetails.map(k => [
            k.kitId,
            k.line,
            k.model,
            k.prodDate,
            k.prodShift,
            k.status,
            k.inspector,
            k.inspectionTime
          ])
        ]
      }
    ]);
  };

  const customFilters = [
    { type: 'dropdown', label: 'Line',  options: filterOptions.lines,  value: activeLine,  onChange: setActiveLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: activeModel, onChange: setActiveModel },
    { type: 'dropdown', label: 'SKU',   options: filterOptions.skus,   value: activeSku,   onChange: setActiveSku }
  ];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      {/* Section 1: Filter Bar */}
      <StandardFilterBar
        title="Engine WIP Status Report"
        icon={Network}
        onExcelClick={exportToExcel}
        filters={customFilters}
      />

      <div className="flex-1 flex flex-col gap-3">
        {/* Section 2: Important Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <StatCard title="Total Active WIP" value={kpis.totalActiveWip} color="purple" sub="On Production Floor" />
          <StatCard title="Plan" value={kpis.plan} color="blue" sub="Planned Queue" />
          <StatCard title="On Main Line" value={kpis.started} color="indigo" sub="EIN / Bypass / Cleared" />
          <StatCard title="Completed / FG" value={kpis.completed} color="green" sub="Line Cleared / FG" />
          <StatCard title="In Rework" value={kpis.rework} color="amber" sub="Prod / IPQC / FQC" />
          <StatCard title="On Hold" value={kpis.hold} color="orange" sub="Material / Prod / IPQC" />
          <StatCard title="Scrapped / Rejected" value={kpis.scrapped} color="red" sub="Scrapped & Rejected" />
        </div>

        {/* Section 3: WIP Summary Bar Chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                WIP Status Breakdown Summary
              </h3>
              <p className="text-[11px] text-slate-400">Aggregated quantities based on filter selection</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Total WIP: {kpis.totalActiveWip} Units
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Pre-Line Kitting (Plan, Started, Inspected, VR)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Main Line Assembly
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed / Cleared
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Rework
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> On Hold
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Scrapped / Rejected
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1200px] h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wipSummary} margin={{ top: 15, right: 15, left: 10, bottom: 75 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9, fill: '#475569' }} 
                    angle={-40} 
                    textAnchor="end" 
                    stroke="#94a3b8" 
                    interval={0} 
                    height={85}
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip 
                    formatter={(val, name, item) => [`${val} Units`, item?.payload?.isKit ? 'Kit Count' : 'Engine Count']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Bar dataKey="count" name="Quantity" radius={[4, 4, 0, 0]} minPointSize={2}>
                    {wipSummary.map((entry, index) => {
                      let c = '#6366f1';
                      const nm = (entry.name || '').toLowerCase();
                      if (nm === 'plan') c = '#38bdf8';
                      else if (nm === 'kit started') c = '#6366f1';
                      else if (nm === 'kit inspected') c = '#14b8a6';
                      else if (nm === 'vr engine on main line') c = '#8b5cf6';
                      else if (nm.includes('completed') || nm.includes('fg engine') || nm.includes('rework ok') || nm.includes('cleared')) c = '#10b981';
                      else if (nm.includes('rework')) c = '#f59e0b';
                      else if (nm.includes('hold')) c = '#f97316';
                      else if (nm.includes('scrapped') || nm.includes('rejected') || nm.includes('dismantled')) c = '#ef4444';
                      else if (nm.includes('ein') || nm.includes('bypass') || nm.includes('main line')) c = '#0284c7';
                      return <Cell key={`cell-${index}`} fill={c} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 4: Engine Details & Kitting Status Tables with Tabs */}
        <div className="card p-4 flex flex-col gap-3">
          {/* Tab Selector Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('engine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'engine' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Active Engine WIP Details ({engineDetails.length})
              </button>

              <button
                onClick={() => setActiveTab('kitting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'kitting' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Kitting Status Details ({kittingDetails.length})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              {activeTab === 'engine' ? 'Real-time assembly line WIP' : 'Pre-line kit preparation & inspection'}
            </span>
          </div>

          {/* TAB 1: Engine Details Table (VREngineNo excluded as requested) */}
          {activeTab === 'engine' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">Engine No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Plan</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">SKU</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Line</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Start Time</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Not OK Station</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Re-Entry Station</th>
                  </tr>
                </thead>
                <tbody>
                  {engineDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                        No active WIP engines for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    engineDetails.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.engineNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">#{row.plan}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.sku}</td>
                        <td className="py-2.5 px-3 font-medium">{row.line}</td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{row.startTime}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                          {row.notOkStation && row.notOkStation !== 0 ? `ST-${row.notOkStation}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                          {row.reEntryStation && row.reEntryStation !== 0 ? `ST-${row.reEntryStation}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Kitting Status Table */}
          {activeTab === 'kitting' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 whitespace-nowrap">Kit ID</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Line</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Shift</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Inspector</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {kittingDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                        No kitting records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    kittingDetails.map((k, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-brand-dark">{k.kitId}</td>
                        <td className="py-2.5 px-3">{k.line}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{k.model}</td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{k.prodDate}</td>
                        <td className="py-2.5 px-3 text-slate-600">{k.prodShift}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getKitStatusBadge(k.status)}`}>
                            {k.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{k.inspector}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{k.inspectionTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
