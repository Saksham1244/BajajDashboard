/**
 * Robust filter matching utility that normalizes whitespace, dashes, and casing.
 * Handles variations like "Line 1" vs "Line1", "Line2" vs "Line 2", "Shift 1" vs "Shift1", "Demo (Block Assly)" vs "Demo".
 */
export function normStr(str) {
  if (str === null || str === undefined) return '';
  return String(str).toLowerCase().replace(/[\s_\-\(\)\/]+/g, '');
}

export function matchFilter(itemVal, filterVal) {
  if (!filterVal || filterVal === 'All') return true;
  if (itemVal === null || itemVal === undefined) return false;
  
  const nItem = normStr(itemVal);
  const nFilter = normStr(filterVal);
  
  if (nItem === nFilter) return true;
  if (nItem.includes(nFilter) || nFilter.includes(nItem)) return true;
  return false;
}

export default matchFilter;
