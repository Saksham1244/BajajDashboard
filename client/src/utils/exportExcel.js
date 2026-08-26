import * as XLSX from 'xlsx';

/**
 * Export data to a multi-sheet XLSX file.
 * @param {string} filename - e.g. "Production_Report.xlsx"
 * @param {Array<{name: string, rows: Array<Array>}>} sheets
 *   Each sheet: { name: "Sheet Tab Name", rows: [['Col1','Col2'], [val1, val2], ...] }
 */
export const exportToXLSX = (filename, sheets) => {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31)); // Excel tab name max 31 chars
  });
  XLSX.writeFile(wb, filename);
};
