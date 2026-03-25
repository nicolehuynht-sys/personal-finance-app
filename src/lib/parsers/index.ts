import { parseCSV } from "./csv-parser";
import { parseXLSX } from "./xlsx-parser";
import { normalizeRows } from "./normalizer";
import type { NormalizedTransaction } from "@/lib/types";

export async function parseFile(
  file: File
): Promise<{ transactions: NormalizedTransaction[]; errors: string[] }> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  let headers: string[];
  let rows: Record<string, string>[];

  if (extension === "csv") {
    const text = await file.text();
    const result = parseCSV(text);
    headers = result.headers;
    rows = result.rows;
  } else if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    const result = parseXLSX(buffer);
    headers = result.headers;
    rows = result.rows;
  } else {
    throw new Error(`Unsupported file type: .${extension}`);
  }

  if (rows.length === 0) {
    throw new Error("File contains no data rows");
  }

  return normalizeRows(rows, headers);
}

export function deduplicateTransactions(
  incoming: NormalizedTransaction[],
  existing: Array<{ date: string; description: string; amount: number }>
): { unique: NormalizedTransaction[]; duplicateCount: number } {
  const existingHashes = new Set(
    existing.map((t) => `${t.date}|${t.description}|${t.amount}`)
  );

  const unique: NormalizedTransaction[] = [];
  let duplicateCount = 0;

  for (const tx of incoming) {
    const hash = `${tx.date}|${tx.description}|${tx.amount}`;
    if (existingHashes.has(hash)) {
      duplicateCount++;
    } else {
      unique.push(tx);
      existingHashes.add(hash); // Prevent duplicates within the same file
    }
  }

  return { unique, duplicateCount };
}
