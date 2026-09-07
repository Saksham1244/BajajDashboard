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
  
  const activeShift = getActiveShift();
  const [shift, setShift] = useState('All');

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    const todayStr = getToday();
    if (newPeriod === 'Shift') {
      setStartDate(todayStr);
      setEndDate(todayStr);
      setShift(getActiveShift());
    } else if (newPeriod === 'Day') {
      setStartDate(todayStr);
      setEndDate(todayStr);
      setShift('All');
    } else if (newPeriod === 'Week') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 7);
      setStartDate(new Date(past7.getTime() - past7.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
      setEndDate(todayStr);
      setShift('All');
    } else if (newPeriod === 'Month') {
      const past30 = new Date(today);
      past30.setDate(today.getDate() - 30);
      setStartDate(new Date(past30.getTime() - past30.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
      setEndDate(todayStr);
      setShift('All');
    }
  };

  const getBaseFilters = () => {
    const base = [
      { type: 'period', value: period, onChange: handlePeriodChange },
      { type: 'daterange', from: startDate, onFromChange: setStartDate, to: endDate, onToChange: setEndDate }
    ];

    // Only show Shift dropdown when period is NOT 'Shift' (e.g. Day, Week, Month)
    if (period !== 'Shift') {
      base.push({
        type: 'dropdown',
        label: 'Shift',
        options: ['All', 'Shift 1', 'Shift 2'],
        value: shift,
        onChange: setShift,
        activeShift: activeShift
      });
    }

    return base;
  };

  // When period is 'Shift', effective shift is always current activeShift
  const effectiveShift = period === 'Shift' ? activeShift : shift;

  return {
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    shift: effectiveShift,
    setShift,
    activeShift,
    getBaseFilters
  };
}

export default useReportFilters;


