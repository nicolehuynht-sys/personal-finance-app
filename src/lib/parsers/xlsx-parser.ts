import * as XLSX from "xlsx";

export function parseXLSX(
  buffer: ArrayBuffer
): { headers: string[]; rows: Record<string, string>[] } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("No sheets found in workbook");

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  if (jsonData.length === 0) throw new Error("Sheet is empty");

  const headers = Object.keys(jsonData[0]);
  return { headers, rows: jsonData };
}
