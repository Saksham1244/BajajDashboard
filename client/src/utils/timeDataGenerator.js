/**
 * Generates X-Axis labels based on selected period and shift.
 */
export function generateTimeLabels(period, shift) {
  if (period === 'Shift') {
    if (shift === 'Shift 1') {
      return ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];
    }
    return ['15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
  }
  if (period === 'Day') {
    return ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
  }
  if (period === 'Week') {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }
  if (period === 'Month') {
    return Array.from({length: 30}, (_, i) => (i+1).toString());
  }
  return [];
}
