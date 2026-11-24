import React, { useState, useMemo, useEffect, useRef } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Boxes,
  Truck,
  Warehouse,
  Factory,
  Layers,
  ShieldAlert,
  XCircle,
  Search,
  ChevronDown,
  Info,
  Check,
  Lock,
  ArrowUpDown
} from 'lucide-react';

// ==========================================
// SMART SEARCHABLE PART COMBOBOX
// ==========================================
function SmartPartCombobox({ parts, selectedPartId, onSelectPart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return parts;
    const q = searchQuery.toLowerCase();
    return parts.filter(
      p =>
        (p.partId && p.partId.toLowerCase().includes(q)) ||
        (p.partName && p.partName.toLowerCase().includes(q))
    );
  }, [parts, searchQuery]);

  const selectedPart = useMemo(() => {
    return parts.find(p => p.partId === selectedPartId) || parts[0];
  }, [parts, selectedPartId]);

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1 min-w-[240px]">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none flex items-center justify-between">
        <span>Part (Smart Search)</span>
        <span className="text-[9px] text-[#0369a1] font-semibold lowercase">no 'all'</span>
      </span>

      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded px-2.5 h-[31px] focus:outline-none focus:ring-1 focus:ring-[#0369a1] flex items-center justify-between gap-2 shadow-xs hover:bg-slate-100 transition-colors text-left"
      >
        <span className="truncate">
          {selectedPart ? (
            <span className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-[11px] text-[#0369a1] font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                {selectedPart.partId}
              </span>
              <span className="truncate text-slate-700">{selectedPart.partName}</span>
            </span>
          ) : (
            <span className="text-slate-400 font-normal">Select Part...</span>
          )}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-[52px] left-0 z-50 w-[340px] bg-white border border-slate-200 rounded-lg shadow-xl p-2 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search part ID or description..."
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0369a1] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-semibold">
            <span>{filteredParts.length} parts found</span>
            <span>Click to select</span>
          </div>

          <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 divide-y divide-slate-100">
            {filteredParts.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">No matching parts</div>
            ) : (
              filteredParts.map(p => {
                const isSelected = p.partId === selectedPartId;
                return (
                  <button
                    key={p.partId}
                    type="button"
                    onClick={() => {
                      onSelectPart(p.partId);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`p-2 text-left rounded flex items-center justify-between gap-2 transition-colors ${
                      isSelected ? 'bg-blue-50 text-[#0369a1]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">{p.partId}</span>
                        {p.partLevel && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold">
                            L{p.partLevel}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate">{p.partName}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#0369a1] flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN MATERIAL STOCK COMPONENT
// ==========================================
export default function StockStatusReport() {
  const [sku, setSku] = useState('All');
  const [partLevel, setPartLevel] = useState('All');
  const [partId, setPartId] = useState('PD551086');
  const [vendor, setVendor] = useState('All');
  const [location, setLocation] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [showHoldPopover, setShowHoldPopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Fetch Material Stock data
  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sku) params.append('sku', sku);
    if (partLevel) params.append('partLevel', partLevel);
    if (partId) params.append('partId', partId);
    if (vendor) params.append('vendor', vendor);
    if (location) params.append('location', location);

    fetch(`/api/material/stock?${params.toString()}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        // If current partId is not in the list, set to first available part
        if (resData?.filterOptions?.parts?.length > 0) {
          const exists = resData.filterOptions.parts.some(p => p.partId === partId);
          if (!exists) {
            setPartId(resData.filterOptions.parts[0].partId);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching material stock:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [sku, partLevel, partId, vendor, location]);

  const kpis = data?.kpis || {
    selectedPartId: partId,
    selectedPartName: '',
    incoming: 0,
    inStore: 0,
    onLineC: 0,
    lineSide: 0,
    totalHold: 0,
    totalRejected: 0,
    unallocatedStock: 0,
    batchWiseHold: []
  };

  const stockByLocation = data?.stockByLocation || [];
  const top5Parts = data?.top5Parts || [];
  const rawTable = data?.table || [];
  const filterOptions = data?.filterOptions || {
    skus: [],
    partLevels: ['All', '1', '2', '3'],
    parts: [],
    vendors: [],
    locations: [],
    liveShift: { shift: 'Shift 1', timeRange: '06:00 - 14:00' }
  };

  // Filter Section 4 Table by search input
  const tableData = useMemo(() => {
    if (!tableSearch.trim()) return rawTable;
    const q = tableSearch.toLowerCase();
    return rawTable.filter(
      r =>
        (r.partId && r.partId.toLowerCase().includes(q)) ||
        (r.partName && r.partName.toLowerCase().includes(q)) ||
        (r.vendorName && r.vendorName.toLowerCase().includes(q))
    );
  }, [rawTable, tableSearch]);

  // Excel Export
  const handleExportExcel = () => {
    const kpiRows = [
      ['Material Stock Summary', ''],
      ['Selected Part ID', kpis.selectedPartId],
      ['Selected Part Name', kpis.selectedPartName],
      ['Incoming Qty (not yet stored)', kpis.incoming],
      ['In Store Qty', kpis.inStore],
      ['On Line C (rack + kit + line + lineside)', kpis.onLineC],
      ['LineSide Stock', kpis.lineSide],
      ['Total on Hold', kpis.totalHold],
      ['Total Rejected', kpis.totalRejected],
      ['Unallocated / Blocked Stock', kpis.unallocatedStock]
    ];

    const locationRows = [
      ['Location', 'OK Qty', 'Hold Qty', 'Total Qty'],
      ...stockByLocation.map(l => [l.location, l.ok, l.hold, l.ok + l.hold])
    ];

    const partRows = [
      [
        'Part ID',
        'Part Name',
        'Part Level',
        'Vendor Name',
        'Incoming Qty',
        'Store Qty',
        'KitRack Qty',
        'Line Qty',
        'Lineside Qty',
        'Hold Qty',
        'Total Qty'
      ],
      ...rawTable.map(r => [
        r.partId,
        r.partName,
        r.partLevel,
        r.vendorName,
        r.incomingQty,
        r.storeQty,
        r.kitRackQty,
        r.lineQty,
        r.linesideQty,
        r.holdQty,
        r.totalQty
      ])
    ];

    const batchHoldRows = [
      ['Batch ID', 'Part ID', 'Vendor', 'Location / Area', 'Hold Qty', 'Rejected Qty', 'Status', 'Reason'],
      ...(kpis.batchWiseHold || []).map(b => [
        b.BatchID,
        b.PartID,
        b.VendorName,
        b.AreaName,
        b.BatchQty,
        b.RejectedQty,
        b.StatusDesc,
        b.Reason
      ])
    ];

    exportToXLSX('Material_Stock_Report.xlsx', [
      { name: 'KPI Summary', rows: kpiRows },
      { name: 'Stock by Location', rows: locationRows },
      { name: 'Stock by Part', rows: partRows },
      { name: 'Batch Hold Details', rows: batchHoldRows }
    ]);
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'Part',
      accessor: 'partId',
      render: (val, row) => {
        const isCurrentActive = row.partId === partId;
        return (
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setPartId(row.partId)}
            title="Click to view KPI & charts for this part"
          >
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded font-bold transition-colors ${
                isCurrentActive
                  ? 'bg-[#0369a1] text-white'
                  : 'bg-slate-100 text-slate-800 group-hover:bg-blue-100 group-hover:text-[#0369a1]'
              }`}
            >
              {row.partId}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#0369a1]">
                {row.partName}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>Level {row.partLevel}</span>
                <span>•</span>
                <span className="truncate">{row.vendorName}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Incoming Qty',
      accessor: 'incomingQty',
      align: 'right',
      render: val => <span className="text-xs font-semibold text-slate-700">{(val || 0).toLocaleString()}</span>
    },
    {
      header: 'Store Qty',
      accessor: 'storeQty',
      align: 'right',
      render: val => <span className="text-xs font-semibold text-emerald-700">{(val || 0).toLocaleString()}</span>
    },
    {
      header: 'KitRack Qty',
      accessor: 'kitRackQty',
      align: 'right',
      render: val => <span className="text-xs font-semibold text-slate-700">{(val || 0).toLocaleString()}</span>
    },
    {
      header: 'Line Qty',
      accessor: 'lineQty',
      align: 'right',
      render: val => <span className="text-xs font-semibold text-slate-700">{(val || 0).toLocaleString()}</span>
    },
    {
      header: 'Lineside Qty',
      accessor: 'linesideQty',
      align: 'right',
      render: val => <span className="text-xs font-semibold text-purple-700">{(val || 0).toLocaleString()}</span>
    },
    {
      header: 'Hold Qty',
      accessor: 'holdQty',
      align: 'right',
      render: val => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            val > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-slate-400'
          }`}
        >
          {(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Total Qty',
      accessor: 'totalQty',
      align: 'right',
      render: val => <span className="text-xs font-black text-slate-900">{(val || 0).toLocaleString()}</span>
    }
  ];

  // Filters configuration for StandardFilterBar
  const filters = [
    {
      type: 'dropdown',
      label: 'SKU',
      value: sku,
      options: ['All', ...filterOptions.skus.map(s => s.value)],
      onChange: setSku
    },
    {
      type: 'dropdown',
      label: 'Part Level',
      value: partLevel,
      options: filterOptions.partLevels,
      onChange: setPartLevel
    },
    {
      type: 'custom',
      render: () => (
        <SmartPartCombobox
          parts={filterOptions.parts}
          selectedPartId={partId}
          onSelectPart={selectedId => setPartId(selectedId)}
        />
      )
    },
    {
      type: 'dropdown',
      label: 'Vendor',
      value: vendor,
      options: ['All', ...filterOptions.vendors.map(v => v.value)],
      onChange: setVendor
    },
    {
      type: 'dropdown',
      label: 'Location',
      value: location,
      options: filterOptions.locations,
      onChange: setLocation
    }
  ];

  return (
    <div className="pb-6 max-w-[1600px] mx-auto px-2 flex flex-col gap-3.5 h-full">
      {/* ========================================================= */}
      {/* SECTION 1: FILTER BAR & CONTROLS                          */}
      {/* ========================================================= */}
      <StandardFilterBar
        title="Material Stock"
        icon={Boxes}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={filters}
        extraActions={
          kpis.unallocatedStock > 0 && (
            <div
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded shadow-xs"
              title="Blocked / Quarantine inventory in batch-wise quantities"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Unallocated Stock: {kpis.unallocatedStock} units</span>
            </div>
          )
        }
      />

      {/* Active Part Info Strip */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Focused Part:</span>
          <span className="font-mono text-xs font-black text-[#0369a1] bg-white px-2 py-0.5 rounded border border-blue-200">
            {kpis.selectedPartId || partId}
          </span>
          <span className="text-xs font-bold text-slate-800">
            {kpis.selectedPartName || filterOptions.parts.find(p => p.partId === partId)?.partName || 'Selected Part'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span>Click any row in the table below to inspect that part's stock & batch breakdown</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: KPI METRIC CARDS (6 CARDS)                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Incoming (not yet stored) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
              Incoming <span className="font-normal lowercase text-[10px] text-slate-400 block">(not yet stored)</span>
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-none mb-1">
              {(kpis.incoming || 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
              In Receiving Staging
            </span>
          </div>
        </div>

        {/* Card 2: In store */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
              In Store
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 leading-none mb-1">
              {(kpis.inStore || 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              Warehouse Main Store
            </span>
          </div>
        </div>

        {/* Card 3: On Line C (rack + kit + line + lineside) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
              On Line C <span className="font-normal lowercase text-[10px] text-slate-400 block">(rack+kit+line+lineside)</span>
            </span>
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-700 leading-none mb-1">
              {(kpis.onLineC || 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
              Line C Total WIP
            </span>
          </div>
        </div>

        {/* Card 4: LineSide (Shown separately as requested) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
              LineSide Stock
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-700 leading-none mb-1">
              {(kpis.lineSide || 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
              Line C & D Buffer
            </span>
          </div>
        </div>

        {/* Card 5: Total on hold (with hover popover showing batch wise hold qty) */}
        <div
          className="relative bg-white border border-amber-200 rounded-lg p-3.5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between cursor-pointer"
          onMouseEnter={() => setShowHoldPopover(true)}
          onMouseLeave={() => setShowHoldPopover(false)}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider leading-tight flex items-center gap-1">
              <span>Total on Hold</span>
              <Info className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 leading-none mb-1">
              {(kpis.totalHold || 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block">
              Hover for Batch Details
            </span>
          </div>

          {/* HOVER POPOVER FOR BATCH-WISE HOLD DETAILS */}
          {showHoldPopover && (
            <div className="absolute bottom-[calc(100%+8px)] right-0 md:left-0 z-50 w-[380px] bg-white border border-amber-300 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-slate-800">
                    Batch-Wise Hold Breakdown ({partId})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Total Hold: {kpis.totalHold}
                </span>
              </div>

              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                {(!kpis.batchWiseHold || kpis.batchWiseHold.length === 0) ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No active hold batches for {partId}
                  </div>
                ) : (
                  kpis.batchWiseHold.map((b, idx) => (
                    <div key={idx} className="py-2 text-xs flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#0369a1]">{b.BatchID}</span>
                        <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {b.BatchQty} units
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center justify-between">
                        <span>{b.AreaName || 'Central Staging'}</span>
                        <span className="font-semibold text-slate-500">{b.VendorName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Reason: {b.Reason || b.StatusDesc || 'Quality Quarantine'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card 6: Total rejected */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
              Total Rejected
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 leading-none mb-1">
              {(kpis.totalRejected || 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              IQC & Line Scrapped
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: VISUALIZATIONS (2 CHARTS)                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Left Chart: Stock by location (OK vs Hold) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Stock by location (OK vs Hold)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Comparing available good stock against hold quantities for {partId}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              5 Locations
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByLocation} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="location" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs">
                          <p className="font-bold text-slate-800 mb-1">{label}</p>
                          <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
                            <span>OK Stock:</span>
                            <span>{(payload[0]?.value || 0).toLocaleString()} units</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-amber-600 font-semibold">
                            <span>Hold Stock:</span>
                            <span>{(payload[1]?.value || 0).toLocaleString()} units</span>
                          </div>
                          <div className="border-t border-slate-100 mt-1 pt-1 flex items-center justify-between gap-4 font-black text-slate-900">
                            <span>Total:</span>
                            <span>
                              {((payload[0]?.value || 0) + (payload[1]?.value || 0)).toLocaleString()} units
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="ok" name="OK Stock" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hold" name="Hold Stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Top 5 parts by total stock */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top 5 parts by total stock
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Highest inventory volume across all plant locations
              </p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-[#0369a1] px-2 py-0.5 rounded border border-blue-200">
              Plant Ranking
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5Parts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="partId" tick={{ fontSize: 11, fontWeight: 700, fill: '#0369a1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs">
                          <p className="font-bold text-slate-900 mb-0.5">{d.partId}</p>
                          <p className="text-[11px] text-slate-500 mb-2 truncate max-w-[200px]">{d.partName}</p>
                          <div className="flex flex-col gap-0.5 text-[11px]">
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">Total Stock:</span>
                              <span className="font-bold text-slate-900">{(d.totalStock || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">Incoming:</span>
                              <span className="font-semibold text-blue-600">{(d.incoming || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">Store:</span>
                              <span className="font-semibold text-emerald-600">{(d.store || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">Line & Lineside:</span>
                              <span className="font-semibold text-purple-600">
                                {((d.line || 0) + (d.lineSide || 0)).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">Hold:</span>
                              <span className="font-semibold text-amber-600">{(d.hold || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="totalStock"
                  name="Total Stock (All Locations)"
                  fill="#0369a1"
                  radius={[4, 4, 0, 0]}
                  onClick={dataPoint => {
                    if (dataPoint?.partId) setPartId(dataPoint.partId);
                  }}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: TABLE (STOCK BY PART)                          */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Stock by part</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {tableData.length} records
            </span>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Filter table parts..."
              className="w-full pl-8 pr-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0369a1] font-medium"
            />
            {tableSearch && (
              <button
                type="button"
                onClick={() => setTableSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  );
}
