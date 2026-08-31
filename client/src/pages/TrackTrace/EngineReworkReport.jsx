import React, { useState, useEffect } from 'react';
import { Cpu, AlertCircle, SearchX } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function EngineReworkReport() {
  const [searchUID, setSearchUID] = useState('ENG-1000001');
  const [dbData, setDbData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchUID.trim()) {
      setIsLoading(true);
      fetch(`/api/trace/engine-rework?uid=${encodeURIComponent(searchUID.trim())}`)
        .then(res => res.json())
        .then(data => {
          setDbData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else {
      setDbData(null);
    }
  }, [searchUID]);

  const tableData = dbData?.table || [];
  const hasRecords = tableData.length > 0;

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Model', accessor: 'model' },
    { header: 'Defect Station', accessor: 'station' },
    { header: 'Defect Reason', accessor: 'reason' },
    { header: 'Detected Date & Time', accessor: 'detectedTime' },
    { header: 'Rework Start', accessor: 'reworkStart' },
    { header: 'Rework End', accessor: 'reworkEnd' },
    { header: 'Rework Status', accessor: 'status', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{val}</span>
    )},
    { header: 'Rework Operator', accessor: 'operator' },
  ];

  const exportToExcel = () => {
    if (!hasRecords) return;
    exportToXLSX('EngineReworkReport.xlsx', [
      { name: 'Engine Summary', rows: [['Engine UID', 'Total Defects', 'Rework Count', 'Final Status', 'Total Rework Time'], [searchUID, tableData.length, tableData.length, 'OK', `${tableData.length * 20}m`]] },
      { name: 'Rework Details', rows: [['Engine No', 'Model', 'Station', 'Reason', 'Detected Time', 'Start Time', 'End Time', 'Status', 'Operator'], ...tableData.map(r => [r.engineNo, r.model, r.station, r.reason, r.detectedTime, r.reworkStart, r.reworkEnd, r.status, r.operator])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Engine Wise Rework Summary"
        icon={Cpu}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'search', label: 'Engine UID', value: searchUID, onChange: setSearchUID, placeholder: 'Enter Engine UID (e.g. ENG-3018)...' }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        {!searchUID.trim() ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Cpu className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Enter Engine UID</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">Enter a valid serial number or Engine UID to view rework history and quality actions.</p>
          </div>
        ) : !hasRecords ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <SearchX className="w-12 h-12 text-rose-400 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Data Available</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              No rework records or defect history found for the given serial number <span className="font-semibold text-brand-dark">"{searchUID}"</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Total Defects" value={tableData.length} sub="Logged Inspection Issues" color="red" />
              <StatCard title="Rework Count" value={tableData.length} sub="Repair Cycles Completed" color="orange" />
              <StatCard title="Final Status" value={dbData?.kpis?.finalStatus || "OK"} sub="Passed Quality Gate" color="green" />
              <StatCard title="Total Rework Time" value={dbData?.kpis?.totalReworkTime || `${tableData.length * 20}m`} sub="Cumulative Duration" color="blue" />
            </div>
            <div className="card p-4 flex-1">
              <h3 className="text-sm font-bold text-brand-dark mb-3">Rework Details</h3>
              <DataTable columns={columns} data={tableData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
