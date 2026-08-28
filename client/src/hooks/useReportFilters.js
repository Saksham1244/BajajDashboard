import { useState, useEffect } from 'react';

const getToday = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

/**
 * Calculates current plant shift based on local hour:
 * Shift 1: 06:00 - 14:00
 * Shift 2: 14:00 - 23:00
 */
export const getActiveShift = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 14) return 'Shift 1';
  if (currentHour >= 14 && currentHour < 23) return 'Shift 2';
  return 'Shift 1'; // Outside operational hours (23:00-06:00), default to upcoming Shift 1
};

export function useReportFilters() {
  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [shift, setShift] = useState(getActiveShift());

  const activeShift = getActiveShift();

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    const todayStr = getToday();
    if (newPeriod === 'Shift' || newPeriod === 'Day') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (newPeriod === 'Week') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 7);
      setStartDate(new Date(past7.getTime() - past7.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (newPeriod === 'Month') {
      const past30 = new Date(today);
      past30.setDate(today.getDate() - 30);
      setStartDate(new Date(past30.getTime() - past30.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  const getBaseFilters = () => [
    { type: 'period', value: period, onChange: handlePeriodChange },
    { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate },
    ...(period === 'Shift' ? [{
      type: 'dropdown',
      label: 'Shift',
      options: ['Shift 1', 'Shift 2'],
      value: shift,
      onChange: setShift,
      activeShift: activeShift
    }] : [])
  ];

  return {
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    shift,
    setShift,
    activeShift,
    getBaseFilters
  };
}

export default useReportFilters;

