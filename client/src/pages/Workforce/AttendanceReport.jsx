import React, { useState, useMemo } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import useReportFilters from '../../hooks/useReportFilters';
import useFilterOptions from '../../hooks/useFilterOptions';
import { generateTimeLabels } from '../../utils/timeDataGenerator';
import StandardFilterBar from '../../components/StandardFilterBar';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AttendanceReport() {
  const { period, shift, getBaseFilters } = useReportFilters();
  const filterOptions = useFilterOptions();
  
  const [line, setLine] = useState('All');
  const [dbData, setDbData] = useState(null);

  React.useEffect(() => {
    fetch(`/api/workforce/attendance?period=${period}&shift=${shift}`)
      .then(res => res.json())
      .then(data => setDbData(data))
      .catch(err => console.error(err));
  }, [period, shift]);

  const allTableData = dbData?.table || [
    { id: '3', operator: 'Rahul Sharma', line: 'Line 1', shift: 'Shift 1', inTime: '06:00', outTime: '14:00', status: 'Present', hoursWorked: 8 },
    { id: '4', operator: 'Priya Singh', line: 'Line 2', shift: 'Shift 1', inTime: '06:00', outTime: '14:00', status: 'Present', hoursWorked: 8 },
    { id: '5', operator: 'Amit Kumar', line: 'Line 1', shift: 'Shift 1', inTime: '06:00', outTime: '14:00', status: 'Present', hoursWorked: 8 },
    { id: '6', operator: 'Neha Verma', line: 'Line 2', shift: 'Shift 1', inTime: '06:15', outTime: '14:00', status: 'Late', hoursWorked: 7.75 },
    { id: '7', operator: 'Vikram Patel', line: 'Line 1', shift: 'Shift 1', inTime: '06:00', outTime: '14:00', status: 'Present', hoursWorked: 8 },
    { id: '8', operator: 'Sneha Gupta', line: 'Line 2', shift: 'Shift 1', inTime: '06:00', outTime: '14:00', status: 'Present', hoursWorked: 8 }
  ];

  const tableData = allTableData.filter(d => 
    line === 'All' || d.line === line
  );

  const kpiData = dbData?.kpiData || { 
    scheduled: 8, 
    present: 7, 
    absent: 1, 
    attendancePct: 94.6 
  };
  
  const trendData = useMemo(() => {
    return generateTimeLabels(period, shift).map((label, idx) => ({
      date: label,
      pct: 94 + (idx % 3)
    }));
  }, [period, shift]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-amber-100 text-amber-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { header: 'Operator', accessor: 'operator' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'In Time', accessor: 'inTime' },
    { header: 'Out Time', accessor: 'outTime' },
    { header: 'Status', accessor: 'status', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(val)}`}>{val}</span>
    )},
    { header: 'Hours Worked', accessor: 'hoursWorked' }
  ];

  const exportToExcel = () => {
    exportToXLSX('AttendanceReport.xlsx', [
      { name: 'KPI', rows: [['Metric', 'Value'], ['Total Scheduled', kpiData.scheduled], ['Present', kpiData.present], ['Absent', kpiData.absent], ['Attendance %', `${kpiData.attendancePct}%`]] },
      { name: 'Attendance Details', rows: [['Operator', 'Shift', 'In Time', 'Out Time', 'Status', 'Hours Worked'], ...tableData.map(d => [d.operator, d.shift, d.inTime, d.outTime, d.status, d.hoursWorked])] }
    ]);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      <StandardFilterBar
        title="Attendance Report"
        icon={CalendarCheck2}
        period={period}
        onExcelClick={exportToExcel}
        filters={[
          ...getBaseFilters(),
          { type: 'dropdown', label: 'Line', options: filterOptions.lines, value: line, onChange: setLine }
        ]}
      />
      <div className="flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Total Scheduled" value={kpiData.scheduled} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Present" value={kpiData.present} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Absent" value={kpiData.absent} />
          <StatCard period={typeof period !== "undefined" ? period : "Month"} title="Attendance %" value={`${kpiData.attendancePct}%`} />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Daily Attendance % Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pct" stroke="#0369a1" name="Attendance %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4 flex-1">
          <h3 className="text-sm font-bold text-brand-dark mb-3">Attendance Details</h3>
          <DataTable columns={columns} data={tableData} />
        </div>
      </div>
    </div>
  );
}
