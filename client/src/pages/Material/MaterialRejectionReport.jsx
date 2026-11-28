import React, { useState, useMemo, useEffect } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import SmartPartCombobox from '../../components/SmartPartCombobox';
import DataTable from '../../components/DataTable';
import { exportToXLSX } from '../../utils/exportExcel';
import { useReportFilters } from '../../hooks/useReportFilters';
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
  XCircle,
  ClipboardCheck,
  ShieldAlert,
  Warehouse,
  Factory,
  Search
} from 'lucide-react';

const SOURCE_COLORS = {
  IQC: '#e11d48',
  IPQC: '#f97316',
  Store: '#f59e0b',
  Production: '#0369a1'
};

export default function MaterialRejectionReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const [sku, setSku] = useState('All');
  const [partLevel, setPartLevel] = useState('All');
  const [partId, setPartId] = useState('All');
  const [vendor, setVendor] = useState('All');
  const [tableSearch, setTableSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      period: period || 'Shift',
      shift: shift || 'All',
      startDate: startDate || '',
      endDate: endDate || '',
      sku,
      partLevel,
      partId,
      vendor
    });
    fetch(`/api/material/rejection?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Material Rejection fetch error:', err);
        setLoading(false);
      });
  }, [period, shift, startDate, endDate, sku, partLevel, partId, vendor]);

  const kpis = data?.kpis || { totalRejected: 0, iqc: 0, ipqc: 0, store: 0, production: 0 };
  const rejectionBySource = data?.rejectionBySource || [];
  const topVendorsByRejection = data?.topVendorsByRejection || [];
  const rawTable = data?.table || [];
  const filterOptions = data?.filterOptions || { skus: [], partLevels: ['All', '1', '2', '3'], parts: [], vendors: [] };

  const tableData = useMemo(() => {
    if (!tableSearch.trim()) return rawTable;
    const q = tableSearch.toLowerCase();
    return rawTable.filter(
      r =>
        (r.partId && r.partId.toLowerCase().includes(q)) ||
        (r.partName && r.partName.toLowerCase().includes(q)) ||
        (r.vendorName && r.vendorName.toLowerCase().includes(q)) ||
        (r.source && r.source.toLowerCase().includes(q)) ||
        (r.ediNo && r.ediNo.toLowerCase().includes(q)) ||
        (r.batch && r.batch.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q))
    );
  }, [rawTable, tableSearch]);

  const handleExportExcel = () => {
    exportToXLSX(`Material_Rejection_Report_${new Date().toISOString().split('T')[0]}.xlsx`, [
      {
        name: 'KPI Summary',
        rows: [
          ['Metric', 'Value'],
          ['Total Rejected', kpis.totalRejected],
          ['IQC', kpis.iqc],
          ['IPQC', kpis.ipqc],
          ['Store', kpis.store],
          ['Production', kpis.production]
        ]
      },
      {
        name: 'Top Vendors',
        rows: [
          ['Vendor', 'Rejected Qty', 'Incoming Qty', 'Rejection Rate %'],
          ...topVendorsByRejection.map(v => [v.vendor, v.rejectedQty, v.incomingQty, `${v.rejectionRatePct}%`])
        ]
      },
      {
        name: 'Rejection Detail',
        rows: [
          ['Part ID', 'Part Name', 'Vendor', 'Source', 'EDI No', 'Batch', 'Qty', 'Status', 'DateTime'],
          ...tableData.map(r => [
            r.partId,
            r.partName,
            r.vendorName,
            r.source,
            r.ediNo,
            r.batch,
            r.qty,
            r.status,
            r.dateTime ? new Date(r.dateTime).toLocaleString('en-IN') : '-'
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
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
            {row.partId}
          </span>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]" title={row.partName}>
            {row.partName}
          </span>
        </div>
      )
    },
    { header: 'Vendor', accessor: 'vendorName' },
    {
      header: 'Source',
      accessor: 'source',
      render: val => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
            val === 'IQC'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : val === 'IPQC'
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : val === 'Store'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          {val}
        </span>
      )
    },
    {
      header: 'EDI No',
      accessor: 'ediNo',
      render: val => <span className="font-mono text-xs font-semibold text-slate-700">{val}</span>
    },
    {
      header: 'Batch',
      accessor: 'batch',
      render: val => <span className="font-mono text-xs font-bold text-[#0369a1]">{val}</span>
    },
    {
      header: 'Qty',
      accessor: 'qty',
      align: 'right',
      render: val => <span className="text-xs font-black text-rose-600">{(val || 0).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: val => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            val === 'Scrapped'
              ? 'bg-rose-100 text-rose-800'
              : val?.includes('RTV')
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {val}
        </span>
      )
    },
    {
      header: 'DateTime',
      accessor: 'dateTime',
      render: val => (
        <span className="font-mono text-[11px] text-slate-500">
          {val ? new Date(val).toLocaleString('en-IN') : '-'}
        </span>
      )
    }
  ];

  const filters = [
    ...getBaseFilters(),
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
    }
  ];

  return (
    <div className="pb-6 max-w-[1600px] mx-auto px-2 flex flex-col gap-3.5 h-full">
      {/* SECTION 1: FILTERS & CONTROLS */}
      <StandardFilterBar
        title="Material Rejection"
        icon={XCircle}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={filters}
      />

      {/* SECTION 2: 5 KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-rose-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Total Rejected</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{(kpis.totalRejected || 0).toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-rose-600">All Sources Combined</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">IQC</span>
            <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{(kpis.iqc || 0).toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-slate-500">Incoming Inspection</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">IPQC</span>
            <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-600">{(kpis.ipqc || 0).toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-slate-500">In-Process Quality Check</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Store</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{(kpis.store || 0).toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-slate-500">Central Store Quarantine</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Production</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0369a1] flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0369a1]">{(kpis.production || 0).toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-slate-500">Assembly Line Rejections</span>
        </div>
      </div>

      {/* SECTION 3: 2 HORIZONTAL BAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Left: Rejection by source (Horizontal Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rejection by source
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Rejected units broken down by quality / floor stage
              </p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Horizontal Bar Chart
            </span>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rejectionBySource}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="source"
                  width={85}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                />
                <Tooltip
                  formatter={(value) => [`${value} units`, 'Rejected Qty']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="qty" name="Rejected Qty" radius={[0, 4, 4, 0]} barSize={24}>
                  {rejectionBySource.map((entry, idx) => (
                    <Cell key={idx} fill={SOURCE_COLORS[entry.source] || '#0369a1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top vendors by rejection (Horizontal Bar Chart) on basis of incoming */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top vendors by rejection
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Calculated on basis of incoming EDI & batch receipts
              </p>
            </div>
            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
              Incoming Basis
            </span>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topVendorsByRejection}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="vendor"
                  width={135}
                  tick={{ fontSize: 10.5, fontWeight: 600, fill: '#334155' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs">
                          <p className="font-bold text-slate-900 mb-1">{d.vendor}</p>
                          <div className="flex justify-between gap-4 text-rose-600 font-semibold">
                            <span>Rejected Qty:</span>
                            <span>{d.rejectedQty} units</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-600 font-medium">
                            <span>Incoming Qty:</span>
                            <span>{(d.incomingQty || 0).toLocaleString()} units</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-900 font-bold border-t border-slate-100 mt-1 pt-1">
                            <span>Rejection Rate:</span>
                            <span>{d.rejectionRatePct}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rejectedQty" name="Rejected Qty" fill="#e11d48" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4: REJECTION DETAIL TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Rejection detail</h3>
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
              placeholder="Search part, vendor, EDI, batch..."
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
