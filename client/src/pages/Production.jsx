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
  const { period, shift, getBaseFilters } = useReportFilters();
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
    fetch(`/api/dashboard/production?period=${period}&shift=${shift}&line=${activeLine}&model=${activeModel}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.kpis) {
          setDbData(data);
        }
      })
      .catch(err => {
        console.error('Error loading live production metrics:', err);
      });
  }, [period, shift, activeLine, activeModel]);

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

  const lossDetailsMap = {
    'Material Short': {
      dept: 'Stores & Material Kitting',
      route: '/material',
      icon: Package,
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      rootCause: 'M8 Flange Bolt batch stockout at Kitting Station 3',
      impactMinutes: 24,
      engineer: 'Vikas Sharma (Stores Lead)',
      action: 'Expedited buffer pull from Main Storage Rack B-12',
      engines: ['ENG-2026-00412', 'ENG-2026-00415']
    },
    'Machine BD': {
      dept: 'Plant Maintenance',
      route: '/maintenance',
      icon: Wrench,
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      rootCause: 'ST-02 Conveyor motor overload trip & gearbox bearing overheat',
      impactMinutes: 35,
      engineer: 'Rajesh Nair (Sr. Maintenance Tech)',
      action: 'Replaced thermal relay and lubricated drive chain assembly',
      engines: ['ENG-2026-00389', 'ENG-2026-00392', 'ENG-2026-00398']
    },
    'Quality Hold': {
      dept: 'Quality Assurance & Inspection',
      route: '/quality',
      icon: ShieldAlert,
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      rootCause: 'Cylinder head torque outlier (>52.4 Nm vs spec 45-50 Nm)',
      impactMinutes: 18,
      engineer: 'Anil Kulkarni (Quality Inspector)',
      action: 'Re-calibrated Atlas Copco torque spindle and flagged lot for leak test',
      engines: ['ENG-2026-00440', 'ENG-2026-00441']
    },
    'Setup Delay': {
      dept: 'Process & Tooling Engineering',
      route: '/process',
      icon: Clock,
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      rootCause: 'Piston sub-assembly JIG-04 fixture changeover alignment delay',
      impactMinutes: 12,
      engineer: 'Suresh Patil (Process Tooling)',
      action: 'Pneumatic clamp realigned and verified with dial gauge',
      engines: ['N/A (Station Idle)']
    },
    'Other': {
      dept: 'Workforce & Administration',
      route: '/workforce',
      icon: AlertTriangle,
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      rootCause: 'Operator rotation and station skill matrix reassignment',
      impactMinutes: 8,
      engineer: 'M. Verma (Shift Incharge)',
      action: 'Shift handover briefing completed',
      engines: ['N/A']
    }
  };

  const paretoData = dbData.pareto && dbData.pareto.length > 0 ? dbData.pareto : [
    { reason: 'Preventive maintenance', count: 1, duration: 237, cumPercent: 23 },
    { reason: 'Line changeover', count: 1, duration: 219, cumPercent: 44 },
    { reason: 'Power', count: 1, duration: 204, cumPercent: 64 },
    { reason: 'Failure', count: 1, duration: 192, cumPercent: 83 },
    { reason: 'Conveyor jam', count: 1, duration: 180, cumPercent: 100 },
  ];

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
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: activeLine, onChange: setActiveLine },
          { type: 'dropdown', label: 'Model Family', options: filterOptions.modelFamilies, value: activeModel, onChange: setActiveModel }
        ]}
      />

      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Total Production"
            value={totalProd}
            trend={`${totalPlan > 0 ? ((totalProd / totalPlan) * 100).toFixed(1) : 100}%`}
            trendLabel="Target Reached"
            sub={`Planned: ${totalPlan.toLocaleString()} units`}
            color="blue"
          />
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Production Shortfall"
            value={shortfall}
            trend={shortfall > 0 ? `-${totalPlan > 0 ? ((shortfall / totalPlan) * 100).toFixed(1) : 0}%` : '0%'}
            trendLabel="of Plan"
            sub="Variance from Target"
            color="red"
          />
          <StatCard
            period={typeof period !== "undefined" ? period : "Month"}
            title="Current WIP Buffer"
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
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                Click bar for root cause
              </span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <ComposedChart
                  data={paretoData}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      setSelectedLoss(e.activePayload[0].payload.reason);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Loss Count" fill="#f59e0b">
                    {paretoData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedLoss === entry.reason ? '#0284c7' : '#f59e0b'}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="cumPercent" name="Cumulative %" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Shortfall Root Cause Drilldown Drawer / Card */}
        {selectedLoss && lossDetailsMap[selectedLoss] && (
          <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-700 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    Root Cause Incident: {selectedLoss}
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${lossDetailsMap[selectedLoss].badge}`}>
                      {lossDetailsMap[selectedLoss].dept}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Impact: <span className="text-amber-400 font-bold">{lossDetailsMap[selectedLoss].impactMinutes} mins line downtime</span> • Assigned to: {lossDetailsMap[selectedLoss].engineer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoss(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Diagnosed Root Cause</span>
                <p className="text-slate-200 font-medium leading-relaxed bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  {lossDetailsMap[selectedLoss].rootCause}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corrective Action Taken</span>
                <p className="text-slate-200 font-medium leading-relaxed bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  {lossDetailsMap[selectedLoss].action}
                </p>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Affected Engine Barcodes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {lossDetailsMap[selectedLoss].engines.map((eng, i) => (
                      <span key={i} className="font-mono text-[11px] bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                        {eng}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={lossDetailsMap[selectedLoss].route}
                  className="inline-flex items-center justify-center gap-1.5 mt-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-1.5 px-3 rounded transition-colors text-[11px]"
                >
                  Inspect in {lossDetailsMap[selectedLoss].dept.split(' ')[0]} Module
                  <ArrowRight className="w-3 h-3" />
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














