import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import { Cpu, Search } from 'lucide-react';

export default function EngineStockReport() {
  const [line, setLine] = useState('All');
  const [subAssemblyLine, setSubAssemblyLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ line, subAssemblyLine, model, sku });
    fetch(`/api/material/engine-sa-stock?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Engine and SA Stock fetch error:', err);
        setLoading(false);
      });
  }, [line, subAssemblyLine, model, sku]);

  const rawTable = data?.table || [];
  const filterOptions = data?.filterOptions || { lines: [], subAssemblyLines: [], models: [], skus: [] };

  const subAssemblyOptions = useMemo(() => {
    const list = (filterOptions.subAssemblyLines || [])
      .filter(s => line === 'All' || s.lineName === line)
      .map(s => s.name);
    return ['All', ...new Set(list)];
  }, [filterOptions.subAssemblyLines, line]);

  const skuOptions = useMemo(() => {
    const list = (filterOptions.skus || [])
      .filter(s => model === 'All' || s.modelName === model)
      .map(s => s.skuName);
    return ['All', ...new Set(list)];
  }, [filterOptions.skus, model]);

  const handleLineChange = (val) => {
    setLine(val);
    setSubAssemblyLine('All');
  };

  const handleModelChange = (val) => {
    setModel(val);
    setSku('All');
  };

  const tableData = useMemo(() => {
    if (!tableSearch.trim()) return rawTable;
    const q = tableSearch.toLowerCase();
    return rawTable.filter(
      r =>
        String(r.plan).toLowerCase().includes(q) ||
        (r.subAssembly && r.subAssembly.toLowerCase().includes(q)) ||
        (r.modelName && r.modelName.toLowerCase().includes(q)) ||
        (r.skuName && r.skuName.toLowerCase().includes(q)) ||
        (r.lineName && r.lineName.toLowerCase().includes(q))
    );
  }, [rawTable, tableSearch]);

  const handleExportExcel = () => {
    exportToXLSX(`Engine_and_SubAssembly_Stock_${new Date().toISOString().split('T')[0]}.xlsx`, [
      {
        name: 'Engine & SubAssembly Stock',
        rows: [
          ['Plan', 'Line', 'SubAssembly', 'Model Name', 'SKU Name', 'Available Qty'],
          ...tableData.map(r => [r.plan, r.lineName, r.subAssembly, r.modelName, r.skuName, r.availableQty])
        ]
      }
    ]);
  };

  const columns = [
    {
      header: 'Plan',
      accessor: 'plan',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
            {val === 'BUFFER' ? 'BUFFER' : `PLAN-${val}`}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{row.lineName}</span>
        </div>
      )
    },
    { header: 'SubAssembly', accessor: 'subAssembly' },
    { header: 'Model Name', accessor: 'modelName' },
    {
      header: 'SKU Name',
      accessor: 'skuName',
      render: val => <span className="font-mono text-xs font-bold text-[#0369a1]">{val}</span>
    },
    {
      header: 'Available Qty',
      accessor: 'availableQty',
      align: 'right',
      render: val => <span className="font-black text-emerald-700">{(val || 0).toLocaleString()}</span>
    }
  ];

  const filters = [
    {
      type: 'dropdown',
      label: 'Line',
      options: ['All', ...filterOptions.lines],
      value: line,
      onChange: handleLineChange
    },
    {
      type: 'dropdown',
      label: 'SubAssemblyLine',
      options: subAssemblyOptions,
      value: subAssemblyLine,
      onChange: setSubAssemblyLine
    },
    {
      type: 'dropdown',
      label: 'Model',
      options: ['All', ...filterOptions.models],
      value: model,
      onChange: handleModelChange
    },
    {
      type: 'dropdown',
      label: 'SKU',
      options: skuOptions,
      value: sku,
      onChange: setSku
    }
  ];

  return (
    <div className="pb-6 max-w-[1600px] mx-auto px-2 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: FILTERS (Line, SubAssemblyLine, Model, SKU, Live Shift, Excel, PDF) */}
      <StandardFilterBar
        title="Engine and SubAssembly Stock"
        icon={Cpu}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={filters}
      />

      {/* SECTION 2: ENGINE AND SUBASSEMBLY STOCK TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Engine & SubAssembly Stock</h3>
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
              placeholder="Search plan, subassembly, model, SKU..."
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
