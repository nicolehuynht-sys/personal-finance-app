"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TransactionList } from "@/components/transactions/TransactionList";
import type { Transaction, Category } from "@/lib/types";
import { DEV_USER_ID } from "@/lib/utils";

// Sample categories (same as categories page)
const CATEGORIES: Category[] = [
  { id: "10000000-0000-0000-0000-000000000002", user_id: DEV_USER_ID, parent_id: null, name: "Food & Beverage", icon: "restaurant", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000003", user_id: DEV_USER_ID, parent_id: null, name: "Transport", icon: "directions_car", is_system: true, exclude_from_totals: false, sort_order: 3, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000004", user_id: DEV_USER_ID, parent_id: null, name: "Entertainment", icon: "movie", is_system: true, exclude_from_totals: false, sort_order: 4, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000013", user_id: DEV_USER_ID, parent_id: null, name: "Income", icon: "payments", is_system: true, exclude_from_totals: false, sort_order: 13, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000014", user_id: DEV_USER_ID, parent_id: null, name: "Investment", icon: "trending_up", is_system: true, exclude_from_totals: false, sort_order: 14, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000001", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000002", name: "Groceries", icon: "shopping_cart", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000002", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000002", name: "Dining Out", icon: "restaurant_menu", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000005", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000003", name: "Fuel", icon: "local_gas_station", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000007", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000004", name: "Subscriptions", icon: "subscriptions", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000011", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000014", name: "Dividends", icon: "savings", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "t1", user_id: DEV_USER_ID, upload_id: null, account_id: null,
    date: "2024-10-24", description: "Coffee Shop", amount: -12.45, currency: "USD",
    category_id: "20000000-0000-0000-0000-000000000002", categorization_method: "system_rule",
    ai_confidence: null, notes: null, is_duplicate: false, raw_data: null,
    created_at: "", updated_at: "",
    category: CATEGORIES.find((c) => c.id === "20000000-0000-0000-0000-000000000002"),
  },
  {
    id: "t2", user_id: DEV_USER_ID, upload_id: null, account_id: null,
    date: "2024-10-24", description: "Music Streamer", amount: -9.99, currency: "USD",
    category_id: "20000000-0000-0000-0000-000000000007", categorization_method: "system_rule",
    ai_confidence: null, notes: null, is_duplicate: false, raw_data: null,
    created_at: "", updated_at: "",
    category: CATEGORIES.find((c) => c.id === "20000000-0000-0000-0000-000000000007"),
  },
  {
    id: "t3", user_id: DEV_USER_ID, upload_id: null, account_id: null,
    date: "2024-10-23", description: "Dividends Payout", amount: 1000.00, currency: "USD",
    category_id: "20000000-0000-0000-0000-000000000011", categorization_method: "system_rule",
    ai_confidence: null, notes: null, is_duplicate: false, raw_data: null,
    created_at: "", updated_at: "",
    category: CATEGORIES.find((c) => c.id === "20000000-0000-0000-0000-000000000011"),
  },
  {
    id: "t4", user_id: DEV_USER_ID, upload_id: null, account_id: null,
    date: "2024-10-23", description: "Gas Station", amount: -54.12, currency: "USD",
    category_id: "20000000-0000-0000-0000-000000000005", categorization_method: "system_rule",
    ai_confidence: null, notes: null, is_duplicate: false, raw_data: null,
    created_at: "", updated_at: "",
    category: CATEGORIES.find((c) => c.id === "20000000-0000-0000-0000-000000000005"),
  },
  {
    id: "t5", user_id: DEV_USER_ID, upload_id: null, account_id: null,
    date: "2024-10-23", description: "Market Grocers", amount: -142.08, currency: "USD",
    category_id: "20000000-0000-0000-0000-000000000001", categorization_method: "system_rule",
    ai_confidence: null, notes: null, is_duplicate: false, raw_data: null,
    created_at: "", updated_at: "",
    category: CATEGORIES.find((c) => c.id === "20000000-0000-0000-0000-000000000001"),
  },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Get unique parent categories for filter dropdown
  const parentCategories = CATEGORIES.filter((c) => !c.parent_id);

  // Get current month in YYYY-MM format for "This Month" filter
  const currentMonth = "2024-10"; // Sample data is Oct 2024

  const filtered = SAMPLE_TRANSACTIONS.filter((t) => {
    // Search filter
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Date filter
    if (activeFilter === "month" && !t.date.startsWith(currentMonth)) {
      return false;
    }
    // Category filter
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
                  ? CATEGORIES.find((c) => c.id === selectedCategory)?.name || "Category"
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
          <TransactionList
            transactions={filtered}
            allCategories={CATEGORIES}
            onRecategorize={(txId, newCatId, createRule) => {
              console.log("Recategorize", txId, newCatId, createRule);
              // TODO: call /api/categorize
            }}
          />
        </div>
      </div>
    </>
  );
}
