import React, { useState, useMemo, useEffect } from 'react';
import { 
  RotateCcw, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  History, 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  ExternalLink,
  X,
  Filter,
  Package,
  Wrench,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useFilterOptions from '../../hooks/useFilterOptions';

const STATUS_FILTER_OPTIONS = [
  'All',
  'Total Hold',
  'Quality Hold',
  'Production Hold',
  'Total Hold Cleared',
  'Quality Hold Cleared',
  'Production Hold Cleared',
  'Total Rework',
  'Total Rework OK',
  'Total Rework NOK/Scrapped'
];

export default function ReworkStatusReport() {
  const filterOptions = useFilterOptions();

  // Floor WIP Filters (No history date picker - live shift floor view)
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [status, setStatus] = useState('All');
  const [selectedSubAssly, setSelectedSubAssly] = useState('All');
  const [wipScope, setWipScope] = useState('all'); // 'all' | 'engine' | 'sa'
  const [breakdownView, setBreakdownView] = useState('assemblies'); // 'assemblies' | 'skus'

  // Search filter inside tables
  const [engineSearch, setEngineSearch] = useState('');
  const [saSearch, setSaSearch] = useState('');

  // Modals state
  const [showHoldDrilldown, setShowHoldDrilldown] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null); // { serialNo, type: 'engine' | 'sa', currentStatus }
  const [genealogyHistory, setGenealogyHistory] = useState([]);
  const [loadingGenealogy, setLoadingGenealogy] = useState(false);
  const [genealogyMessage, setGenealogyMessage] = useState(null);
  const [updateStatusCode, setUpdateStatusCode] = useState('15'); // default: Prod Rework OK
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Main report data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch report data
  const fetchData = () => {
    setLoading(true);
    const query = new URLSearchParams({
      line: line || 'All',
      model: model || 'All',
      sku: sku || 'All',
      status: status || 'All',
      scope: wipScope
    });

    fetch(`/api/trace/rework-summary?${query.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rework summary:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [line, model, sku, status, wipScope]);

  // Open Status Genealogy modal
  const handleOpenGenealogy = (serialNo, type, currentStatus) => {
    setSelectedSerial({ serialNo, type, currentStatus });
    setGenealogyHistory([]);
    setGenealogyMessage(null);
    setLoadingGenealogy(true);

    fetch(`/api/trace/status-geneology?serialNo=${encodeURIComponent(serialNo)}`)
      .then(res => res.json())
      .then(json => {
        setGenealogyHistory(json.history || []);
        setLoadingGenealogy(false);
      })
      .catch(err => {
        console.error('Error loading genealogy:', err);
        setLoadingGenealogy(false);
      });
  };

  // Perform Status Genealogy update
  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedSerial) return;

    setIsUpdatingStatus(true);
    setGenealogyMessage(null);

    fetch('/api/trace/status-geneology/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNo: selectedSerial.serialNo,
        type: selectedSerial.type,
        statusCode: parseInt(updateStatusCode, 10),
        prodShift: data?.liveShift?.shift || 'A'
      })
    })
      .then(res => res.json())
      .then(result => {
        setIsUpdatingStatus(false);
        if (result.success) {
          setGenealogyMessage({ type: 'success', text: result.message });
          // Refresh genealogy history
          fetch(`/api/trace/status-geneology?serialNo=${encodeURIComponent(selectedSerial.serialNo)}`)
            .then(res => res.json())
            .then(json => setGenealogyHistory(json.history || []));
          // Refresh main report data
          fetchData();
        } else {
          setGenealogyMessage({ type: 'error', text: result.error || 'Update failed' });
        }
      })
      .catch(err => {
        setIsUpdatingStatus(false);
        setGenealogyMessage({ type: 'error', text: err.message });
      });
  };

  // KPIs
  const kpis = data?.kpis || {
    totalHold: 0,
    qualityHold: 0,
    prodHold: 0,
    totalHoldCleared: 0,
    qualityCleared: 0,
    prodCleared: 0,
    totalRework: 0,
    totalReworkOk: 0,
    totalReworkNok: 0
  };

  const liveShift = data?.liveShift || { shift: 'Shift A', timeRange: '06:00 - 14:30', isActive: true };

  // Engine Details Table
  const rawEngines = data?.engineDetails || [];
  const filteredEngines = useMemo(() => {
    if (!engineSearch.trim()) return rawEngines;
    const term = engineSearch.toLowerCase();
    return rawEngines.filter(r => 
      (r.engineNo && r.engineNo.toLowerCase().includes(term)) ||
      (r.planId && String(r.planId).includes(term)) ||
      (r.skuName && r.skuName.toLowerCase().includes(term)) ||
      (r.lineName && r.lineName.toLowerCase().includes(term)) ||
      (r.status && r.status.toLowerCase().includes(term))
    );
  }, [rawEngines, engineSearch]);

  // SA Details Table
  const rawSAs = data?.saDetails || [];
  const filteredSAs = useMemo(() => {
    let result = rawSAs;
    if (selectedSubAssly && selectedSubAssly !== 'All') {
      result = result.filter(r => 
        (r.subAsslyLineName && r.subAsslyLineName.toLowerCase().includes(selectedSubAssly.toLowerCase())) ||
        String(r.subAsslyLineId) === String(selectedSubAssly)
      );
    }
    if (saSearch.trim()) {
      const term = saSearch.toLowerCase();
      result = result.filter(r => 
        (r.saSerialNo && r.saSerialNo.toLowerCase().includes(term)) ||
        (r.subAsslyLineName && r.subAsslyLineName.toLowerCase().includes(term)) ||
        (r.planId && String(r.planId).includes(term)) ||
        (r.skuName && r.skuName.toLowerCase().includes(term)) ||
        (r.lineName && r.lineName.toLowerCase().includes(term)) ||
        (r.status && r.status.toLowerCase().includes(term))
      );
    }
    return result;
  }, [rawSAs, saSearch, selectedSubAssly]);

  // Hold Drilldown
  const holdDrilldown = data?.holdDrilldown || [];

  // Status Badge Helper
  const getStatusBadge = (statusName, category) => {
    const s = String(statusName || '').toLowerCase();
    const c = String(category || '').toLowerCase();

    if (c.includes('ok') || s.includes('ok') || s.includes('cleared')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/40';
    }
    if (c.includes('rework') || s.includes('rework')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40';
    }
    if (c.includes('hold') || s.includes('hold')) {
      return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-300/40';
    }
    if (c.includes('scrapped') || c.includes('nok') || s.includes('rejected') || s.includes('scrapped')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-300/40';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Engine Columns
  const engineColumns = [
    { 
      header: 'Engine No', 
      accessor: 'engineNo',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-semibold text-brand-dark">
          <span>{val}</span>
          <button 
            onClick={() => handleOpenGenealogy(val, 'engine', row.status)}
            title="Inspect Status Genealogy"
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    { header: 'Plan ID', accessor: 'planId' },
    { header: 'Line Name', accessor: 'lineName' },
    { header: 'SKU Name', accessor: 'skuName' },
    { header: 'Start Time', accessor: 'startTime' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(val, row.category)}`}>
          {val}
        </span>
      )
    },
    {
      header: 'Genealogy',
      accessor: 'engineNo',
      render: (val, row) => (
        <button
          onClick={() => handleOpenGenealogy(val, 'engine', row.status)}
          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded border border-indigo-200 flex items-center gap-1 transition"
        >
          <History className="w-3 h-3" />
          Trace
        </button>
      )
    }
  ];

  // SA Columns
  const saColumns = [
    { 
      header: 'SA Serial No', 
      accessor: 'saSerialNo',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-semibold text-brand-dark">
          <span>{val}</span>
          <button 
            onClick={() => handleOpenGenealogy(val, 'sa', row.status)}
            title="Inspect Status Genealogy"
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    { 
      header: 'Sub-Assembly Line', 
      accessor: 'subAsslyLineName',
      render: (val, row) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          {val} (Line {row.subAsslyLineId})
        </span>
      )
    },
    { header: 'Plan ID', accessor: 'planId' },
    { header: 'Line Name', accessor: 'lineName' },
    { header: 'SKU Name', accessor: 'skuName' },
    { header: 'Start Time', accessor: 'startTime' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val, row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(val, row.category)}`}>
          {val}
        </span>
      )
    },
    {
      header: 'Genealogy',
      accessor: 'saSerialNo',
      render: (val, row) => (
        <button
          onClick={() => handleOpenGenealogy(val, 'sa', row.status)}
          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded border border-indigo-200 flex items-center gap-1 transition"
        >
          <History className="w-3 h-3" />
          Trace
        </button>
      )
    }
  ];

  // Excel Export
  const exportToExcel = () => {
    exportToXLSX('Rework_Summary_Report.xlsx', [
      {
        name: 'KPI Summary',
        rows: [
          ['Metric', 'Total Count', 'Breakdown 1', 'Breakdown 2'],
          ['Total Hold', kpis.totalHold, `Quality Hold: ${kpis.qualityHold}`, `Production Hold: ${kpis.prodHold}`],
          ['Total Hold Cleared', kpis.totalHoldCleared, `Quality Cleared: ${kpis.qualityCleared}`, `Production Cleared: ${kpis.prodCleared}`],
          ['Total Rework', kpis.totalRework, 'In Rework (Prod/IPQC/FQC)', '-'],
          ['Total Rework OK', kpis.totalReworkOk, 'Passed Quality Gate', '-'],
          ['Total Rework NOK / Scrapped', kpis.totalReworkNok, 'Scrapped & Rejected', '-']
        ]
      },
      {
        name: 'Engine Details',
        rows: [
          ['Engine No', 'Plan ID', 'Line Name', 'SKU Name', 'Start Time', 'Status', 'Category'],
          ...rawEngines.map(r => [r.engineNo, r.planId, r.lineName, r.skuName, r.startTime, r.status, r.category])
        ]
      },
      {
        name: 'SA Details',
        rows: [
          ['SA Serial No', 'Sub-Assembly Line', 'SubAsslyLineID', 'Plan ID', 'Line Name', 'SKU Name', 'Start Time', 'Status', 'Category'],
          ...rawSAs.map(r => [r.saSerialNo, r.subAsslyLineName, r.subAsslyLineId, r.planId, r.lineName, r.skuName, r.startTime, r.status, r.category])
        ]
      },
      {
        name: 'Hold Drilldown',
        rows: [
          ['Ticket ID', 'Part ID', 'Part Name', 'Batch ID', 'Hold Type', 'Plan ID', 'Forward Qty', 'Backward Qty', 'OK Qty', 'Rejected Qty', 'Status'],
          ...holdDrilldown.map(h => [h.ticketId, h.partId || '-', h.partName, h.partBatchId || '-', h.holdType, h.planId || '-', h.forwardQty, h.backwordQty, h.okQty, h.rejectedQty, h.status])
        ]
      }
    ]);
  };

  // Dynamic Sub-Assembly options from API
  const subAsslyOptions = useMemo(() => {
    const list = (data?.cards?.subAssemblies || []).map(s => s.name);
    return ['All', ...list];
  }, [data]);

  // Custom filters for StandardFilterBar
  const customFilters = [
    { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine },
    { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
    { type: 'dropdown', label: 'SKU', options: filterOptions.skus, value: sku, onChange: setSku },
    { type: 'dropdown', label: 'Status', options: STATUS_FILTER_OPTIONS, value: status, onChange: setStatus },
    { type: 'dropdown', label: 'Sub-Assembly', options: subAsslyOptions, value: selectedSubAssly, onChange: setSelectedSubAssly }
  ];

  return (
    <div className="pb-6 max-w-[1700px] mx-auto px-1 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: StandardFilterBar with Live Shift Indicator */}
      <div className="relative">
        <StandardFilterBar
          title="Rework Summary Report"
          icon={RotateCcw}
          onExcelClick={exportToExcel}
          filters={customFilters}
        />
        {/* Live Shift Badge */}
        <div className="absolute right-28 top-3 hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300/60 rounded-full text-xs font-semibold text-emerald-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Shift: {liveShift.shift}</span>
          <span className="text-emerald-600/70 font-normal">({liveShift.timeRange})</span>
        </div>
      </div>

      {/* SECTION 2: 5 Main KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Card 1: Total Hold */}
        <div 
          onClick={() => { setStatus('Total Hold'); setShowHoldDrilldown(true); }}
          className="cursor-pointer bg-white rounded-xl border border-orange-200/80 p-3.5 shadow-xs hover:border-orange-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-orange-600 transition">
              Total Hold
            </span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{kpis.totalHold}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-600 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-orange-100/70 text-orange-800">
              Quality Hold: {kpis.qualityHold}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800">
              Prod Hold: {kpis.prodHold}
            </span>
          </div>
        </div>

        {/* Card 2: Total Hold Cleared */}
        <div 
          onClick={() => setStatus('Total Hold Cleared')}
          className="cursor-pointer bg-white rounded-xl border border-emerald-200/80 p-3.5 shadow-xs hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition">
              Total Hold Cleared
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{kpis.totalHoldCleared}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-600 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
              Quality: {kpis.qualityCleared}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-teal-100/70 text-teal-800">
              Prod: {kpis.prodCleared}
            </span>
          </div>
        </div>

        {/* Card 3: Total Rework */}
        <div 
          onClick={() => setStatus('Total Rework')}
          className="cursor-pointer bg-white rounded-xl border border-amber-200/80 p-3.5 shadow-xs hover:border-amber-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition">
              Total Rework
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{kpis.totalRework}</div>
          <div className="mt-2 text-[11px] text-slate-500">
            In Rework (Prod / IPQC / FQC)
          </div>
        </div>

        {/* Card 4: Total Rework Ok */}
        <div 
          onClick={() => setStatus('Total Rework OK')}
          className="cursor-pointer bg-white rounded-xl border border-blue-200/80 p-3.5 shadow-xs hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition">
              Total Rework Ok
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{kpis.totalReworkOk}</div>
          <div className="mt-2 text-[11px] text-slate-500">
            Rework OK & Released
          </div>
        </div>

        {/* Card 5: Total Rework NOK / Scrapped */}
        <div 
          onClick={() => setStatus('Total Rework NOK/Scrapped')}
          className="cursor-pointer bg-white rounded-xl border border-rose-200/80 p-3.5 shadow-xs hover:border-rose-400 hover:shadow-md transition group col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-rose-600 transition">
              Total Rework NOK / Scrapped
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{kpis.totalReworkNok}</div>
          <div className="mt-2 text-[11px] text-slate-500">
            Scrapped & Rejected Units
          </div>
        </div>
      </div>

      {/* Assembly & SKU Breakdown Cards Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Floor Summary Cards (Main Engine & Sub-Assemblies)
            </h3>
            {data?.cards?.subAssemblies && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                {data.cards.subAssemblies.length} Sub-Assemblies Configured
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setBreakdownView('assemblies')}
              className={`px-2.5 py-1 rounded-md transition ${breakdownView === 'assemblies' ? 'bg-white text-brand-dark shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              By Assembly Line ({data?.cards?.subAssemblies?.length || 0})
            </button>
            <button
              onClick={() => setBreakdownView('skus')}
              className={`px-2.5 py-1 rounded-md transition ${breakdownView === 'skus' ? 'bg-white text-brand-dark shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Individual Cards for Each SKU ({data?.cards?.skus?.length || 0})
            </button>
          </div>
        </div>

        {breakdownView === 'assemblies' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {/* Main Engine Card */}
            {data?.cards?.mainEngine && (
              <div 
                onClick={() => setWipScope(wipScope === 'engine' ? 'all' : 'engine')}
                className={`cursor-pointer p-3 rounded-lg border transition flex flex-col justify-between group ${wipScope === 'engine' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white hover:border-indigo-400 hover:shadow-xs'}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-600 transition">Main Engine</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded font-semibold">Engine</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Total: {data.cards.mainEngine.totalUnits} Units</div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-indigo-100 text-[11px]">
                  <div className="text-orange-700 font-medium">Hold: <b className="text-slate-800">{data.cards.mainEngine.totalHold}</b></div>
                  <div className="text-amber-700 font-medium">Rework: <b className="text-slate-800">{data.cards.mainEngine.totalRework}</b></div>
                  <div className="text-emerald-700 font-medium">Rework OK: <b className="text-slate-800">{data.cards.mainEngine.reworkOk}</b></div>
                  <div className="text-rose-700 font-medium">Scrapped: <b className="text-slate-800">{data.cards.mainEngine.scrapped}</b></div>
                </div>
              </div>
            )}

            {/* Sub-Assembly Cards (100% Dynamic from Config_SubAssemblyLine) */}
            {data?.cards?.subAssemblies?.map((sa, idx) => {
              const isSelected = selectedSubAssly === sa.name;
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSubAssly('All');
                    } else {
                      setSelectedSubAssly(sa.name);
                      setWipScope('sa');
                    }
                  }}
                  className={`cursor-pointer p-3 rounded-lg border transition flex flex-col justify-between group ${isSelected ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-200 shadow-xs' : 'border-slate-200 bg-white hover:border-cyan-400 hover:shadow-xs'}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 truncate group-hover:text-cyan-700 transition" title={sa.name}>{sa.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold shrink-0">Line {sa.lineId || sa.subAsslyLineId}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Active: <b className="text-slate-800">{sa.totalUnits}</b> Units
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="text-orange-700 font-medium">Hold: <b className="text-slate-800">{sa.totalHold}</b></div>
                    <div className="text-amber-700 font-medium">Rework: <b className="text-slate-800">{sa.totalRework}</b></div>
                    <div className="text-emerald-700 font-medium">Rework OK: <b className="text-slate-800">{sa.reworkOk}</b></div>
                    <div className="text-rose-700 font-medium">Scrapped: <b className="text-slate-800">{sa.scrapped}</b></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {data?.cards?.skus?.map((skuItem, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-purple-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark">{skuItem.skuName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded font-semibold">{skuItem.modelName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Total: {skuItem.totalUnits} Units</div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="text-orange-700 font-medium">Hold: <b className="text-slate-800">{skuItem.totalHold}</b></div>
                  <div className="text-amber-700 font-medium">Rework: <b className="text-slate-800">{skuItem.totalRework}</b></div>
                  <div className="text-emerald-700 font-medium">OK: <b className="text-slate-800">{skuItem.reworkOk}</b></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scope Selector: Both vs Engine WIP vs SA WIP */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">View Mode:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setWipScope('all')}
              className={`px-3 py-1 rounded-md transition ${wipScope === 'all' ? 'bg-brand-dark text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Both (Engine & SA Details)
            </button>
            <button
              onClick={() => setWipScope('engine')}
              className={`px-3 py-1 rounded-md transition ${wipScope === 'engine' ? 'bg-brand-dark text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Engine WIP Only ({filteredEngines.length})
            </button>
            <button
              onClick={() => setWipScope('sa')}
              className={`px-3 py-1 rounded-md transition ${wipScope === 'sa' ? 'bg-brand-dark text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              SA WIP Only ({filteredSAs.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              Filter: {status}
              <button onClick={() => setStatus('All')} className="hover:text-amber-950 font-bold ml-1">×</button>
            </span>
          )}
          <button
            onClick={() => setShowHoldDrilldown(true)}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 shadow-xs flex items-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Hold Drilldown ({holdDrilldown.length})
          </button>
        </div>
      </div>

      {/* SECTION 3: Tables (Engine Details & SA Details) */}
      <div className="flex flex-col gap-4">
        {/* Table 1: Engine Details */}
        {(wipScope === 'all' || wipScope === 'engine') && (
          <div className="card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-dark" />
                <h3 className="text-sm font-bold text-brand-dark">Engine Details</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {filteredEngines.length} records
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search engine no, SKU, plan..."
                    value={engineSearch}
                    onChange={(e) => setEngineSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark w-56"
                  />
                </div>
              </div>
            </div>

            <DataTable columns={engineColumns} data={filteredEngines} />
          </div>
        )}

        {/* Table 2: SA Details */}
        {(wipScope === 'all' || wipScope === 'sa') && (
          <div className="card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-brand-dark">SA Details (Sub-Assembly)</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {filteredSAs.length} records
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search SA serial, SKU, plan..."
                    value={saSearch}
                    onChange={(e) => setSaSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-600 w-56"
                  />
                </div>
              </div>
            </div>

            <DataTable columns={saColumns} data={filteredSAs} />
          </div>
        )}
      </div>

      {/* HOLD DRILLDOWN MODAL */}
      {showHoldDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-orange-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Hold Analysis & Drilldown Log</h3>
                  <p className="text-xs text-slate-500">Live components on Quality & Production Hold</p>
                </div>
              </div>
              <button
                onClick={() => setShowHoldDrilldown(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {holdDrilldown.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No active hold records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3">Ticket ID</th>
                        <th className="py-2.5 px-3">Part ID & Name</th>
                        <th className="py-2.5 px-3">Batch ID</th>
                        <th className="py-2.5 px-3">Hold Type</th>
                        <th className="py-2.5 px-3">Forward Qty</th>
                        <th className="py-2.5 px-3">Backward Qty</th>
                        <th className="py-2.5 px-3">OK / Rejected</th>
                        <th className="py-2.5 px-3">Hold Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {holdDrilldown.map((h, i) => (
                        <tr key={i} className="hover:bg-orange-50/30 transition">
                          <td className="py-2.5 px-3 font-bold text-brand-dark">TKT-{h.ticketId}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{h.partName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{h.partId || 'Engine Sub-Part'}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{h.partBatchId || '-'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.holdType.includes('Quality') ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'}`}>
                              {h.holdType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium">{h.forwardQty}</td>
                          <td className="py-2.5 px-3 font-medium">{h.backwordQty}</td>
                          <td className="py-2.5 px-3 font-medium">
                            <span className="text-emerald-700">{h.okQty} OK</span> / <span className="text-rose-700">{h.rejectedQty} NOK</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${h.status.includes('Active') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total Hold Entries: <b className="text-slate-800">{holdDrilldown.length}</b>
              </span>
              <button
                onClick={() => setShowHoldDrilldown(false)}
                className="px-4 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close Drilldown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS GENEALOGY INSPECTION & UPDATE MODAL */}
      {selectedSerial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Status Genealogy Trace</h3>
                  <p className="text-xs text-slate-500">
                    Serial: <b className="text-indigo-900 font-mono">{selectedSerial.serialNo}</b> ({selectedSerial.type === 'engine' ? 'Engine' : 'Sub-Assembly'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSerial(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              {genealogyMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${genealogyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {genealogyMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{genealogyMessage.text}</span>
                </div>
              )}

              {/* Status Genealogy Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Historical Status Audit Log (Prod_Status_Geneology)
                </h4>

                {loadingGenealogy ? (
                  <div className="text-center py-6 text-slate-400 text-xs">Loading genealogy history...</div>
                ) : genealogyHistory.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No genealogy records found for this serial.</div>
                ) : (
                  <div className="relative border-l-2 border-indigo-200 ml-3.5 pl-4 space-y-3">
                    {genealogyHistory.map((step, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200"></span>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 transition">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{step.statusName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-mono font-semibold">
                              Code {step.statusCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {step.timestamp}
                            </span>
                            <span>Shift {step.prodShift}</span>
                            <span>Date: {step.prodDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Status Update Form to Test Status Genealogy */}
              <div className="mt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Verify Status Genealogy Update (Live Floor Test)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select a new floor status to test and confirm real-time status recording into <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">Prod_Status_Geneology</code>:
                </p>

                <form onSubmit={handleUpdateStatus} className="flex items-center gap-2 flex-wrap">
                  <select
                    value={updateStatusCode}
                    onChange={(e) => setUpdateStatusCode(e.target.value)}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="15">Prod Rework OK (15)</option>
                    <option value="17">Prod Hold Cleared (17)</option>
                    <option value="13">Material Hold Cleared (13)</option>
                    <option value="20">IPQC Rework OK (20)</option>
                    <option value="22">IPQC Hold Cleared (22)</option>
                    <option value="25">FG Rework OK (25)</option>
                    <option value="27">FQC Hold Cleared (27)</option>
                    <option value="14">For Prod Rework (14)</option>
                    <option value="16">Prod Hold (16)</option>
                    <option value="18">Prod Rejected (18)</option>
                    <option value="28">FG Rejected / Scrapped (28)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Update & Verify Genealogy'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedSerial(null)}
                className="px-4 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
