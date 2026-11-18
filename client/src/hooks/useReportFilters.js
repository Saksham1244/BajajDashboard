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

export function useReportFilters(allowedPeriods = ['Shift', 'Day', 'Week', 'Month']) {
  const [period, setPeriod] = useState(allowedPeriods[0] || 'Shift');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [isDateCustom, setIsDateCustom] = useState(false);

  const activeShift = getActiveShift();
  const [shift, setShift] = useState('All');

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    if (!isDateCustom && period === 'Shift') {
      setShift('All');
    }
    setIsDateCustom(true);
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    if (!isDateCustom && period === 'Shift') {
      setShift('All');
    }
    setIsDateCustom(true);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setIsDateCustom(false);
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

  const todayStr = getToday();
  const showShiftFilter = period !== 'Shift' || isDateCustom || startDate !== todayStr || endDate !== todayStr;

  const getBaseFilters = () => {
    const base = [
      { type: 'period', value: period, onChange: handlePeriodChange, periods: allowedPeriods },
      { type: 'daterange', from: startDate, onFromChange: handleStartDateChange, to: endDate, onToChange: handleEndDateChange }
    ];

    // Show Shift dropdown when period is NOT 'Shift' OR as soon as user changes Start/End date
    if (showShiftFilter) {
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

  // When period is 'Shift' and date has not been changed, effective shift is always current activeShift
  const effectiveShift = showShiftFilter ? shift : activeShift;

  return {
    period,
    setPeriod,
    startDate,
    setStartDate: handleStartDateChange,
    endDate,
    setEndDate: handleEndDateChange,
    shift: effectiveShift,
    setShift,
    activeShift,
    getBaseFilters
  };
}

export default useReportFilters;
