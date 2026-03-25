import type { Transaction, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CategoryPill } from "./CategoryPill";

interface TransactionRowProps {
  transaction: Transaction;
  allCategories: Category[];
  onRecategorize: (transactionId: string, newCategoryId: string, createRule: boolean) => void;
}

export function TransactionRow({
  transaction,
  allCategories,
  onRecategorize,
}: TransactionRowProps) {
  const category = transaction.category || null;
  const parentCategory = category?.parent_id
    ? allCategories.find((c) => c.id === category.parent_id) || null
    : null;

  const isIncome = transaction.amount > 0;
  const icon = category?.icon || (isIncome ? "payments" : "receipt_long");

  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
            isIncome
              ? "bg-deep-green/5 border-deep-green/10 text-deep-green"
              : "bg-white border-silver-light text-silver-metallic"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-bold text-slate-900">
            {transaction.description}
          </span>
          <CategoryPill
            category={category}
            parentCategory={parentCategory}
            allCategories={allCategories}
            onRecategorize={(newCategoryId, createRule) =>
              onRecategorize(transaction.id, newCategoryId, createRule)
            }
          />
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-[16px] font-bold ${
            isIncome ? "text-forest-light" : "text-slate-900"
          }`}
        >
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-[11px] text-silver-metallic font-medium">
          {new Date(transaction.date + "T12:00:00").toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>
    </div>
  );
}
