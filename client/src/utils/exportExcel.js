import * as XLSX from 'xlsx';

/**
 * Clean and sanitize sheet names for Excel compatibility:
 * - Max 31 characters
 * - No forbidden characters: \ / ? * [ ] :
 * - Non-empty fallback
 */
function sanitizeSheetName(name, fallbackIndex = 1) {
  if (!name || typeof name !== 'string') {
    return `Sheet${fallbackIndex}`;
  }
  // Replace invalid characters with underscore
  let cleaned = name.replace(/[\\/?*\[\]:]/g, '_').trim();
  // Excel limits sheet names to 31 chars
  if (cleaned.length > 31) {
    cleaned = cleaned.substring(0, 31).trim();
  }
  return cleaned || `Sheet${fallbackIndex}`;
}

/**
 * Deduplicate sheet names within a single workbook
 */
function getUniqueSheetNames(sheets) {
  const seen = new Map();
  return sheets.map((sheet, index) => {
    const rawName = sheet?.name || `Sheet${index + 1}`;
    let sanitized = sanitizeSheetName(rawName, index + 1);
    
    if (seen.has(sanitized.toLowerCase())) {
      const count = seen.get(sanitized.toLowerCase()) + 1;
      seen.set(sanitized.toLowerCase(), count);
      const suffix = `_${count}`;
      sanitized = sanitized.substring(0, 31 - suffix.length) + suffix;
    } else {
      seen.set(sanitized.toLowerCase(), 1);
    }
    return sanitized;
  });
}

/**
 * Calculate optimal column widths based on content
 */
function calculateColumnWidths(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const colWidths = [];

  rows.forEach(row => {
    if (Array.isArray(row)) {
      row.forEach((cell, colIndex) => {
        let cellStr = '';
        if (cell === null || cell === undefined) {
          cellStr = '';
        } else if (typeof cell === 'object') {
          cellStr = JSON.stringify(cell);
        } else {
          cellStr = String(cell);
        }
        // Handle multiline cells
        const maxLineLen = Math.max(...cellStr.split('\n').map(l => l.length));
        colWidths[colIndex] = Math.max(colWidths[colIndex] || 0, maxLineLen);
      });
    }
  });

  return colWidths.map(w => ({
    wch: Math.min(Math.max((w || 0) + 3, 12), 48) // Min 12, max 48 characters width
  }));
}

/**
 * Sanitize row cells for clean Excel serialization
 */
function sanitizeRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [['No records available']];
  }

  return rows.map(row => {
    if (!Array.isArray(row)) return [row ?? ''];
    return row.map(cell => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell === 'number') return isNaN(cell) ? 0 : cell;
      if (typeof cell === 'boolean') return cell ? 'YES' : 'NO';
      return cell;
    });
  });
}

/**
 * Export data to a multi-sheet XLSX file.
 * @param {string} filename - e.g. "Production_Report.xlsx"
 * @param {Array<{name: string, rows: Array<Array>}>} sheets
 *   Each sheet: { name: "Sheet Tab Name", rows: [['Col1','Col2'], [val1, val2], ...] }
 */
export const exportToXLSX = (filename, sheets = []) => {
  try {
    const validFilename = filename?.endsWith('.xlsx') ? filename : `${filename || 'Report'}.xlsx`;
    const wb = XLSX.utils.book_new();

    const safeSheets = Array.isArray(sheets) && sheets.length > 0 
      ? sheets 
      : [{ name: 'Report Data', rows: [['No data available']] }];

    const uniqueNames = getUniqueSheetNames(safeSheets);

    safeSheets.forEach((sheet, idx) => {
      const sanitizedRows = sanitizeRows(sheet?.rows);
      const ws = XLSX.utils.aoa_to_sheet(sanitizedRows);

      // Auto-fit column widths
      ws['!cols'] = calculateColumnWidths(sanitizedRows);

      const sheetName = uniqueNames[idx];
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Write file
    XLSX.writeFile(wb, validFilename);
  } catch (err) {
    console.error('Failed to export XLSX file:', err);
  }
};

