import React, { useState, useMemo, useEffect, useCallback } from 'react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { CheckSquare, ChevronDown, ChevronRight, X, CheckCircle2, XCircle } from 'lucide-react';
import { useReportFilters } from '../../hooks/useReportFilters';
import { useFilterOptions } from '../../hooks/useFilterOptions';

// ─── Inline Drill-Down Panel ─────────────────────────────────────────────────
function CheckpointPanel({ checklistId, data, loading, onClose }) {
  return (
    <tr>
      <td colSpan={13} className="p-0">
        <div className="bg-orange-50 border border-orange-200 rounded-lg mx-2 my-1 overflow-hidden shadow-sm">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-orange-100/80 border-b border-orange-200">
            <div className="flex items-center gap-2 flex-wrap">
              <ChevronDown className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-bold text-orange-900">
                Checkpoints for {checklistId}
              </span>
              {data?.kpis && (
                <span className="ml-2 flex items-center gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-200">
                    ✓ {data.kpis.passed} Passed
                  </span>
                  <span className={`px-2 py-0.5 rounded font-semibold border ${data.kpis.failed > 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    ✗ {data.kpis.failed} Failed
                  </span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold border border-orange-200">
                    {data.kpis.passRate}% Pass Rate
                  </span>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              title="Close checkpoints"
              className="p-1 rounded hover:bg-orange-200 text-orange-500 hover:text-orange-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-6 text-center text-sm text-slate-400">Loading checkpoints…</div>
            ) : !data?.checkpoints?.length ? (
              <div className="py-6 text-center text-sm text-slate-400">No checkpoints found.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-50/70 border-b border-orange-200">
                    {['#', 'Checkpoint Name', 'Category', 'Standard Value', 'Actual Value', 'Result', 'Inspector', 'Date & Time'].map(h => (
                      <th key={h} className="py-2 px-3 text-[11px] font-bold text-orange-800 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.checkpoints.map((cp, i) => (
                    <tr key={i} className={`border-b border-orange-100 ${i % 2 === 0 ? 'bg-white' : 'bg-orange-50/30'} hover:bg-orange-100/50 transition-colors`}>
                      <td className="py-2 px-3 text-slate-500 font-medium">{cp.seq}</td>
                      <td className="py-2 px-3 font-medium text-brand-dark whitespace-nowrap">{cp.checkpointName}</td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{cp.category}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap font-mono text-xs">{cp.stdValue}</td>
                      <td className={`py-2 px-3 whitespace-nowrap font-mono text-xs font-semibold ${cp.result === 'FAIL' ? 'text-red-600 bg-red-50 px-2 rounded' : 'text-slate-700'}`}>
                        {cp.actValue}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${cp.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cp.result === 'PASS'
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />}
                          {cp.result}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{cp.inspector}</td>
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-xs">{cp.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Checklist Table with Drill-Down ─────────────────────────────────────────
function ChecklistTableWithDrillDown({ columns, data, expandedIds, toggle, checkpointsCache, loadingMap }) {
  if (!data.length) {
    return (
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                {columns.map(col => (
                  <th key={col.accessor} className="py-3 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-slate-500">
                  No data available in the database
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="py-3 px-3 w-8" />
              {columns.map(col => (
                <th key={col.accessor} className="py-3 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const rowId = row.id ?? i;
              const isExpanded = expandedIds.has(rowId);
              return (
                <React.Fragment key={rowId}>
                  <tr className={`border-b border-slate-100 transition-colors ${isExpanded ? 'bg-orange-50/70 font-medium' : 'hover:bg-slate-50'}`}>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggle(rowId)}
                        title={isExpanded ? 'Collapse checkpoints' : 'Drill down to checkpoints'}
                        className={`p-1 rounded transition-colors ${isExpanded ? 'bg-orange-200 text-orange-700' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'}`}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    {columns.map(col => {
                      const val = row[col.accessor];
                      return (
                        <td key={col.accessor} className="py-2.5 px-3 text-sm text-brand-dark">
                          {col.accessor === 'id' ? (
                            <button
                              onClick={() => toggle(rowId)}
                              title="Click to view checkpoints"
                              className="text-orange-600 hover:text-orange-800 hover:underline font-mono font-semibold text-xs inline-flex items-center gap-1"
                            >
                              {val}
                            </button>
                          ) : col.render ? col.render(val, row) : (val ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                  {isExpanded && (
                    <CheckpointPanel
                      checklistId={rowId}
                      data={checkpointsCache[rowId]}
                      loading={loadingMap[rowId]}
                      onClose={() => toggle(rowId)}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FQCChecklistReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  const [line, setLine] = useState('All');
  const [model, setModel] = useState('All');
  const [sku, setSku] = useState('All');
  const [dbData, setDbData] = useState(null);

  // Expanded rows state and checkpoint cache
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [checkpointsCache, setCheckpointsCache] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  useEffect(() => {
    fetch(`/api/quality/checklist?type=FQC&period=${period}&shift=${shift}&startDate=${startDate || ''}&endDate=${endDate || ''}&line=${encodeURIComponent(line)}&model=${encodeURIComponent(model)}&sku=${encodeURIComponent(sku)}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(console.error);
  }, [period, shift, startDate, endDate, line, model, sku]);

  const toggleRow = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!checkpointsCache[id]) {
          setLoadingMap(l => ({ ...l, [id]: true }));
          fetch(`/api/quality/checklist/checkpoints?checklistId=${encodeURIComponent(id)}&type=FQC`)
            .then(r => r.json())
            .then(d => {
              setCheckpointsCache(c => ({ ...c, [id]: d }));
              setLoadingMap(l => ({ ...l, [id]: false }));
            })
            .catch(() => {
              setLoadingMap(l => ({ ...l, [id]: false }));
            });
        }
      }
      return next;
    });
  }, [checkpointsCache]);

  const tableData = useMemo(() => {
    return (dbData?.table || []).filter(item => {
      if (line !== 'All' && item.line && item.line !== line) return false;
      if (model !== 'All' && item.model && item.model !== model) return false;
      if (sku !== 'All' && item.sku && item.sku !== sku) return false;
      if (period === 'Shift' && shift && shift !== 'All') {
        const normItem = String(item.shift || '').replace(/^Shift\s*/i, '').trim().toUpperCase();
        const normFilter = String(shift || '').replace(/^Shift\s*/i, '').trim().toUpperCase();
        const map = { 'A': '1', '1': '1', 'B': '2', '2': '2', 'C': '3', '3': '3' };
        if (map[normItem] && map[normFilter] && map[normItem] !== map[normFilter]) {
          return false;
        }
      }
      return true;
    });
  }, [dbData, line, model, sku, period, shift]);

  const kpiData = useMemo(() => {
    const totalChecklists = tableData.length;
    const okChecklists = tableData.filter(d => d.status === 'OK').length;
    const nokChecklists = tableData.filter(d => d.status === 'NOK' || d.status === 'FAIL').length;
    const compliance = totalChecklists > 0 ? Number(((okChecklists / totalChecklists) * 100).toFixed(1)) : 0;

    let totalCheckpoints = tableData.reduce((acc, d) => acc + (Number(d.total) || 0), 0);
    let okCheckpoints = tableData.reduce((acc, d) => acc + (Number(d.passed) || 0), 0);
    let nokCheckpoints = tableData.reduce((acc, d) => acc + (Number(d.failed) || 0), 0);

    if (totalCheckpoints === 0 && dbData?.kpis?.totalCheckpoints) {
      totalCheckpoints = dbData.kpis.totalCheckpoints;
      okCheckpoints = dbData.kpis.passed ?? 0;
      nokCheckpoints = dbData.kpis.failed ?? 0;
    }

    const checkpointCompliance = totalCheckpoints > 0 
      ? Number(((okCheckpoints / totalCheckpoints) * 100).toFixed(1)) 
      : 0;

    return {
      totalChecklists,
      okChecklists,
      nokChecklists,
      compliance,
      totalCheckpoints,
      okCheckpoints,
      nokCheckpoints,
      checkpointCompliance
    };
  }, [tableData, dbData]);

  const columns = [
    { header: 'Checklist ID',       accessor: 'id' },
    { header: 'Checklist Name',     accessor: 'name' },
    { header: 'Date & Time',        accessor: 'date' },
    { header: 'Shift',              accessor: 'shift' },
    { header: 'Line',               accessor: 'line' },
    { header: 'Model',              accessor: 'model' },
    { header: 'SKU',                accessor: 'sku' },
    { header: 'Inspector Name',     accessor: 'inspector' },
    { header: 'Total Checkpoints',  accessor: 'total' },
    { header: 'Passed',             accessor: 'passed' },
    { header: 'Failed',             accessor: 'failed' },
    {
      header: 'Overall Status', accessor: 'status',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {val}
        </span>
      )
    },
    { header: 'Remarks', accessor: 'remarks' },
  ];

  const exportToExcel = async () => {
    const activeExpandedIds = Array.from(expandedIds);

    let currentCache = { ...checkpointsCache };
    if (activeExpandedIds.length > 0) {
      const missingIds = activeExpandedIds.filter(id => !currentCache[id]?.checkpoints);

      if (missingIds.length > 0) {
        await Promise.all(
          missingIds.map(async (id) => {
            try {
              const res = await fetch(`/api/quality/checklist/checkpoints?checklistId=${encodeURIComponent(id)}&type=FQC`);
              const data = await res.json();
              if (data?.checkpoints) {
                currentCache[id] = data;
              }
            } catch (e) {
              console.error('Error fetching checkpoints for Excel export:', e);
            }
          })
        );
        setCheckpointsCache(currentCache);
      }
    }

    const sheets = [
      {
        name: 'KPI',
        rows: [
          ['Metric', 'Checkpoints', 'Checklists'],
          ['Total / Executed', kpiData.totalCheckpoints, kpiData.totalChecklists],
          ['OK / Passed', kpiData.okCheckpoints, kpiData.okChecklists],
          ['NOK / Failed', kpiData.nokCheckpoints, kpiData.nokChecklists],
          ['Compliance %', `${kpiData.checkpointCompliance}%`, `${kpiData.compliance}%`]
        ]
      },
      {
        name: 'Checklist Details',
        rows: [
          ['Checklist ID', 'Checklist Name', 'Date & Time', 'Shift', 'Line', 'Model', 'SKU', 'Inspector Name', 'Total Checkpoints', 'Passed', 'Failed', 'Overall Status', 'Remarks'],
          ...tableData.map(d => [d.id, d.name, d.date, d.shift, d.line, d.model, d.sku, d.inspector, d.total, d.passed, d.failed, d.status, d.remarks])
        ]
      }
    ];

    // For each open checklist, add a separate tab with that checklist's details and checkpoints
    if (activeExpandedIds.length > 0) {
      activeExpandedIds.forEach(id => {
        const chk = tableData.find(d => String(d.id) === String(id));
        const cpList = currentCache[id]?.checkpoints || [];
        const tabName = String(id).replace(/[\\/?*\[\]:]/g, '_').substring(0, 31);

        const sheetRows = [
          ['Checklist ID', chk?.id || id],
          ['Checklist Name', chk?.name || ''],
          ['Date & Time', chk?.date || ''],
          ['Shift', chk?.shift || ''],
          ['Line / Model / SKU', `${chk?.line || ''} / ${chk?.model || ''} / ${chk?.sku || ''}`],
          ['Inspector', chk?.inspector || ''],
          ['Overall Status', chk?.status || ''],
          ['Total Checkpoints', chk?.total ?? cpList.length],
          ['Passed', chk?.passed ?? cpList.filter(c => c.result === 'PASS').length],
          ['Failed', chk?.failed ?? cpList.filter(c => c.result !== 'PASS').length],
          ['Remarks', chk?.remarks || ''],
          [],
          ['#', 'Checklist ID', 'Checkpoint Name', 'Category', 'Standard Value', 'Actual Value', 'Result', 'Inspector', 'Date & Time'],
          ...cpList.map(cp => [
            cp.seq,
            chk?.id || id,
            cp.checkpointName,
            cp.category,
            cp.stdValue,
            cp.actValue,
            cp.result,
            cp.inspector,
            cp.date
          ])
        ];

        sheets.push({
          name: tabName,
          rows: sheetRows
        });
      });
    }

    exportToXLSX('FQCReport.xlsx', sheets);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="FQC Report"
        icon={CheckSquare}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line',  options: filterOptions.lines,  value: line,  onChange: setLine },
          { type: 'dropdown', label: 'Model', options: filterOptions.models, value: model, onChange: setModel },
          { type: 'dropdown', label: 'SKU',   options: filterOptions.skus,   value: sku,   onChange: setSku },
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            period={period ?? 'Month'} 
            color="blue"
            leftTitle="Checkpoints Executed"
            leftValue={kpiData.totalCheckpoints}
            title="Total Checklists" 
            value={kpiData.totalChecklists} 
          />
          <StatCard 
            period={period ?? 'Month'} 
            color="green"
            leftTitle="OK Checkpoints"
            leftValue={kpiData.okCheckpoints}
            title="OK Checklists"    
            value={kpiData.okChecklists}    
          />
          <StatCard 
            period={period ?? 'Month'} 
            color="red"
            leftTitle="NOK Checkpoints"
            leftValue={kpiData.nokCheckpoints}
            title="NOK Checklists"   
            value={kpiData.nokChecklists}   
          />
          <StatCard 
            period={period ?? 'Month'} 
            color={kpiData.compliance >= 90 ? 'green' : 'amber'}
            leftTitle="CP Compliance %"
            leftValue={kpiData.checkpointCompliance !== undefined ? `${kpiData.checkpointCompliance}%` : '0%'}
            title="Compliance %"     
            value={`${kpiData.compliance}%`} 
          />
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-brand-dark">Checklist Details</h3>
              <span className="text-xs text-slate-400">— click <ChevronRight className="w-3 h-3 inline text-orange-500" /> or the Checklist ID to expand checkpoints</span>
            </div>
            {expandedIds.size > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                ✓ {expandedIds.size} checklist{expandedIds.size > 1 ? 's' : ''} expanded (exported in separate tab{expandedIds.size > 1 ? 's' : ''})
              </span>
            )}
          </div>
          <ChecklistTableWithDrillDown
            columns={columns}
            data={tableData}
            expandedIds={expandedIds}
            toggle={toggleRow}
            checkpointsCache={checkpointsCache}
            loadingMap={loadingMap}
          />
        </div>
      </div>
    </div>
  );
}
