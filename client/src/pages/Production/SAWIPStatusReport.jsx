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
  Cpu, 
  Layers, 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useFilterOptions from '../../hooks/useFilterOptions';

export default function SAWIPStatusReport() {
  const filterOptions = useFilterOptions();

  const [activeLine, setActiveLine] = useState('All');
  const [subAssemblyLine, setSubAssemblyLine] = useState('Cylinder Head');
  const [activeModel, setActiveModel] = useState('All');
  const [activeSku, setActiveSku] = useState('All');

  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const query = new URLSearchParams({
      line: activeLine || 'All',
      subAssemblyLine: subAssemblyLine || 'Cylinder Head',
      model: activeModel || 'All',
      sku: activeSku || 'All'
    });

    fetch(`/api/production/sa-wip?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setDbData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching SA WIP data:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeLine, subAssemblyLine, activeModel, activeSku]);

  const kpis = dbData?.kpis || {
    totalActiveWip: 0,
    started: 0,
    completed: 0,
    rework: 0,
    scrapped: 0,
    hold: 0
  };

  const wipSummary = useMemo(() => dbData?.wipSummary || [], [dbData]);
  const saDetails = useMemo(() => dbData?.saDetails || [], [dbData]);

  // Color badges for sub-assembly statuses
  const getStatusBadge = (st) => {
    const s = String(st || '').toLowerCase();
    if (s.includes('completed')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s.includes('rework') || s.includes('not ok')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (s.includes('hold')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (s.includes('scrapped')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (s.includes('bypass')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (s.includes('started') || s.includes('active')) return 'bg-sky-100 text-sky-800 border-sky-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // Excel Export
  const exportToExcel = () => {
    exportToXLSX('SA_WIP_Status_Report.xlsx', [
      {
        name: 'WIP Status Summary',
        rows: [
          ['Status Metric', 'Quantity'],
          ['Sub-Assembly Line', subAssemblyLine],
          ['Total Active WIP', kpis.totalActiveWip],
          ['Started', kpis.started],
          ['Completed', kpis.completed],
          ['Rework / Not OK', kpis.rework],
          ['Hold', kpis.hold],
          ['Scrapped', kpis.scrapped]
        ]
      },
      {
        name: 'SA WIP Details',
        rows: [
          ['SubAssemblyLine', 'VR SA No', 'Plan', 'SKU', 'Line', 'Start Time', 'Status', 'Not OK Station', 'Re-Entry Station'],
          ...saDetails.map(d => [
            d.subAssemblyLine,
            d.vrSaNo,
            d.plan,
            d.sku,
            d.line,
            d.startTime,
            d.status,
            d.notOkStation || '-',
            d.reEntryStation || '-'
          ])
        ]
      }
    ]);
  };

  const subLines = filterOptions.subAssemblyLines || [
    'Cylinder Head', 'Crankcase LH', 'Crankcase RH', 'Magneto', 'Transmission', 'Piston & Rod'
  ];

  const customFilters = [
    { type: 'dropdown', label: 'Line',            options: filterOptions.lines, value: activeLine,        onChange: setActiveLine },
    { type: 'dropdown', label: 'SubAssemblyLine', options: subLines,            value: subAssemblyLine,   onChange: setSubAssemblyLine },
    { type: 'dropdown', label: 'Model',           options: filterOptions.models,value: activeModel,       onChange: setActiveModel },
    { type: 'dropdown', label: 'SKU',             options: filterOptions.skus,  value: activeSku,         onChange: setActiveSku }
  ];

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      {/* Section 1: Filter Bar */}
      <StandardFilterBar
        title="SA WIP Status Report"
        icon={Cpu}
        onExcelClick={exportToExcel}
        filters={customFilters}
      />

      <div className="flex-1 flex flex-col gap-3">
        {/* Section 2: Important Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard title="Total Active WIP" value={kpis.totalActiveWip} color="purple" sub={`${subAssemblyLine} WIP`} />
          <StatCard title="Started" value={kpis.started} color="indigo" sub="In Assembly" />
          <StatCard title="Completed" value={kpis.completed} color="green" sub="Assembly Cleared" />
          <StatCard title="Rework" value={kpis.rework} color="amber" sub="Not OK / In Repair" />
          <StatCard title="Hold" value={kpis.hold} color="orange" sub="Quality / Prod Hold" />
          <StatCard title="Scrapped" value={kpis.scrapped} color="red" sub="Defective Sub-Assy" />
        </div>

        {/* Section 3: WIP Summary Bar Chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Sub-Assembly WIP Breakdown Summary — {subAssemblyLine}
              </h3>
              <p className="text-[11px] text-slate-400">Real-time status quantities across {subAssemblyLine}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Active WIP: {kpis.totalActiveWip} Units
            </span>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wipSummary} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Sub-Assembly Units" radius={[4, 4, 0, 0]}>
                  {wipSummary.map((entry, index) => {
                    let c = '#8b5cf6';
                    if (entry.name.includes('Completed')) c = '#10b981';
                    if (entry.name.includes('Not OK')) c = '#f59e0b';
                    if (entry.name.includes('Hold')) c = '#f97316';
                    if (entry.name.includes('Bypass')) c = '#0284c7';
                    return <Cell key={`cell-${index}`} fill={c} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Sub-Assembly WIP Details Table (EngineNo excluded as requested) */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-600" />
                Sub-Assembly WIP Tracking Details
              </h3>
              <p className="text-[11px] text-slate-400">
                Detailed serial-level view for {subAssemblyLine} (EngineNo omitted prior to engine marriage)
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {saDetails.length} active parts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 whitespace-nowrap">SubAssemblyLine</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">VR SA No</th>
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
                {saDetails.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                      No active WIP units found for {subAssemblyLine}.
                    </td>
                  </tr>
                ) : (
                  saDetails.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-sky-800">{row.subAssemblyLine}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.vrSaNo}</td>
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
        </div>
      </div>
    </div>
  );
}
