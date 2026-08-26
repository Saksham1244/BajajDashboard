import { useState } from 'react';

const getToday = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

export function useReportFilters() {
  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [shift, setShift] = useState('Shift 1');

  const getBaseFilters = () => [
    { type: 'period', value: period, onChange: setPeriod },
    { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
    ...(period === 'Shift' ? [{ type: 'dropdown', label: 'Shift', options: ['Shift 1', 'Shift 2'], value: shift, onChange: setShift }] : [])
  ];

  return { period, setPeriod, startDate, setStartDate, endDate, setEndDate, shift, setShift, getBaseFilters };
}

export default useReportFilters;
