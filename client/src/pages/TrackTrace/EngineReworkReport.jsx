import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function EngineReworkReport() {
  const [searchUID, setSearchUID] = useState('ENG-3018');

  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    if (searchUID) {
      fetch(`/api/trace/engine-rework?uid=${searchUID}`)
        .then(res => res.json())
        .then(data => setDbData(data))
        .catch(err => console.error(err));
    }
  }, [searchUID]);

  const tableData = dbData?.table || [
    { id: 1, engineNo: 'ENG-3018', model: 'Pulsar 150', station: 'Line2 (Head Tightening)', reason: 'Torque Fail on Head Bolt #3', detectedTime: '2026-08-29 08:35', reworkStart: '08:50', reworkEnd: '09:10', status: 'Completed', operator: 'Rahul Sharma' }
  ];

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
    exportToXLSX('EngineReworkReport.xlsx', [
      { name: 'Engine Summary', rows: [['Engine UID', 'Total Defects', 'Rework Count', 'Final Status', 'Total Rework Time'], [searchUID, tableData.length, tableData.length, 'OK', '20m']] },
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
          { type: 'search', label: 'Engine UID', value: searchUID, onChange: setSearchUID, placeholder: 'Enter Engine UID...' }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        {!searchUID ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow border border-slate-200">
            <p className="text-slate-500 font-medium">Enter Engine UID to view rework summary</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Total Defects" value={tableData.length} sub="Logged Inspection Issues" color="red" />
              <StatCard title="Rework Count" value={tableData.length} sub="Repair Cycles Completed" color="orange" />
              <StatCard title="Final Status" value="OK" sub="Passed Quality Gate" color="green" />
              <StatCard title="Total Rework Time" value="20m" sub="Cumulative Duration" color="blue" />
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
