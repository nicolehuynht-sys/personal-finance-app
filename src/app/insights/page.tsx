"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type FilterMode = "month" | "year";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const YEARS = ["2024", "2023", "2022"];

const MONTHLY_DATA = [
  { month: "JAN", current: 60, previous: 75 },
  { month: "FEB", current: 45, previous: 85 },
  { month: "MAR", current: 80, previous: 65 },
  { month: "APR", current: 55, previous: 40 },
  { month: "MAY", current: 90, previous: 70 },
  { month: "JUN", current: 70, previous: 100 },
];

const INITIAL_BUDGETS = [
  { name: "Groceries", icon: "shopping_cart", spent: 840, limit: 1000 },
  { name: "Transport", icon: "directions_car", spent: 320.5, limit: 300 },
  { name: "Leisure", icon: "movie", spent: 150, limit: 400 },
];

export default function InsightsPage() {
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState("Jun");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [editModal, setEditModal] = useState(false);
  const [editLimits, setEditLimits] = useState<Record<string, string>>({});

  const dateLabel =
    filterMode === "month"
      ? `${selectedMonth} 1 — ${selectedMonth} 30, ${selectedYear}`
      : `Jan 1 — Dec 31, ${selectedYear}`;

  const openEditModal = () => {
    const limits: Record<string, string> = {};
    budgets.forEach((b) => {
      limits[b.name] = String(b.limit);
    });
    setEditLimits(limits);
    setEditModal(true);
  };

  const saveEditModal = () => {
    setBudgets((prev) =>
      prev.map((b) => ({
        ...b,
        limit: parseFloat(editLimits[b.name]) || b.limit,
      }))
    );
    setEditModal(false);
  };

  return (
    <>
      <Header title="Financial Insights" showBack />

      {/* Date Filter Bar */}
      <div className="bg-white px-4 py-3 border-b border-silver-light">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          {/* Month / Year toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setFilterMode("month")}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                filterMode === "month"
                  ? "bg-white text-deep-green shadow-sm"
                  : "text-silver-metallic"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilterMode("year")}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${
                filterMode === "year"
                  ? "bg-white text-deep-green shadow-sm"
                  : "text-silver-metallic"
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Month selector (only when monthly) */}
          {filterMode === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 bg-white border border-silver-light rounded-lg px-3 text-[13px] font-semibold text-slate-700 focus:ring-1 focus:ring-deep-green focus:border-deep-green"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 bg-white border border-silver-light rounded-lg px-3 text-[13px] font-semibold text-slate-700 focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 pb-32 lg:pb-8 max-w-5xl mx-auto">
        {/* Total Spending */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-silver-metallic text-[10px] font-bold uppercase tracking-[0.1em]">
              Total Spending
            </p>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <span className="material-symbols-outlined text-[10px]">trending_up</span>
              <span className="text-[10px] font-bold">12.4% vs LY</span>
            </div>
          </div>
          <p className="text-deep-green text-4xl font-bold tracking-tight">$4,280.50</p>
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
          <div className="relative flex items-end justify-between h-full px-1 gap-3.5 z-10">
            {MONTHLY_DATA.map((d, i) => {
              const isLast = i === MONTHLY_DATA.length - 1;
              return (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-3 h-full justify-end"
                >
                  <div
                    className="w-full bg-slate-50 rounded-t-sm relative overflow-hidden border-x border-t border-slate-100"
                    style={{ height: `${d.current}%` }}
                  >
                    <div
                      className={`absolute inset-x-0 bottom-0 ${
                        isLast
                          ? "bg-gradient-to-t from-deep-green to-rich-green"
                          : "bg-gradient-to-t from-border-silver to-silver-light"
                      }`}
                      style={{ height: `${d.previous}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold mb-[-24px] ${
                      isLast ? "text-deep-green" : "text-silver-metallic"
                    }`}
                  >
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 py-4 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-border-silver" />
            <span className="text-[11px] text-silver-metallic font-semibold">Previous</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-deep-green" />
            <span className="text-[11px] text-silver-metallic font-semibold">Current</span>
          </div>
        </div>

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
                You spent <span className="text-deep-green font-bold">10% more</span> on dining.
                This matches your seasonal average.
              </p>
            </div>
            <div className="min-w-[280px] p-5 rounded-2xl bg-white border border-slate-100 ios-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">savings</span>
                </div>
                <p className="font-bold text-sm text-slate-900">Wealth Building</p>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Surplus of <span className="font-bold text-deep-green">$500</span> detected.
                Recommended: invest in your portfolio.
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Limits / Budget */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Monthly Limits</h2>
            <button
              onClick={openEditModal}
              className="text-deep-green text-xs font-bold uppercase tracking-wider"
            >
              Edit
            </button>
          </div>
          <div className="space-y-8">
            {budgets.map((budget) => {
              const overBudget = budget.spent > budget.limit;
              const overAmount = budget.spent - budget.limit;

              return (
                <div key={budget.name} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[20px] text-deep-green">
                          {budget.icon}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{budget.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        ${budget.spent.toFixed(2)}{" "}
                        <span className="text-silver-metallic font-normal">
                          / {budget.limit.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ProgressBar
                    value={budget.spent}
                    max={budget.limit}
                    overBudget={overBudget}
                  />
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
        </div>

        {/* Spreadsheet Sync CTA */}
        <Link href="/import" className="block mt-12">
          <div className="p-5 rounded-2xl bg-deep-green flex items-center justify-between shadow-xl shadow-deep-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-silver-metallic text-2xl">
                  clinical_notes
                </span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Spreadsheet Sync</p>
                <p className="text-white/60 text-xs">Import latest CSV/XLSX data</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-silver-metallic flex items-center justify-center">
              <span className="material-symbols-outlined text-deep-green text-xl font-bold">
                add
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Budget Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Monthly Limits">
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-deep-green/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-deep-green">
                  {budget.icon}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 w-24">{budget.name}</span>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-metallic text-sm">$</span>
                <input
                  type="number"
                  value={editLimits[budget.name] || ""}
                  onChange={(e) =>
                    setEditLimits((prev) => ({ ...prev, [budget.name]: e.target.value }))
                  }
                  className="w-full h-10 border border-silver-light rounded-lg pl-7 pr-3 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={saveEditModal}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}
