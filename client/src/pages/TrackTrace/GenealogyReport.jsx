import React, { useState, useEffect } from 'react';
import { GitBranch, SearchX } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function GenealogyReport() {
  const [searchUID, setSearchUID] = useState('');
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    if (searchUID.trim()) {
      fetch(`/api/trace/genealogy?uid=${encodeURIComponent(searchUID.trim())}`)
        .then(res => res.json())
        .then(data => setDbData(data))
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
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val}</span>
    )},
    { header: 'Remarks', accessor: 'remarks' },
  ];

  const exportToExcel = () => {
    if (!hasRecords) return;
    exportToXLSX('GenealogyReport.xlsx', [
      { name: 'Engine Summary', rows: [['Engine UID', 'Engine Status', 'Total Stations', 'Total Rework Count'], [searchUID, dbData?.kpis?.status || 'OK', dbData?.kpis?.completedStations || tableData.length, 0]] },
      { name: 'Station History', rows: [['Station', 'Operation', 'Start Time', 'End Time', 'Duration', 'Operator', 'Result', 'Remarks'], ...tableData.map(r => [r.station, r.operation, r.startTime, r.endTime, r.duration, r.operator, r.result, r.remarks])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Genealogy Report"
        icon={GitBranch}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'search', label: 'Engine UID', value: searchUID, onChange: setSearchUID, placeholder: 'Enter Engine UID (e.g. ENG-2026-00123)...' }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        {!searchUID.trim() ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <GitBranch className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Enter Engine UID</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">Enter an Engine UID to view complete station genealogy and operation timestamps.</p>
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
              <StatCard title="Engine Status" value={dbData?.kpis?.status || 'OK'} sub="Gate Status" color="green" />
              <StatCard title="Total Stations Passed" value={dbData?.kpis?.completedStations || tableData.length} sub="Stages Completed" color="blue" />
              <StatCard title="Current Station" value={dbData?.kpis?.currentStation || (tableData[0]?.station || 'N/A')} sub="Live Position" color="amber" />
              <StatCard title="Assembly Stages" value={tableData.length} sub="Trace Logs" color="purple" />
            </div>
            <div className="card p-4 flex-1">
              <h3 className="text-sm font-bold text-brand-dark mb-3">Station History</h3>
              <DataTable columns={columns} data={tableData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
