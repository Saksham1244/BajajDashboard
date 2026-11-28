import React, { useState, useEffect, useMemo } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import { ClipboardList, Layers } from 'lucide-react';

export default function RunningPlanMaterialStatusReport() {
  const [line, setLine] = useState('All');
  const [subAssemblyLine, setSubAssemblyLine] = useState('All');
  const [selectedPlanPart, setSelectedPlanPart] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (line && line !== 'All') params.append('line', line);
    if (subAssemblyLine && subAssemblyLine !== 'All') params.append('subAssemblyLine', subAssemblyLine);

    fetch(`/api/material/running-plan?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setSelectedPlanPart(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching running plan material status:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [line, subAssemblyLine]);

  const planData = data?.planData || [];
  const allBatches = data?.batches || [];
  const filterOptions = data?.filterOptions || { lines: [], subAssemblyLines: [] };

  const availableSubLines = useMemo(() => {
    const items = filterOptions.subAssemblyLines || [];
    const filtered = line === 'All' ? items : items.filter(s => s.lineName === line);
    return ['All', ...new Set(filtered.map(s => s.name))];
  }, [filterOptions.subAssemblyLines, line]);

  // Keep subAssemblyLine valid when Line changes
  const handleLineChange = (newLine) => {
    setLine(newLine);
    setSubAssemblyLine('All');
  };

  const displayedBatches = useMemo(() => {
    if (!selectedPlanPart) return allBatches;
    return allBatches.filter(b => b.partId === selectedPlanPart.partId);
  }, [allBatches, selectedPlanPart]);

  const handleExportExcel = () => {
    exportToXLSX(`Running_Plan_Material_Status_${new Date().toISOString().split('T')[0]}.xlsx`, [
      {
        name: 'Running Plan Data',
        rows: [
          ['PlanID', 'Line', 'SubAssemblyLine', 'Part ID', 'Part Name', 'Required Qty', 'ToBeIssued Qty', 'Delivered Qty', 'Consumed Qty'],
          ...planData.map(r => [r.planId, r.lineName, r.subAssemblyLine, r.partId, r.partName, r.requiredQty, r.toBeIssuedQty, r.deliveredQty, r.consumedQty])
        ]
      },
      {
        name: 'Batch List FIFO',
        rows: [
          ['Part', 'Vendor', 'Batch', 'Priority', 'Open Qty', 'Used', 'Moved', 'Left', '% used', 'State'],
          ...displayedBatches.map(b => [`${b.partId} - ${b.partName}`, b.vendor, b.batch, b.priority, b.openQty, b.used, b.moved, b.left, `${b.pctUsed}%`, b.state])
        ]
      }
    ]);
  };

  const planColumns = [
    {
      header: 'PlanID',
      accessor: 'planId',
      render: (val, row) => {
        const isSel = selectedPlanPart?.uid === row.uid;
        return (
          <span
            className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
              isSel ? 'bg-[#0369a1] text-white border-[#0369a1]' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-blue-50 hover:text-[#0369a1]'
            }`}
            title="Click to filter FIFO batch list for this part"
          >
            PLAN-{val}
          </span>
        );
      }
    },
    {
      header: 'Part Name',
      accessor: 'partName',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[#0369a1] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            {row.partId}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800">{val}</span>
            <span className="text-[10px] text-slate-400">{row.lineName} • {row.subAssemblyLine} • {row.skuName}</span>
          </div>
        </div>
      )
    },
    { header: 'Required Qty', accessor: 'requiredQty', align: 'right', render: v => <span className="text-xs font-bold text-slate-800">{(v || 0).toLocaleString()}</span> },
    { header: 'ToBeIssued Qty', accessor: 'toBeIssuedQty', align: 'right', render: v => <span className="text-xs font-bold text-amber-700">{(v || 0).toLocaleString()}</span> },
    { header: 'Delivered Qty', accessor: 'deliveredQty', align: 'right', render: v => <span className="text-xs font-bold text-[#0369a1]">{(v || 0).toLocaleString()}</span> },
    { header: 'Consumed Qty', accessor: 'consumedQty', align: 'right', render: v => <span className="text-xs font-black text-emerald-700">{(v || 0).toLocaleString()}</span> }
  ];

  const batchColumns = [
    {
      header: 'Part',
      accessor: 'partId',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
            {row.partId}
          </span>
          <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]" title={row.partName}>
            {row.partName}
          </span>
        </div>
      )
    },
    { header: 'Vendor', accessor: 'vendor', render: v => <span className="text-xs text-slate-700">{v}</span> },
    { header: 'Batch', accessor: 'batch', render: v => <span className="font-mono text-xs font-bold text-[#0369a1]">{v}</span> },
    {
      header: 'Priority',
      accessor: 'priority',
      align: 'center',
      render: v => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-xs font-black text-slate-700">
          {v}
        </span>
      )
    },
    { header: 'Open Qty', accessor: 'openQty', align: 'right', render: v => <span className="text-xs font-semibold text-slate-700">{(v || 0).toLocaleString()}</span> },
    { header: 'Used', accessor: 'used', align: 'right', render: v => <span className="text-xs font-semibold text-indigo-700">{(v || 0).toLocaleString()}</span> },
    { header: 'Moved', accessor: 'moved', align: 'right', render: v => <span className="text-xs font-semibold text-slate-600">{(v || 0).toLocaleString()}</span> },
    { header: 'Left', accessor: 'left', align: 'right', render: v => <span className="text-xs font-black text-emerald-700">{(v || 0).toLocaleString()}</span> },
    {
      header: '% used',
      accessor: 'pctUsed',
      render: val => (
        <div className="flex items-center gap-2 min-w-[85px]">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0369a1] rounded-full" style={{ width: `${Math.min(100, val || 0)}%` }} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 w-8 text-right">{val}%</span>
        </div>
      )
    },
    {
      header: 'State',
      accessor: 'state',
      render: val => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
            val === 'Running'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : val.includes('Blocked')
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : val === 'Exhausted'
              ? 'bg-slate-100 text-slate-500 border-slate-200'
              : 'bg-blue-50 text-[#0369a1] border-blue-200'
          }`}
        >
          {val}
        </span>
      )
    }
  ];

  const filters = [
    {
      type: 'dropdown',
      label: 'Line',
      value: line,
      options: ['All', ...filterOptions.lines],
      onChange: handleLineChange
    },
    {
      type: 'dropdown',
      label: 'SubAssemblyLine',
      value: subAssemblyLine,
      options: availableSubLines,
      onChange: setSubAssemblyLine
    }
  ];

  return (
    <div className="pb-6 max-w-[1600px] mx-auto px-2 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: FILTERS */}
      <StandardFilterBar
        title="Running Plan Material Status"
        icon={ClipboardList}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={filters}
      />

      {/* SECTION 3: RUNNING PLAN DATA */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">Running Plan Data</h3>
            <span className="text-xs font-bold bg-blue-50 text-[#0369a1] px-2 py-0.5 rounded-full border border-blue-200">
              {planData.length} active items
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click any PlanID / Part row to filter its FIFO Batch List below
          </span>
        </div>
        {loading ? (
          <div className="py-10 text-center text-xs text-slate-400 font-semibold">Loading Running Plan Data...</div>
        ) : (
          <DataTable
            columns={planColumns}
            data={planData}
            onRowClick={row => setSelectedPlanPart(selectedPlanPart?.uid === row.uid ? null : row)}
          />
        )}
      </div>

      {/* SECTION 4: BATCH LIST (PRIORITY ORDER, FIFO) */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0369a1]" />
            <h3 className="text-sm font-black text-slate-900">Batch list (priority order, FIFO)</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {displayedBatches.length} batches
            </span>
            {selectedPlanPart && (
              <span className="text-xs font-bold bg-blue-50 text-[#0369a1] px-2.5 py-0.5 rounded-full border border-blue-200">
                Filtered: {selectedPlanPart.partId} ({selectedPlanPart.partName})
              </span>
            )}
          </div>
          {selectedPlanPart && (
            <button
              type="button"
              onClick={() => setSelectedPlanPart(null)}
              className="text-xs font-bold text-[#0369a1] hover:underline"
            >
              Show All Plan Batches
            </button>
          )}
        </div>
        <DataTable columns={batchColumns} data={displayedBatches} />
      </div>
    </div>
  );
}
