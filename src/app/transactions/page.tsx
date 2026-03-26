"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { TransactionList } from "@/components/transactions/TransactionList";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, Category } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function TransactionsPage() {
  const { userId } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order");
    if (data) setCategories(data);
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(200);
    if (data) {
      setTransactions(
        data.map((t: Record<string, unknown>) => ({
          ...t,
          category: t.category || undefined,
        })) as Transaction[]
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  // Get unique parent categories for filter dropdown
  const parentCategories = categories.filter((c) => !c.parent_id);

  // Current month in YYYY-MM
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const filtered = transactions.filter((t) => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (activeFilter === "month" && !t.date.startsWith(currentMonth)) {
      return false;
    }
    if (activeFilter === "category" && selectedCategory) {
      const matchesDirect = t.category_id === selectedCategory;
      const matchesParent = t.category?.parent_id === selectedCategory;
      if (!matchesDirect && !matchesParent) return false;
    }
    return true;
  });

  return (
    <>
      <Header title="Transaction History" />

      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <div className="px-6 py-3">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-silver-metallic">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-white border border-silver-light rounded-2xl pl-11 pr-4 text-sm font-medium placeholder:text-silver-metallic focus:ring-1 focus:ring-deep-green focus:border-deep-green transition-all"
              placeholder="Search by merchant or category..."
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          <button
            onClick={() => {
              setActiveFilter("all");
              setSelectedCategory(null);
              setCategoryDropdownOpen(false);
            }}
            className={`flex h-9 shrink-0 items-center gap-x-1.5 rounded-full px-5 ${
              activeFilter === "all"
                ? "bg-deep-green text-white"
                : "bg-white border border-silver-light text-slate-700"
            }`}
          >
            <span className="text-[13px] font-semibold">All Activity</span>
          </button>

          <button
            onClick={() => {
              setActiveFilter(activeFilter === "month" ? "all" : "month");
              setSelectedCategory(null);
              setCategoryDropdownOpen(false);
            }}
            className={`flex h-9 shrink-0 items-center gap-x-1.5 rounded-full px-5 ${
              activeFilter === "month"
                ? "bg-deep-green text-white"
                : "bg-white border border-silver-light text-slate-700"
            }`}
          >
            <span className="text-[13px] font-semibold">This Month</span>
          </button>

          {/* Category filter with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (activeFilter === "category") {
                  setCategoryDropdownOpen(!categoryDropdownOpen);
                } else {
                  setActiveFilter("category");
                  setCategoryDropdownOpen(true);
                }
              }}
              className={`flex h-9 shrink-0 items-center gap-x-1.5 rounded-full px-5 ${
                activeFilter === "category"
                  ? "bg-deep-green text-white"
                  : "bg-white border border-silver-light text-slate-700"
              }`}
            >
              <span className="text-[13px] font-semibold">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name || "Category"
                  : "Category"}
              </span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl border border-silver-light shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveFilter("all");
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                >
                  All Categories
                </button>
                {parentCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? "text-deep-green font-semibold"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {cat.icon || "category"}
                    </span>
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="px-6 pb-32 lg:pb-8">
          {loading ? (
            <div className="text-center py-12 text-silver-metallic">Loading transactions...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-silver-metallic mb-2">receipt_long</span>
              <p className="text-silver-metallic text-sm">
                {transactions.length === 0
                  ? "No transactions yet. Import a bank statement to get started."
                  : "No transactions match your filters."}
              </p>
            </div>
          ) : (
            <TransactionList
              transactions={filtered}
              allCategories={categories}
              onRecategorize={async (txId, newCatId, createRule) => {
                try {
                  const res = await fetch("/api/categorize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      transactionId: txId,
                      newCategoryId: newCatId,
                      createRule,
                    }),
                  });
                  const result = await res.json();
                  if (!res.ok) {
                    toast.error(result.error || "Failed to recategorize");
                  } else {
                    toast.success(
                      createRule && result.retroactiveCount > 0
                        ? `Updated ${result.retroactiveCount + 1} transactions`
                        : "Category updated"
                    );
                    fetchTransactions();
                  }
                } catch {
                  toast.error("Failed to recategorize");
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
