import Papa from "papaparse";

/**
 * Heuristic: if the first field of the first row looks like a date (MM/DD/YYYY or YYYY-MM-DD),
 * the file likely has no header row.
 */
function looksLikeDate(value: string): boolean {
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim()) ||
         /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/**
 * Known headerless CSV layouts. When a CSV has no header row, we try to
 * assign synthetic headers based on column count and value patterns.
 */
const HEADERLESS_LAYOUTS: {
  columnCount: number;
  headers: string[];
  detect?: (firstRow: string[]) => boolean;
}[] = [
  {
    // Scotiabank chequing: Date, Description, Debit, Credit, Balance
    columnCount: 5,
    headers: ["Date", "Description", "Debit", "Credit", "Balance"],
    detect: (row) => looksLikeDate(row[0]) && row.length === 5,
  },
  {
    // Fallback 4-column: Date, Description, Amount, Balance
    columnCount: 4,
    headers: ["Date", "Description", "Amount", "Balance"],
    detect: (row) => looksLikeDate(row[0]) && row.length === 4,
  },
];

export function parseCSV(
  fileContent: string
): { headers: string[]; rows: Record<string, string>[] } {
  // First, peek at the file to decide if it has headers
  const peek = Papa.parse<string[]>(fileContent, {
    header: false,
    preview: 1,
    skipEmptyLines: true,
  });

  const firstRow = peek.data[0] || [];
  const isHeaderless = firstRow.length > 0 && looksLikeDate(firstRow[0]);

  if (isHeaderless) {
    // Parse without headers, then assign synthetic ones
    const raw = Papa.parse<string[]>(fileContent, {
      header: false,
      skipEmptyLines: true,
    });

    // Find matching layout
    const layout = HEADERLESS_LAYOUTS.find(
      (l) => l.detect?.(firstRow) ?? l.columnCount === firstRow.length
    );
    const headers = layout
      ? layout.headers
      : firstRow.map((_, i) => `Column${i + 1}`);

    // Convert arrays to keyed objects
    const rows = raw.data.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (row[i] ?? "").trim();
      });
      return obj;
    });

    return { headers, rows };
  }

  // Normal CSV with headers
  const result = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    const criticalErrors = result.errors.filter((e) => e.type !== "FieldMismatch");
    if (criticalErrors.length > 0) {
      throw new Error(`CSV parsing error: ${criticalErrors[0].message}`);
    }
  }

  const headers = result.meta.fields || [];
  return { headers, rows: result.data };
}
