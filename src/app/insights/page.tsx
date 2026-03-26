"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

type FilterMode = "month" | "year";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthlyBar = { month: string; spend: number };
type BudgetItem = { id: string; name: string; icon: string; categoryId: string; spent: number; limit: number };

export default function InsightsPage() {
  const { userId } = useAuth();
  const now = new Date();
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [monthlyBars, setMonthlyBars] = useState<MonthlyBar[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [editModal, setEditModal] = useState(false);
  const [editLimits, setEditLimits] = useState<Record<string, string>>({});
  const [years, setYears] = useState<string[]>([]);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!userId) return;
    // Fetch transactions for monthly bars
    const { data: txns } = await supabase
      .from("transactions")
      .select("date, amount, category_id, category:categories(exclude_from_totals)")
      .eq("user_id", userId)
      .eq("is_duplicate", false);

    const allTxns = (txns || []).filter(
      (t: Record<string, unknown>) => {
        const cat = t.category;
        if (Array.isArray(cat)) return !cat[0]?.exclude_from_totals;
        if (cat && typeof cat === "object") return !(cat as { exclude_from_totals: boolean }).exclude_from_totals;
        return true;
      }
    );

    // Compute available years
    const yearSet = new Set<string>();
    allTxns.forEach((t: { date: string }) => yearSet.add(t.date.substring(0, 4)));
    if (yearSet.size > 0) {
      setYears(Array.from(yearSet).sort().reverse());
    } else {
      setYears([String(now.getFullYear())]);
    }

    // Build monthly spend bars for selected year
    const monthlyMap = new Map<string, number>();
    for (const t of allTxns as Array<{ date: string; amount: number }>) {
      if (t.amount >= 0) continue; // Skip income
      const ym = t.date.substring(0, 7);
      if (!ym.startsWith(selectedYear)) continue;
      monthlyMap.set(ym, (monthlyMap.get(ym) || 0) + Math.abs(t.amount));
    }

    const bars: MonthlyBar[] = [];
    for (let m = 0; m < 12; m++) {
      const key = `${selectedYear}-${String(m + 1).padStart(2, "0")}`;
      bars.push({ month: MONTHS[m].toUpperCase(), spend: monthlyMap.get(key) || 0 });
    }
    setMonthlyBars(bars);

    // Compute total spending for the selected period
    const monthIdx = MONTHS.indexOf(selectedMonth);
    let periodTotal = 0;
    if (filterMode === "month" && monthIdx >= 0) {
      const key = `${selectedYear}-${String(monthIdx + 1).padStart(2, "0")}`;
      periodTotal = monthlyMap.get(key) || 0;
    } else {
      periodTotal = Array.from(monthlyMap.values()).reduce((a, b) => a + b, 0);
    }
    setTotalSpending(Math.round(periodTotal * 100) / 100);

    // Fetch all categories with details
    const { data: allCats } = await supabase
      .from("categories")
      .select("id, parent_id, name, icon, exclude_from_totals")
      .eq("user_id", userId);

    const catMap = new Map<string, { name: string; icon: string; parent_id: string | null; exclude: boolean }>();
    const childToParent = new Map<string, string>();
    (allCats || []).forEach((c: { id: string; parent_id: string | null; name: string; icon: string; exclude_from_totals: boolean }) => {
      catMap.set(c.id, { name: c.name, icon: c.icon || "category", parent_id: c.parent_id, exclude: c.exclude_from_totals });
      if (c.parent_id) childToParent.set(c.id, c.parent_id);
    });

    // Fetch budgets
    const { data: budgetRows } = await supabase
      .from("budgets")
      .select("category_id, monthly_limit")
      .eq("user_id", userId);

    const budgetMap = new Map<string, number>();
    (budgetRows || []).forEach((b: { category_id: string; monthly_limit: number }) => {
      budgetMap.set(b.category_id, Number(b.monthly_limit));
    });

    // Compute spend per category for current period, rolling up children into parents
    const currentMonthKey = `${selectedYear}-${String(monthIdx + 1).padStart(2, "0")}`;
    const catSpend = new Map<string, number>();
    for (const t of allTxns as Array<{ date: string; amount: number; category_id?: string }>) {
      if (t.amount >= 0) continue;
      const tMonth = filterMode === "month" ? currentMonthKey : selectedYear;
      const tKey = filterMode === "month" ? t.date.substring(0, 7) : t.date.substring(0, 4);
      if (tKey !== tMonth) continue;
      if (t.category_id) {
        catSpend.set(t.category_id, (catSpend.get(t.category_id) || 0) + Math.abs(t.amount));
        const parentId = childToParent.get(t.category_id);
        if (parentId) {
          catSpend.set(parentId, (catSpend.get(parentId) || 0) + Math.abs(t.amount));
        }
      }
    }

    // Build budget items: show every parent category that has spending, plus any with a budget set
    const parentCats = (allCats || []).filter((c: { parent_id: string | null }) => !c.parent_id);
    const budgetItems: BudgetItem[] = [];
    for (const cat of parentCats as Array<{ id: string; name: string; icon: string; exclude_from_totals: boolean }>) {
      const spent = catSpend.get(cat.id) || 0;
      const limit = budgetMap.get(cat.id) || 0;
      if (spent > 0 || limit > 0) {
        if (cat.exclude_from_totals) continue; // Skip excluded categories like Transfer
        budgetItems.push({
          id: cat.id,
          categoryId: cat.id,
          name: cat.name,
          icon: cat.icon || "category",
          spent: Math.round(spent * 100) / 100,
          limit,
        });
      }
    }
    // Sort: over-budget first, then by spent descending
    budgetItems.sort((a, b) => {
      const aOver = a.limit > 0 && a.spent > a.limit ? 1 : 0;
      const bOver = b.limit > 0 && b.spent > b.limit ? 1 : 0;
      if (bOver !== aOver) return bOver - aOver;
      return b.spent - a.spent;
    });
    setBudgets(budgetItems);
  }, [selectedMonth, selectedYear, filterMode, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthIdx = MONTHS.indexOf(selectedMonth);
  const dateLabel =
    filterMode === "month"
      ? `${selectedMonth} 1 — ${selectedMonth} ${new Date(Number(selectedYear), monthIdx + 1, 0).getDate()}, ${selectedYear}`
      : `Jan 1 — Dec 31, ${selectedYear}`;

  const maxSpend = Math.max(...monthlyBars.map((b) => b.spend), 1);

  const openEditModal = () => {
    const limits: Record<string, string> = {};
    budgets.forEach((b) => {
      limits[b.categoryId] = String(b.limit);
    });
    setEditLimits(limits);
    setEditModal(true);
  };

  const saveEditModal = async () => {
    if (!userId) return;
    for (const budget of budgets) {
      const newLimit = parseFloat(editLimits[budget.categoryId]);
      if (!isNaN(newLimit) && newLimit >= 0) {
        await supabase
          .from("budgets")
          .upsert({
            user_id: userId,
            category_id: budget.categoryId,
            monthly_limit: newLimit,
          }, { onConflict: "user_id,category_id" });
      }
    }
    toast.success("Budgets updated");
    setEditModal(false);
    fetchData();
  };

  return (
    <>
      <Header title="Financial Insights" showBack />

      {/* Date Filter Bar */}
      <div className="bg-white px-4 py-3 border-b border-silver-light">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setFilterMode("month")}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                filterMode === "month" ? "bg-white text-deep-green shadow-sm" : "text-silver-metallic"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilterMode("year")}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                filterMode === "year" ? "bg-white text-deep-green shadow-sm" : "text-silver-metallic"
              }`}
            >
              Yearly
            </button>
          </div>

          {filterMode === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 bg-white border border-silver-light rounded-lg px-3 text-[13px] font-semibold text-slate-700 focus:ring-1 focus:ring-deep-green focus:border-deep-green"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 bg-white border border-silver-light rounded-lg px-3 text-[13px] font-semibold text-slate-700 focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          >
            {(years.length > 0 ? years : [String(now.getFullYear())]).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 pb-32 lg:pb-8 max-w-5xl mx-auto">
        {/* Total Spending */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-silver-metallic text-[10px] font-bold uppercase tracking-[0.1em]">Total Spending</p>
          </div>
          <p className="text-deep-green text-4xl font-bold tracking-tight">
            ${totalSpending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-silver-metallic text-xs mt-1">{dateLabel}</p>
        </div>

        {/* Bar Chart */}
        <div className="relative h-48 mb-4 border-b border-border-silver">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0.5">
            <div className="w-full border-t border-slate-100" />
            <div className="w-full border-t border-slate-100" />
            <div className="w-full border-t border-slate-100" />
            <div className="w-full" />
          </div>
          <div className="relative flex items-end justify-between h-full px-1 gap-1.5 z-10">
            {monthlyBars.map((d, i) => {
              const selectedMonthIdx = MONTHS.indexOf(selectedMonth);
              const isCurrent = filterMode === "month" ? i === selectedMonthIdx : i === now.getMonth();
              const heightPercent = maxSpend > 0 ? Math.max((d.spend / maxSpend) * 100, d.spend > 0 ? 3 : 0) : 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <div
                    className={`w-full rounded-t-sm relative overflow-hidden border-x border-t border-slate-100 ${
                      d.spend > 0 ? "" : "bg-transparent border-transparent"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div
                      className={`absolute inset-0 ${
                        isCurrent
                          ? "bg-gradient-to-t from-deep-green to-rich-green"
                          : "bg-gradient-to-t from-border-silver to-silver-light"
                      }`}
                    />
                  </div>
                  <span className={`text-[9px] font-bold mb-[-24px] ${isCurrent ? "text-deep-green" : "text-silver-metallic"}`}>
                    {d.month.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-8" />

        {/* AI Insights */}
        <div className="mt-4 space-y-4">
          <h2 className="text-slate-900 text-lg font-bold tracking-tight">AI Insights</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4">
            <div className="min-w-[280px] p-5 rounded-2xl bg-white border border-slate-100 ios-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-deep-green/5 flex items-center justify-center text-deep-green">
                  <span className="material-symbols-outlined text-[20px]">restaurant</span>
                </div>
                <p className="font-bold text-sm text-slate-900">Dining Trends</p>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {totalSpending > 0
                  ? `Total spending: $${totalSpending.toLocaleString()}. Review your top categories for savings opportunities.`
                  : "Import transactions to see spending insights."}
              </p>
            </div>
            <div className="min-w-[280px] p-5 rounded-2xl bg-white border border-slate-100 ios-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">savings</span>
                </div>
                <p className="font-bold text-sm text-slate-900">Budget Status</p>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {budgets.length > 0
                  ? `Tracking ${budgets.length} budget${budgets.length > 1 ? "s" : ""}. ${budgets.filter((b) => b.spent > b.limit).length} over limit.`
                  : "Set monthly budgets to track your spending limits."}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Limits / Budget */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Spending by Category</h2>
            <button onClick={openEditModal} className="text-deep-green text-xs font-bold uppercase tracking-wider">
              Edit
            </button>
          </div>
          {budgets.length > 0 ? (
            <div className="space-y-8">
              {budgets.map((budget) => {
                const hasLimit = budget.limit > 0;
                const overBudget = hasLimit && budget.spent > budget.limit;
                const overAmount = budget.spent - budget.limit;
                return (
                  <div key={budget.id} className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-[20px] text-deep-green">{budget.icon}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{budget.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          ${budget.spent.toFixed(2)}
                          {hasLimit && (
                            <span className="text-silver-metallic font-normal"> / {budget.limit.toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {hasLimit ? (
                      <ProgressBar value={budget.spent} max={budget.limit} overBudget={overBudget} />
                    ) : (
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-deep-green/40" style={{ width: "100%" }} />
                      </div>
                    )}
                    {overBudget && (
                      <p className="text-[11px] text-rose-800 font-bold flex items-center gap-1 uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Limit exceeded by ${overAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-silver-metallic text-center py-8">
              No budgets set yet. Budgets are configured in the database.
            </p>
          )}
        </div>

        {/* Spreadsheet Sync CTA */}
        <Link href="/import" className="block mt-12">
          <div className="p-5 rounded-2xl bg-deep-green flex items-center justify-between shadow-xl shadow-deep-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-silver-metallic text-2xl">clinical_notes</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Spreadsheet Sync</p>
                <p className="text-white/60 text-xs">Import latest CSV/XLSX data</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-silver-metallic flex items-center justify-center">
              <span className="material-symbols-outlined text-deep-green text-xl font-bold">add</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Budget Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Monthly Limits">
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-deep-green/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-deep-green">{budget.icon}</span>
              </div>
              <span className="text-sm font-medium text-slate-700 w-24">{budget.name}</span>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-metallic text-sm">$</span>
                <input
                  type="number"
                  value={editLimits[budget.categoryId] || ""}
                  onChange={(e) => setEditLimits((prev) => ({ ...prev, [budget.categoryId]: e.target.value }))}
                  className="w-full h-10 border border-silver-light rounded-lg pl-7 pr-3 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button className="flex-1" onClick={saveEditModal}>Save</Button>
        </div>
      </Modal>
    </>
  );
}
