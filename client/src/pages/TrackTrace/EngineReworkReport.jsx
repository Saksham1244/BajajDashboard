import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function EngineReworkReport() {
  const [searchUID, setSearchUID] = useState('');

  const mockReworkData = [
    { id: 1, engineNo: 'ENG-3001', model: 'Pulsar 150', station: 'ST-04', reason: 'Torque Fail', detectedTime: '2026-08-26 10:00', reworkStart: '10:15', reworkEnd: '10:30', status: 'Completed', operator: 'OP-RW1' },
    { id: 2, engineNo: 'ENG-3001', model: 'Pulsar 150', station: 'ST-11', reason: 'Scratch', detectedTime: '2026-08-26 11:30', reworkStart: '11:45', reworkEnd: '12:05', status: 'Completed', operator: 'OP-RW2' },
  ];

  const columns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'Model', accessor: 'model' },
    { header: 'Defect Station', accessor: 'station' },
    { header: 'Defect Reason', accessor: 'reason' },
    { header: 'Detected Date & Time', accessor: 'detectedTime' },
    { header: 'Rework Start', accessor: 'reworkStart' },
    { header: 'Rework End', accessor: 'reworkEnd' },
    { header: 'Rework Status', accessor: 'status' },
    { header: 'Rework Operator', accessor: 'operator' },
  ];

  const exportToExcel = () => {
    exportToXLSX('EngineReworkReport.xlsx', [
      { name: 'Engine Summary', rows: [['Engine UID', 'Total Defects', 'Rework Count', 'Final Status', 'Total Rework Time'], [searchUID, 2, 2, 'OK', '35m']] },
      { name: 'Rework Details', rows: [['Engine No', 'Model', 'Station', 'Reason', 'Detected Time', 'Start Time', 'End Time', 'Status', 'Operator'], ...mockReworkData.map(r => [r.engineNo, r.model, r.station, r.reason, r.detectedTime, r.reworkStart, r.reworkEnd, r.status, r.operator])] }
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
              <StatCard title="Total Defects" value="2" trend="neutral" color="red" />
              <StatCard title="Rework Count" value="2" trend="neutral" color="orange" />
              <StatCard title="Final Status" value="OK" trend="neutral" color="green" />
              <StatCard title="Total Rework Time" value="35m" trend="neutral" color="blue" />
            </div>
            <div className="card p-4 flex-1">
              <h3 className="text-sm font-bold text-brand-dark mb-3">Rework Details</h3>
              <DataTable columns={columns} data={mockReworkData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
