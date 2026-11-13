import React, { useState, useEffect } from 'react';
import { GitBranch, SearchX, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function GenealogyReport() {
  const [searchUID, setSearchUID] = useState('ENG20260914001');
  const [dbData, setDbData] = useState(null);
  const [availableEngines, setAvailableEngines] = useState([
    'ENG20260914001',
    'ENG20260914002',
    'ENG20260914004',
    'ENG20260914005',
    'ENG20260914006',
    'ENG20260914003'
  ]);

  useEffect(() => {
    fetch('/api/trace/genealogy')
      .then(res => res.json())
      .then(data => {
        if (data?.availableEngines && data.availableEngines.length > 0) {
          setAvailableEngines(data.availableEngines);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (searchUID.trim()) {
      fetch(`/api/trace/genealogy?uid=${encodeURIComponent(searchUID.trim())}`)
        .then(res => res.json())
        .then(data => {
          setDbData(data);
          if (data?.availableEngines && data.availableEngines.length > 0) {
            setAvailableEngines(data.availableEngines);
          }
        })
        .catch(err => console.error(err));
    } else {
      setDbData(null);
    }
  }, [searchUID]);

  const tableData = dbData?.table || [];
  const hasRecords = tableData.length > 0;

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Station', accessor: 'station' },
    { header: 'Operation', accessor: 'operation' },
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Result', accessor: 'result', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        val === 'OK' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
      }`}>
        {val}
      </span>
    )},
    { header: 'Remarks / Measurements', accessor: 'remarks', render: (val) => (
      <span className={`text-xs ${val?.includes('NOK') || val?.includes('variance') ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>
        {val}
      </span>
    )},
  ];

  const exportToExcel = () => {
    if (!hasRecords) return;
    exportToXLSX('GenealogyReport.xlsx', [
      { 
        name: 'Engine Summary', 
        rows: [
          ['Engine UID', 'Engine Status', 'Total Stations', 'Total Stages Completed'], 
          [searchUID, dbData?.kpis?.status || 'OK', dbData?.kpis?.completedStations || tableData.length, tableData.length]
        ] 
      },
      { 
        name: 'Station History', 
        rows: [
          ['Station', 'Operation', 'Start Time', 'End Time', 'Duration', 'Operator', 'Result', 'Remarks'], 
          ...tableData.map(r => [r.station, r.operation, r.startTime, r.endTime, r.duration, r.operator, r.result, r.remarks])
        ] 
      }
    ]);
  };

  // Status badge styling
  const getStatusColor = (status) => {
    if (!status) return 'blue';
    const s = status.toLowerCase();
    if (s.includes('fg') || s.includes('complete') || s.includes('ok')) return 'green';
    if (s.includes('hold')) return 'amber';
    if (s.includes('rework') || s.includes('not ok')) return 'rose';
    return 'blue';
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Genealogy Report"
        icon={GitBranch}
        onExcelClick={exportToExcel}
        filters={[
          { 
            type: 'search', 
            label: 'Engine UID', 
            value: searchUID, 
            onChange: setSearchUID, 
            placeholder: 'Enter Engine UID (e.g. ENG20260914001)...' 
          }
        ]}
      />

      {/* Quick Select Chips */}
      {availableEngines.length > 0 && (
        <div className="bg-white rounded-lg p-2.5 px-3 border border-slate-200 shadow-sm flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Tracked Engines:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableEngines.map(eng => {
              const isSelected = searchUID === eng;
              return (
                <button
                  key={eng}
                  type="button"
                  onClick={() => setSearchUID(eng)}
                  className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {eng}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3">
        {!searchUID.trim() ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <GitBranch className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Select or Enter Engine UID</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">Click any of the tracked engines above or enter an Engine UID to view complete station genealogy and operation timestamps.</p>
          </div>
        ) : !hasRecords ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <SearchX className="w-12 h-12 text-rose-400 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Data Available</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              No genealogy or station history found for the given serial number <span className="font-semibold text-brand-dark">"{searchUID}"</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard 
                title="Engine Gate Status" 
                value={dbData?.kpis?.status || 'In-Process'} 
                sub="Trace Status" 
                color={getStatusColor(dbData?.kpis?.status)} 
              />
              <StatCard 
                title="Stations Passed" 
                value={dbData?.kpis?.completedStations || tableData.length} 
                sub="Stages Verified" 
                color="blue" 
              />
              <StatCard 
                title="Current Station" 
                value={dbData?.kpis?.currentStation || (tableData[tableData.length - 1]?.station || 'N/A')} 
                sub="Last Line Position" 
                color="amber" 
              />
              <StatCard 
                title="Total Assembly Stages" 
                value={tableData.length} 
                sub="Trace Logs Recorded" 
                color="purple" 
              />
            </div>
            <div className="card p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Station Genealogy History — {searchUID}
                </h3>
                <span className="text-xs text-slate-500">
                  Total {tableData.length} stations logged in sequence
                </span>
              </div>
              <DataTable columns={columns} data={tableData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
