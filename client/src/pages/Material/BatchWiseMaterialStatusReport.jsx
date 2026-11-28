import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import SmartPartCombobox from '../../components/SmartPartCombobox';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import { Layers, PackageCheck, Lock, Unlock, Search, Boxes } from 'lucide-react';

export default function BatchWiseMaterialStatusReport() {
  const [sku, setSku] = useState('All');
  const [partLevel, setPartLevel] = useState('All');
  const [partId, setPartId] = useState('All');
  const [vendor, setVendor] = useState('All');
  const [location, setLocation] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingUid, setTogglingUid] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({
      sku,
      partLevel,
      partId,
      vendor,
      location
    });
    fetch(`/api/material/batch-status?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Batch Wise Material Status fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [sku, partLevel, partId, vendor, location]);

  const handleToggleBlock = async (uid, currentBlocked) => {
    setTogglingUid(uid);
    try {
      const res = await fetch('/api/material/batch-status/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, block: !currentBlocked })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle batch block:', err);
    } finally {
      setTogglingUid(null);
    }
  };

  const kpis = data?.kpis || {
    availableBatches: 0,
    availableBatchesPartQty: 0,
    blockedBatchesCount: 0,
    blockedUnallocatedQty: 0
  };
  const rawTable = data?.table || [];
  const filterOptions = data?.filterOptions || {
    skus: [],
    partLevels: ['All', '1', '2', '3'],
    parts: [],
    vendors: [],
    locations: ['All']
  };

  const tableData = useMemo(() => {
    if (!tableSearch.trim()) return rawTable;
    const q = tableSearch.toLowerCase();
    return rawTable.filter(
      r =>
        (r.partId && r.partId.toLowerCase().includes(q)) ||
        (r.partName && r.partName.toLowerCase().includes(q)) ||
        (r.vendor && r.vendor.toLowerCase().includes(q)) ||
        (r.batch && r.batch.toLowerCase().includes(q)) ||
        (r.state && r.state.toLowerCase().includes(q))
    );
  }, [rawTable, tableSearch]);

  const handleExportExcel = () => {
    exportToXLSX(`Batch_Wise_Material_Status_${new Date().toISOString().split('T')[0]}.xlsx`, [
      {
        name: 'KPI Summary',
        rows: [
          ['Metric', 'Value'],
          ['Available batches', kpis.availableBatches],
          ['Available batches part qty', kpis.availableBatchesPartQty],
          ['Blocked batches count', kpis.blockedBatchesCount],
          ['Blocked / Unallocated qty', kpis.blockedUnallocatedQty]
        ]
      },
      {
        name: 'Batch List (FIFO)',
        rows: [
          ['Part ID', 'Part Name', 'Vendor', 'Batch', 'Priority', 'Open Qty', 'Used', 'Moved', 'Left', '% Used', 'State', 'Location'],
          ...tableData.map(r => [
            r.partId,
            r.partName,
            r.vendor,
            r.batch,
            r.priority,
            r.openQty,
            r.used,
            r.moved,
            r.left,
            `${r.pctUsed}%`,
            r.state,
            r.location
          ])
        ]
      }
    ]);
  };

  const columns = [
    {
      header: 'Part',
      accessor: 'partId',
      render: (val, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-[#0369a1] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {row.partId}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]" title={row.partName}>
              {row.partName}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{row.location}</span>
        </div>
      )
    },
    { header: 'Vendor', accessor: 'vendor' },
    {
      header: 'Batch',
      accessor: 'batch',
      render: val => <span className="font-mono text-xs font-bold text-slate-900">{val}</span>
    },
    {
      header: 'Priority',
      accessor: 'priority',
      align: 'center',
      render: val => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-black border border-slate-200">
          {val}
        </span>
      )
    },
    { header: 'Open Qty', accessor: 'openQty', align: 'right', render: v => (v || 0).toLocaleString() },
    { header: 'Used', accessor: 'used', align: 'right', render: v => (v || 0).toLocaleString() },
    { header: 'Moved', accessor: 'moved', align: 'right', render: v => (v || 0).toLocaleString() },
    {
      header: 'Left',
      accessor: 'left',
      align: 'right',
      render: v => <span className="font-black text-slate-900">{(v || 0).toLocaleString()}</span>
    },
    {
      header: '% used',
      accessor: 'pctUsed',
      render: val => (
        <div className="flex items-center gap-2 min-w-[90px]">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${val >= 80 ? 'bg-amber-500' : 'bg-[#0369a1]'}`}
              style={{ width: `${val || 0}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-700 w-8 text-right">{val || 0}%</span>
        </div>
      )
    },
    {
      header: 'State',
      accessor: 'state',
      align: 'center',
      render: (val, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
              val === 'Blocked / Hold'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : val === 'Running'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : val === 'Exhausted'
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-blue-50 text-[#0369a1] border-blue-200'
            }`}
          >
            {val}
          </span>
          <button
            type="button"
            disabled={togglingUid === row.uid}
            onClick={() => handleToggleBlock(row.uid, row.isBlocked)}
            className={`p-1 rounded border text-[10px] font-bold transition-colors cursor-pointer ${
              row.isBlocked
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
            title={row.isBlocked ? 'Unblock Batch (Return to Allocated Pool)' : 'Block Batch (Mark Unallocated / Hold)'}
          >
            {row.isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          </button>
        </div>
      )
    }
  ];

  const filters = [
    {
      type: 'dropdown',
      label: 'SKU',
      options: ['All', ...filterOptions.skus.map(s => s.value)],
      value: sku,
      onChange: setSku
    },
    {
      type: 'dropdown',
      label: 'Part Level',
      options: filterOptions.partLevels,
      value: partLevel,
      onChange: setPartLevel
    },
    {
      type: 'custom',
      render: () => (
        <SmartPartCombobox
          parts={filterOptions.parts}
          selectedPartId={partId}
          onSelectPart={setPartId}
          allowAll={true}
          label="Part"
        />
      )
    },
    {
      type: 'dropdown',
      label: 'Vendor',
      options: ['All', ...filterOptions.vendors],
      value: vendor,
      onChange: setVendor
    },
    {
      type: 'dropdown',
      label: 'Location',
      options: filterOptions.locations,
      value: location,
      onChange: setLocation
    }
  ];

  return (
    <div className="pb-6 max-w-[1600px] mx-auto px-2 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: FILTERS */}
      <StandardFilterBar
        title="Batch Wise Material Status"
        icon={Layers}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={filters}
        extraActions={
          kpis.blockedUnallocatedQty > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded shadow-xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Blocked / Unallocated: {kpis.blockedUnallocatedQty.toLocaleString()} units ({kpis.blockedBatchesCount} batches)</span>
            </div>
          )
        }
      />

      {/* SECTION 2: 2 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available batches</span>
            <div className="text-3xl font-black text-[#0369a1] mt-1">{(kpis.availableBatches || 0).toLocaleString()}</div>
            <span className="text-[11px] text-slate-500 font-medium">Non-blocked FIFO lots ready for issue</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0369a1] flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available batches part qty</span>
            <div className="text-3xl font-black text-emerald-700 mt-1">{(kpis.availableBatchesPartQty || 0).toLocaleString()}</div>
            <span className="text-[11px] text-slate-500 font-medium">
              Remaining unconsumed units ({(kpis.blockedUnallocatedQty || 0).toLocaleString()} units blocked/hold)
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION 3: BATCH LIST (PRIORITY ORDER, FIFO) */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Batch list (priority order, FIFO)</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {loading ? 'Loading...' : `${tableData.length} batches`}
            </span>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Search part, vendor, batch, state..."
              className="w-full pl-8 pr-6 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0369a1] font-medium"
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
