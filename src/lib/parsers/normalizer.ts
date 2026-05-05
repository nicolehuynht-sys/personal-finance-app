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
