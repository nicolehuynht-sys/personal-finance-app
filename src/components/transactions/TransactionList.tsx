import type { Transaction, Category } from "@/lib/types";
import { formatDateGroup, formatCurrency } from "@/lib/utils";
import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  transactions: Transaction[];
  allCategories: Category[];
  onRecategorize: (transactionId: string, newCategoryId: string, createRule: boolean) => void;
}

export function TransactionList({
  transactions,
  allCategories,
  onRecategorize,
}: TransactionListProps) {
  // Group by date
  const grouped = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const list = grouped.get(t.date) || [];
    list.push(t);
    grouped.set(t.date, list);
  });

  const sortedDates = Array.from(grouped.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="material-symbols-outlined text-4xl text-silver-light mb-2">
          receipt_long
        </span>
        <p className="text-sm text-silver-metallic">No transactions found</p>
      </div>
    );
  }

  return (
    <div>
      {sortedDates.map((date) => {
        const dayTransactions = grouped.get(date)!;
        const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

        return (
          <div key={date} className="mt-8 first:mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic">
                {formatDateGroup(date)}
              </h3>
              <span className="text-[12px] font-semibold text-silver-metallic">
                {formatCurrency(dayTotal)}
              </span>
            </div>
            <div className="space-y-5">
              {dayTransactions.map((transaction, idx) => (
                <div key={transaction.id}>
                  <TransactionRow
                    transaction={transaction}
                    allCategories={allCategories}
                    onRecategorize={onRecategorize}
                  />
                  {idx < dayTransactions.length - 1 && (
                    <div className="h-px bg-silver-light w-full mt-5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
