import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import SmartPartCombobox from '../../components/SmartPartCombobox';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import { TrendingDown, PackageCheck, Cpu, Scale, Layers, Search } from 'lucide-react';

export default function MaterialConsumptionReport() {
  const [partId, setPartId] = useState('All');
  const [vendor, setVendor] = useState('All');
  const [batch, setBatch] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ partId, vendor, batch });
    fetch(`/api/material/consumption?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Material Consumption fetch error:', err);
        setLoading(false);
      });
  }, [partId, vendor, batch]);

  const kpis = data?.kpis || { receivedQty: 0, consumedQty: 0, balanceQty: 0, enginesBuilt: 0 };
  const rawTable = data?.table || [];
  const filterOptions = data?.filterOptions || { parts: [], vendors: [], batches: [] };

  const tableData = useMemo(() => {
    if (!tableSearch.trim()) return rawTable;
    const q = tableSearch.toLowerCase();
    return rawTable.filter(
      r =>
        String(r.plan).toLowerCase().includes(q) ||
        (r.engineNo && r.engineNo.toLowerCase().includes(q)) ||
        (r.consumedAt && r.consumedAt.toLowerCase().includes(q)) ||
        (r.model && r.model.toLowerCase().includes(q)) ||
        (r.sku && r.sku.toLowerCase().includes(q)) ||
        (r.partId && r.partId.toLowerCase().includes(q)) ||
        (r.batchId && r.batchId.toLowerCase().includes(q))
    );
  }, [rawTable, tableSearch]);

  const handleExportExcel = () => {
    exportToXLSX(`Material_Consumption_Report_${new Date().toISOString().split('T')[0]}.xlsx`, [
      {
        name: 'KPI Summary',
        rows: [
          ['Metric', 'Value'],
          ['Received Qty', kpis.receivedQty],
          ['Consumed Qty', kpis.consumedQty],
          ['Balance Qty', kpis.balanceQty],
          ['Engines Built', kpis.enginesBuilt]
        ]
      },
      {
        name: 'Consumption Details',
        rows: [
          ['Plan', 'Engine No.', 'Consumed At', 'Qty Consumed', 'Model', 'SKU', 'Part ID', 'Batch ID', 'Vendor'],
          ...tableData.map(r => [
            r.plan,
            r.engineNo,
            r.consumedAt,
            r.qtyConsumed,
            r.model,
            r.sku,
            r.partId,
            r.batchId,
            r.vendorName
          ])
        ]
      }
    ]);
  };

  const columns = [
    {
      header: 'Plan',
      accessor: 'plan',
      render: val => <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">PLAN-{val}</span>
    },
    {
      header: 'Engine No.',
      accessor: 'engineNo',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-indigo-700">{val}</span>
          <span className="text-[10px] text-slate-400">
            {row.partId} • Batch: {row.batchId}
          </span>
        </div>
      )
    },
    { header: 'Consumed At', accessor: 'consumedAt' },
    {
      header: 'Qty Consumed',
      accessor: 'qtyConsumed',
      align: 'right',
      render: val => <span className="font-black text-emerald-700">{(val || 0).toLocaleString()}</span>
    },
    { header: 'Model', accessor: 'model' },
    {
      header: 'SKU',
      accessor: 'sku',
      render: val => <span className="font-mono text-xs font-bold text-[#0369a1]">{val}</span>
    }
  ];

  const filters = [
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
      label: 'Batch',
      options: ['All', ...filterOptions.batches],
      value: batch,
      onChange: setBatch
    }
  ];

  return (
    <div className="pb-6 max-w-[1600px] mx-auto px-2 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: FILTERS (Part, Vendor, Batch, Live Shift, Excel, PDF) */}
      <StandardFilterBar
        title="Material Consumption Report"
        icon={TrendingDown}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={filters}
      />

      {/* SECTION 2: 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Received Qty</span>
            <div className="text-2xl font-black text-[#0369a1] mt-1">{(kpis.receivedQty || 0).toLocaleString()}</div>
            <span className="text-[10px] font-semibold text-slate-500">Batch Opening / Received</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0369a1] flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consumed Qty</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{(kpis.consumedQty || 0).toLocaleString()}</div>
            <span className="text-[10px] font-semibold text-slate-500">Issued & Built into Engines</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Balance Qty</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{(kpis.balanceQty || 0).toLocaleString()}</div>
            <span className="text-[10px] font-semibold text-slate-500">Remaining Batch Stock</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Engines Built</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">{(kpis.enginesBuilt || 0).toLocaleString()}</div>
            <span className="text-[10px] font-semibold text-slate-500">Distinct Engines Traced</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 3: CONSUMPTION DETAIL TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Consumption Traceability</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {loading ? 'Loading...' : `${tableData.length} records`}
            </span>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Search plan, engine no, model, SKU..."
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
