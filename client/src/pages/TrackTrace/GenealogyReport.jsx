import React, { useState } from 'react';
import { GitBranch } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';

export default function GenealogyReport() {
  const [searchUID, setSearchUID] = useState('');

  const mockHistoryData = [
    { id: 1, station: 'ST-01', operation: 'Block Assembly', startTime: '10:00:00', endTime: '10:05:00', duration: '5m', operator: 'OP-001', result: 'OK', remarks: '-' },
    { id: 2, station: 'ST-02', operation: 'Piston Assembly', startTime: '10:06:00', endTime: '10:12:00', duration: '6m', operator: 'OP-002', result: 'OK', remarks: '-' },
    { id: 3, station: 'ST-03', operation: 'Head Assembly', startTime: '10:13:00', endTime: '10:19:00', duration: '6m', operator: 'OP-003', result: 'NOK', remarks: 'Torque issue' },
    { id: 4, station: 'RW-01', operation: 'Rework', startTime: '10:20:00', endTime: '10:35:00', duration: '15m', operator: 'OP-RW', result: 'OK', remarks: 'Retorqued' },
    { id: 5, station: 'ST-03', operation: 'Head Assembly', startTime: '10:36:00', endTime: '10:40:00', duration: '4m', operator: 'OP-003', result: 'OK', remarks: '-' }
  ];

  const columns = [
    { header: 'Station', accessor: 'station' },
    { header: 'Operation', accessor: 'operation' },
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Result', accessor: 'result' },
    { header: 'Remarks', accessor: 'remarks' },
  ];

  const exportToExcel = () => {
    exportToXLSX('GenealogyReport.xlsx', [
      { name: 'Engine Summary', rows: [['Engine UID', 'Engine Status', 'Total Stations', 'Total Rework Count', 'Assembly Duration'], [searchUID, 'OK', 4, 1, '40m']] },
      { name: 'Station History', rows: [['Station', 'Operation', 'Start Time', 'End Time', 'Duration', 'Operator', 'Result', 'Remarks'], ...mockHistoryData.map(r => [r.station, r.operation, r.startTime, r.endTime, r.duration, r.operator, r.result, r.remarks])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Genealogy Report"
        icon={GitBranch}
        onExcelClick={exportToExcel}
        filters={[
          { type: 'search', label: 'Engine UID', value: searchUID, onChange: setSearchUID, placeholder: 'Enter Engine UID...' }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        {!searchUID ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow border border-slate-200">
            <p className="text-slate-500 font-medium">Enter Engine UID to view complete history</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Engine Status" value="OK" trend="neutral" color="green" />
              <StatCard title="Total Stations Passed" value="4" trend="up" color="blue" />
              <StatCard title="Total Rework Count" value="1" trend="down" color="red" />
              <StatCard title="Assembly Duration" value="40m" trend="neutral" color="yellow" />
            </div>
            <div className="card p-4 flex-1">
              <h3 className="text-sm font-bold text-brand-dark mb-3">Station History</h3>
              <DataTable columns={columns} data={mockHistoryData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
