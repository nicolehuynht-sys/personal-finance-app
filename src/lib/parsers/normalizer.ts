import type { NormalizedTransaction } from "@/lib/types";

export type BankProfile = {
  institution: string;
  columnMap: {
    date: string[];
    description: string[];
    amount: string[];
    credit?: string[];
    debit?: string[];
    transactionType?: string[];   // Column that says "Debit"/"Credit"
  };
  dateFormat: string;
  amountSign: "natural" | "inverted";
  /** When true, use transactionType column to determine sign instead of split credit/debit columns */
  useTransactionTypeColumn?: boolean;
};

const BANK_PROFILES: BankProfile[] = [
  {
    institution: "Scotiabank VISA",
    columnMap: {
      date: ["Date"],
      description: ["Description"],
      amount: ["Amount"],
      transactionType: ["Type of Transaction"],
    },
    dateFormat: "YYYY-MM-DD",
    amountSign: "natural",
    useTransactionTypeColumn: true,
  },
  {
    institution: "Scotiabank Chequing",
    columnMap: {
      date: ["Date"],
      description: ["Description"],
      amount: [],            // No single amount column — uses split Debit/Credit
      credit: ["Credit"],
      debit: ["Debit"],
    },
    dateFormat: "MM/DD/YYYY",
    amountSign: "natural",
  },
  {
    institution: "Chase",
    columnMap: {
      date: ["Transaction Date", "Posting Date"],
      description: ["Description"],
      amount: ["Amount"],
    },
    dateFormat: "MM/DD/YYYY",
    amountSign: "natural",
  },
  {
    institution: "Amex",
    columnMap: {
      date: ["Date"],
      description: ["Description", "Extended Details"],
      amount: ["Amount"],
    },
    dateFormat: "MM/DD/YYYY",
    amountSign: "inverted",
  },
  {
    institution: "Bank of America",
    columnMap: {
      date: ["Date", "Posted Date"],
      description: ["Payee", "Description"],
      amount: ["Amount"],
    },
    dateFormat: "MM/DD/YYYY",
    amountSign: "natural",
  },
  {
    institution: "Generic",
    columnMap: {
      date: ["date", "Date", "DATE", "transaction_date", "Transaction Date", "Posting Date", "Posted Date"],
      description: ["description", "Description", "DESCRIPTION", "merchant", "Merchant", "Payee", "memo", "Memo"],
      amount: ["amount", "Amount", "AMOUNT", "total", "Total"],
      credit: ["credit", "Credit", "CREDIT", "Deposit"],
      debit: ["debit", "Debit", "DEBIT", "Withdrawal"],
    },
    dateFormat: "MM/DD/YYYY",
    amountSign: "natural",
  },
];

export function detectBankProfile(headers: string[]): BankProfile {
  const headerSet = new Set(headers.map((h) => h.trim()));

  for (const profile of BANK_PROFILES) {
    if (profile.institution === "Generic") continue;

    const dateMatch = profile.columnMap.date.some((col) => headerSet.has(col));
    const descMatch = profile.columnMap.description.some((col) => headerSet.has(col));

    // Amount can come from: a single Amount column, split Debit/Credit columns, or Type+Amount
    const amountMatch = profile.columnMap.amount.length > 0
      ? profile.columnMap.amount.some((col) => headerSet.has(col))
      : false;
    const splitMatch = profile.columnMap.credit?.some((col) => headerSet.has(col)) &&
                       profile.columnMap.debit?.some((col) => headerSet.has(col));
    const typeMatch = profile.columnMap.transactionType?.some((col) => headerSet.has(col)) &&
                      profile.columnMap.amount.some((col) => headerSet.has(col));

    if (dateMatch && descMatch && (amountMatch || splitMatch || typeMatch)) {
      return profile;
    }
  }

  // Fall back to generic profile
  return BANK_PROFILES[BANK_PROFILES.length - 1];
}

function findColumn(row: Record<string, string>, candidates: string[]): string {
  for (const col of candidates) {
    if (col in row && row[col] !== undefined && row[col] !== "") {
      return row[col];
    }
  }
  return "";
}

function parseDate(dateStr: string): string {
  // Try common date formats and return YYYY-MM-DD
  const cleaned = dateStr.trim();

  // MM/DD/YYYY or M/D/YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // YYYY-MM-DD (already ISO)
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return cleaned;

  // MM-DD-YYYY
  const dashMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, m, d, y] = dashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Fallback: try JS Date
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  throw new Error(`Cannot parse date: "${dateStr}"`);
}

function parseAmount(amountStr: string): number {
  // Remove currency symbols, commas, spaces
  const cleaned = amountStr.replace(/[$,\s]/g, "").trim();
  // Handle parentheses as negative: (100.00) -> -100.00
  const parenMatch = cleaned.match(/^\((.+)\)$/);
  if (parenMatch) {
    return -parseFloat(parenMatch[1]);
  }
  return parseFloat(cleaned);
}

export function normalizeRow(
  row: Record<string, string>,
  profile: BankProfile
): NormalizedTransaction {
  const dateStr = findColumn(row, profile.columnMap.date);
  const description = findColumn(row, profile.columnMap.description);

  let amount: number;

  if (profile.useTransactionTypeColumn && profile.columnMap.transactionType) {
    // Scotia VISA pattern: Amount is always positive, "Type of Transaction" determines sign
    const amountStr = findColumn(row, profile.columnMap.amount);
    const txType = findColumn(row, profile.columnMap.transactionType).toLowerCase().trim();
    amount = parseAmount(amountStr);
    // Credits (payments) are income/positive, Debits (charges) are expenses/negative
    if (txType === "debit") {
      amount = -Math.abs(amount);
    } else if (txType === "credit") {
      amount = Math.abs(amount);
    }
    // Note: Scotia VISA already puts negative sign on credit amounts, so handle that
    // If amount is already negative and type is Credit, it's a payment (positive)
    if (txType === "credit" && amount < 0) {
      amount = Math.abs(amount);
    }
  } else if (profile.columnMap.credit && profile.columnMap.debit) {
    // Split credit/debit columns (e.g., Scotiabank chequing)
    const creditStr = findColumn(row, profile.columnMap.credit);
    const debitStr = findColumn(row, profile.columnMap.debit);

    if (creditStr && !isNaN(parseAmount(creditStr))) {
      amount = Math.abs(parseAmount(creditStr)); // Income is positive
    } else if (debitStr && !isNaN(parseAmount(debitStr))) {
      amount = -Math.abs(parseAmount(debitStr)); // Expense is negative
    } else {
      // Fall back to amount column
      const amountStr = findColumn(row, profile.columnMap.amount);
      amount = parseAmount(amountStr);
    }
  } else {
    const amountStr = findColumn(row, profile.columnMap.amount);
    amount = parseAmount(amountStr);
  }

  // Invert sign for banks like Amex where charges are positive
  if (profile.amountSign === "inverted") {
    amount = -amount;
  }

  if (!dateStr) throw new Error(`Missing date in row: ${JSON.stringify(row)}`);
  if (!description) throw new Error(`Missing description in row: ${JSON.stringify(row)}`);
  if (isNaN(amount)) throw new Error(`Invalid amount in row: ${JSON.stringify(row)}`);

  return {
    date: parseDate(dateStr),
    description: description.trim(),
    amount,
    currency: "USD",
    raw_data: row,
  };
}

export function normalizeRows(
  rows: Record<string, string>[],
  headers: string[]
): { transactions: NormalizedTransaction[]; errors: string[] } {
  const profile = detectBankProfile(headers);
  const transactions: NormalizedTransaction[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const normalized = normalizeRow(rows[i], profile);
      transactions.push(normalized);
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { transactions, errors };
}
