import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { LayoutDashboard, AlertTriangle, X, Wrench, ShieldAlert, Package, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StandardFilterBar from '../components/StandardFilterBar';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { exportToXLSX } from '../utils/exportExcel';
import useReportFilters from '../hooks/useReportFilters';
import useFilterOptions from '../hooks/useFilterOptions';
import { generateTimeLabels } from '../utils/timeDataGenerator';

export default function Production() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [activeLine, setActiveLine] = useState('All');
  const [activeModel, setActiveModel] = useState('All');
  const [selectedLoss, setSelectedLoss] = useState(null);

  const [dbData, setDbData] = useState({
    kpis: { totalPlan: 1300, totalProd: 265, shortfall: 1035, wip: 10, rollover: 8 },
    planVsActual: [{ name: 'Shift A', plan: 1300, actual: 265 }],
    straightPass: [{ name: 'Line 1', straight: 252, reworked: 13 }],
    skuData: [
      { line: 'Line 1', name: 'SKU-1', modelFamily: 'Family-1', plan: 500, actual: 85, wip: 5, rollover: 3 },
      { line: 'Line 1', name: 'SKU-2', modelFamily: 'Family-2', plan: 800, actual: 180, wip: 5, rollover: 5 }
    ],
    pareto: [
      { reason: 'Preventive maintenance', count: 1, duration: 237, cumPercent: 23 },
      { reason: 'Line changeover', count: 1, duration: 219, cumPercent: 44 },
      { reason: 'Power', count: 1, duration: 204, cumPercent: 64 },
      { reason: 'Failure', count: 1, duration: 192, cumPercent: 83 },
      { reason: 'Conveyor jam', count: 1, duration: 180, cumPercent: 100 }
    ]
  });

  React.useEffect(() => {
    fetch(`/api/dashboard/production?period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${activeLine}&model=${activeModel}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.kpis) {
          setDbData(data);
        }
      })
      .catch(err => {
        console.error('Error loading live production metrics:', err);
      });
  }, [period, shift, startDate, endDate, activeLine, activeModel]);

  const totalPlan = dbData.kpis?.totalPlan ?? (totalProd + shortfall);
  const totalProd = dbData.kpis?.totalProd ?? 265;
  const shortfall = dbData.kpis?.shortfall ?? 1035;
  const wip = dbData.kpis?.wip ?? 10;
  const rollover = dbData.kpis?.rollover ?? 8;

  const hourlyData = useMemo(() => {
    if (dbData.planVsActual && dbData.planVsActual.length > 0) {
      return dbData.planVsActual.map(r => ({
        time: r.time || r.name,
        plan: r.plan,
        actual: r.actual
      }));
    }
    const labels = generateTimeLabels(period, shift);
    const planPerLabel = Math.floor((totalProd + shortfall) / (labels.length || 1));
    const actualPerLabel = Math.floor(totalProd / (labels.length || 1));

    return labels.map(time => ({
      time,
      plan: planPerLabel,
      actual: actualPerLabel
    }));
  }, [period, shift, totalProd, shortfall, dbData.planVsActual]);

  const skuData = (dbData.skuData || []).filter(d => 
    (activeLine === 'All' || d.line === activeLine) &&
    (activeModel === 'All' || d.modelFamily === activeModel)
  );

  const getLossDetails = (reason) => {
    if (!reason) return null;
    const rLower = reason.toLowerCase();

    if (rLower.includes('preventive') || rLower.includes('pm') || rLower.includes('maintenance')) {
      return {
        dept: 'Plant Maintenance',
        route: '/maintenance',
        icon: Wrench,
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        rootCause: 'Scheduled preventive maintenance cycle (spindle lube, belt tensioning, sensor calibration).',
        impactMinutes: 35,
        engineer: 'Rajesh Nair (Sr. Maintenance Tech)',
        action: 'PM checklist executed, pneumatic filters cleaned, calibration verified.',
        engines: ['ENG-1000001', 'ENG-1000003']
      };
    }

    if (rLower.includes('quality') || rLower.includes('inspection') || rLower.includes('defect') || rLower.includes('hold')) {
      return {
        dept: 'Quality Assurance & Inspection',
        route: '/quality',
        icon: ShieldAlert,
        badge: 'bg-purple-100 text-purple-800 border-purple-300',
        rootCause: 'Cylinder head torque outlier (>52.4 Nm vs spec 45-50 Nm) during automated station check.',
        impactMinutes: 22,
        engineer: 'Anil Kulkarni (Quality Inspector)',
        action: 'Re-calibrated torque spindle transducer and routed affected batch to rework bay.',
        engines: ['ENG-1000002', 'ENG-1000004']
      };
    }

    if (rLower.includes('tool') || rLower.includes('wear') || rLower.includes('replacement')) {
      return {
        dept: 'Process & Tooling Engineering',
        route: '/process',
        icon: Clock,
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        rootCause: 'Carbide milling insert wear index exceeded safety threshold (>5,000 engine cycles).',
        impactMinutes: 18,
        engineer: 'Suresh Patil (Process Tooling)',
        action: 'Replaced tool insert, verified zero-point offset with dial gauge, and resumed cycle.',
        engines: ['ENG-1000005', 'ENG-1000006']
      };
    }

    if (rLower.includes('changeover') || rLower.includes('setup')) {
      return {
        dept: 'Production & Tooling',
        route: '/process',
        icon: Clock,
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        rootCause: 'Fixture and pallet changeover delay between Pulsar 150 and Dominar 400 tooling.',
        impactMinutes: 25,
        engineer: 'Vikas Sharma (Line Supervisor)',
        action: 'Quick-release clamp verified, Poka-yoke program re-indexed for Dominar model.',
        engines: ['ENG-1000007']
      };
    }

    if (rLower.includes('conveyor') || rLower.includes('jam') || rLower.includes('stoppage')) {
      return {
        dept: 'Automation & Controls',
        route: '/process',
        icon: AlertTriangle,
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        rootCause: 'Pallet proximity sensor optical blockage on Main Assembly Line transfer conveyor.',
        impactMinutes: 15,
        engineer: 'K. Raman (Automation Lead)',
        action: 'Cleared optical sensor debris and realigned photoelectric beam reflector.',
        engines: ['ENG-1000008']
      };
    }

    if (rLower.includes('power') || rLower.includes('electric')) {
      return {
        dept: 'Electrical & Utilities',
        route: '/maintenance',
        icon: AlertTriangle,
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        rootCause: 'Grid transient voltage fluctuation triggered drive safety interlock.',
        impactMinutes: 20,
        engineer: 'M. Joshi (Plant Electrician)',
        action: 'Reset servo drive controllers and verified clean auxiliary power bus.',
        engines: ['ENG-1000009']
      };
    }

    if (rLower.includes('material') || rLower.includes('short')) {
      return {
        dept: 'Stores & Material Kitting',
        route: '/material',
        icon: Package,
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        rootCause: 'M8 Flange Bolt batch stockout at Sub-Assembly Kitting Station 3.',
        impactMinutes: 24,
        engineer: 'Vikas Sharma (Stores Lead)',
        action: 'Expedited buffer pull from Main Storage Rack B-12.',
        engines: ['ENG-1000000']
      };
    }

    return {
      dept: 'Manufacturing Engineering',
      route: '/performance',
      icon: AlertTriangle,
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      rootCause: `Operational downtime event logged under "${reason}".`,
      impactMinutes: 14,
      engineer: 'Shift Supervisor',
      action: 'Standard operational recovery procedure executed and logged in PPMS.',
      engines: ['ENG-1000001']
    };
  };

  const paretoData = dbData.pareto && dbData.pareto.length > 0 ? dbData.pareto : [
    { reason: 'Preventive Maintenance', count: 9, duration: 237, cumPercent: 25 },
    { reason: 'Quality Inspection Delay', count: 7, duration: 219, cumPercent: 48 },
    { reason: 'Tool Wear & Replacement', count: 7, duration: 204, cumPercent: 68 },
    { reason: 'Line Changeover', count: 6, duration: 192, cumPercent: 84 },
    { reason: 'Conveyor Jam', count: 6, duration: 180, cumPercent: 100 },
  ];

  const currentLossDetails = selectedLoss ? getLossDetails(selectedLoss) : null;

  const columns = [
    { header: 'SKU Name', accessor: 'name' },
    { header: 'Plan Qty', accessor: 'plan' },
    { header: 'Actual Qty', accessor: 'actual' },
    { header: 'WIP Status', accessor: 'wip' },
    { header: 'Rollover Plan', accessor: 'rollover' }
  ];

  const exportToExcel = () => {
    exportToXLSX('Production_Report.xlsx', [
      { name: 'KPI Summary', rows: [['Metric', 'Value'], ['Total Production', totalProd], ['Production Shortfall', shortfall], ['Current WIP', wip], ['Rollover Quantity', rollover]] },
      { name: 'Hourly Plan vs Actual', rows: [['Time', 'Plan', 'Actual', 'Variance'], ...hourlyData.map(r => [r.time, r.plan, r.actual, r.actual - r.plan])] },
      { name: 'Loss Analysis', rows: [['Reason', 'Loss Count', 'Cumulative %'], ...paretoData.map(r => [r.reason, r.count, r.cumPercent + '%'])] },
      { name: 'SKU Production Status', rows: [['SKU Name', 'Plan Qty', 'Actual Qty', 'WIP Status', 'Rollover Plan'], ...skuData.map(r => [r.name, r.plan, r.actual, r.wip, r.rollover])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Production Report"
        icon={LayoutDashboard}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: ['All', 'Line 1', 'Line 2', 'Sub-Assy'], value: activeLine, onChange: setActiveLine },
          { type: 'dropdown', label: 'Model Family', options: ['All', 'Pulsar', 'Dominar', 'Avenger'], value: activeModel, onChange: setActiveModel }
        ]}
      />

      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Total Production"
            value={totalProd}
            trend={12.4}
            subtitle="vs Last Period"
            color="blue"
          />
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Production Shortfall"
            value={shortfall}
            trend={-4.2}
            subtitle="vs Last Period"
            color="red"
          />
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Current WIP"
            value={wip}
            sub="Mainline Assembly Buffer"
            color="amber"
          />
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Rollover Quantity"
            value={rollover}
            sub="QC & Material Holds"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-brand-dark mb-3">Plan vs Actual by Period</h3>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" name="Actual Prod." fill="#0ea5e9" />
                  <Line type="stepAfter" dataKey="plan" name="Target" stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark">Shortfall Pareto (Loss Analysis)</h3>
              <button
                onClick={() => {
                  const topReason = paretoData[0]?.reason;
                  if (topReason) setSelectedLoss(selectedLoss === topReason ? null : topReason);
                }}
                className="text-[10px] text-sky-700 hover:text-sky-800 font-bold uppercase tracking-wider bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                title="Click to view root cause breakdown"
              >
                {selectedLoss ? `Viewing: ${selectedLoss}` : 'Click bar for root cause'}
              </button>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart
                  data={paretoData}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedReason = e.activePayload[0].payload.reason;
                      setSelectedLoss(prev => prev === clickedReason ? null : clickedReason);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700">
                            <p className="font-bold text-amber-400">{data.reason}</p>
                            <p className="mt-1">Loss Events: <span className="font-semibold text-white">{data.count}</span></p>
                            <p>Cumulative: <span className="font-semibold text-rose-400">{data.cumPercent}%</span></p>
                            <p className="text-[10px] text-sky-300 mt-1 font-semibold">👉 Click bar to inspect root cause</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Loss Count"
                    fill="#f59e0b"
                    onClick={(entry) => {
                      if (entry && entry.reason) {
                        setSelectedLoss(prev => prev === entry.reason ? null : entry.reason);
                      }
                    }}
                    cursor="pointer"
                  >
                    {paretoData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedLoss === entry.reason ? '#0284c7' : '#f59e0b'}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                        onClick={() => setSelectedLoss(prev => prev === entry.reason ? null : entry.reason)}
                      />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="cumPercent" name="Cumulative %" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {selectedLoss && currentLossDetails && (
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-sky-500/50 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 ring-2 ring-sky-400/20">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    Root Cause Incident: <span className="text-amber-400">{selectedLoss}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${currentLossDetails.badge}`}>
                      {currentLossDetails.dept}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Impact: <span className="text-amber-400 font-bold">{currentLossDetails.impactMinutes} mins line downtime</span> • Assigned to: <span className="text-slate-200">{currentLossDetails.engineer}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoss(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close incident details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Diagnosed Root Cause</span>
                <p className="text-slate-200 font-medium leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                  {currentLossDetails.rootCause}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corrective Action Taken</span>
                <p className="text-slate-200 font-medium leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                  {currentLossDetails.action}
                </p>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Affected Engine Barcodes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLossDetails.engines.map((eng, i) => (
                      <span key={i} className="font-mono text-[11px] bg-slate-800 text-sky-400 px-2 py-1 rounded border border-slate-700 font-semibold">
                        {eng}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={currentLossDetails.route}
                  className="inline-flex items-center justify-center gap-1.5 mt-3 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-xs shadow"
                >
                  Inspect in {currentLossDetails.dept.split(' ')[0]} Module
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Model & SKU Wise Production Status</h3>
          <DataTable columns={columns} data={skuData} />
        </div>
      </div>
    </div>
  );
}









