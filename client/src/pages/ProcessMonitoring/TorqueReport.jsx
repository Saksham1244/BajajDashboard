import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useReportFilters } from '../../hooks/useReportFilters';

export default function TorqueReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const [device, setDevice] = useState('All');
  const [dbData, setDbData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const customFilters = [
    { type: 'dropdown', label: 'Torque Device', options: ['All', 'TD-01', 'TD-02', 'TD-03'], value: device, onChange: setDevice },
  ];

  React.useEffect(() => {
        fetch(`http://localhost:5000/api/process/torque?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => {
        setDbData(data);
              })
      .catch(err => {
        console.error(err);
              });
  }, [period, shift]);

  const torqueData = React.useMemo(() => {
    if (dbData.torqueData?.length) return dbData.torqueData;
    return [
      { engineNo: 'ENG-001', sku: 'UG5', device: 'TD-01', value: 45.2, minSpec: 40, maxSpec: 50, result: 'OK', datetime: '2023-10-25 08:30', operator: 'Opr 1' },
      { engineNo: 'ENG-002', sku: 'UG5', device: 'TD-01', value: 48.1, minSpec: 40, maxSpec: 50, result: 'OK', datetime: '2023-10-25 08:45', operator: 'Opr 1' },
      { engineNo: 'ENG-003', sku: 'STD', device: 'TD-02', value: 51.5, minSpec: 40, maxSpec: 50, result: 'NOK', datetime: '2023-10-25 09:00', operator: 'Opr 2' },
      { engineNo: 'ENG-004', sku: 'UG5', device: 'TD-01', value: 42.8, minSpec: 40, maxSpec: 50, result: 'OK', datetime: '2023-10-25 09:15', operator: 'Opr 1' },
      { engineNo: 'ENG-005', sku: 'STD', device: 'TD-02', value: 46.0, minSpec: 40, maxSpec: 50, result: 'OK', datetime: '2023-10-25 09:30', operator: 'Opr 2' },
      { engineNo: 'ENG-006', sku: 'UG5', device: 'TD-03', value: 39.5, minSpec: 40, maxSpec: 50, result: 'NOK', datetime: '2023-10-25 09:45', operator: 'Opr 3' },
    ];
  }, [dbData]);

  const kpi = dbData.kpi || {
    totalReadings: "6",
    okCount: "4",
    notOkCount: "2",
    avgTorque: 45.5
  };

  const tableColumns = [
    { header: 'Engine No', accessor: 'engineNo' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Torque Device', accessor: 'device' },
    { header: 'Torque Value (Nm)', accessor: 'value' },
    { header: 'Min Spec', accessor: 'minSpec' },
    { header: 'Max Spec', accessor: 'maxSpec' },
    { header: 'Result', accessor: 'result' },
    { header: 'Date & Time', accessor: 'datetime' },
    { header: 'Operator', accessor: 'operator' },
  ];

  const exportToExcel = () => {
    exportToXLSX('TorqueReport.xlsx', [
      { name: 'KPI Summary', rows: [['Total Readings', 'OK Count', 'NOT-OK Count', 'Avg Torque'], [kpi.totalReadings, kpi.okCount, kpi.notOkCount, kpi.avgTorque]] },
      { name: 'Torque Trend', rows: [['Engine No', 'Torque Value'], ...torqueData.map(d => [d.engineNo, d.value])] },
      { name: 'Torque Details', rows: [['Engine No', 'SKU', 'Device', 'Value', 'Min', 'Max', 'Result', 'Datetime', 'Operator'], ...torqueData.map(d => [d.engineNo, d.sku, d.device, d.value, d.minSpec, d.maxSpec, d.result, d.datetime, d.operator])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Torque Report"
        icon={Settings2}
        onExcelClick={exportToExcel}
        filters={[...getBaseFilters(), ...customFilters]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Total Readings" value={kpi.totalReadings} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="OK Count" value={kpi.okCount} color="text-green-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="NOT-OK Count" value={kpi.notOkCount} color="text-red-600" />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} autoScale title="Avg Torque (Nm)" value={kpi.avgTorque} />
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Engine-wise Torque Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={torqueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="engineNo" />
                <YAxis domain={[35, 55]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Torque Value (Nm)" stroke="#0369a1" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="minSpec" name="Min Spec" stroke="#f43f5e" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="maxSpec" name="Max Spec" stroke="#f43f5e" strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Torque Details</h3>
          <DataTable columns={tableColumns} data={torqueData} />
        </div>
      </div>
    </div>
  );
}
