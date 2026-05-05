import type { NormalizedTransaction } from "@/lib/types";

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
