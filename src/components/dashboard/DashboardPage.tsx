"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

type DashboardStats = {
  totalIncome: number;
  totalSpend: number;
  netSavings: number;
  savingsRate: number;
  spendByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    spend: number;
    net: number;
  }>;
};

const DONUT_COLORS = [
  "#064E3B", "#065F46", "#059669", "#10B981", "#34D399",
  "#6EE7B7", "#94A3B8", "#CBD5E1", "#E2E8F0",
];

export function DashboardPage() {
  const { user, userId } = useAuth();
  const router = useRouter();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      try {
        // Fetch dashboard stats
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }

        // Fetch recent transactions
        const supabase = createClient();
        const { data: txns } = await supabase
          .from("transactions")
          .select("*, category:categories(*)")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(5);
        if (txns) setRecentTxns(txns as Transaction[]);
      } catch (e) {
        console.error("Failed to load dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const totalBalance = stats ? stats.netSavings : 0;
  const monthlySpend = stats ? stats.totalSpend : 0;
  const hasData = stats && (stats.totalIncome > 0 || stats.totalSpend > 0);

  // Build donut segments
  const donutSegments = stats?.spendByCategory || [];
  let cumulativePercent = 0;
  const circumference = 2 * Math.PI * 15.915;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-silver-light">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-deep-green/10 flex items-center justify-center text-deep-green font-bold text-sm">
              {displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-deep-green rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-silver-metallic">
              Welcome back
            </p>
            <h1 className="text-base font-bold text-slate-800">{displayName}</h1>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-silver-metallic hover:text-rose-600 hover:bg-rose-50 transition-colors lg:hidden"
          title="Log out"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </header>

      <div className="px-6 py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-6xl mx-auto">
        {/* Summary Cards */}
        <section className="flex gap-4 overflow-x-auto hide-scrollbar snap-x -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2">
          <Card className="min-w-[88%] md:min-w-0 snap-center relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-silver-metallic mb-1">
                  Total Balance
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {loading ? "..." : `$${Math.abs(totalBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </h2>
              </div>
              <div className="bg-deep-green/5 text-deep-green p-2 rounded-xl border border-deep-green/10">
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[11px] text-silver-metallic font-medium">
                {hasData
                  ? `${stats!.savingsRate >= 0 ? "+" : ""}${stats!.savingsRate}% savings rate`
                  : "Import data to get started"}
              </span>
            </div>
          </Card>

          <Card className="min-w-[88%] md:min-w-0 snap-center">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-silver-metallic mb-1">
                  Monthly Spending
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {loading ? "..." : `$${monthlySpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </h2>
              </div>
              <div className="bg-silver-light text-silver-metallic p-2 rounded-xl">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[11px] text-silver-metallic font-medium">
                {hasData ? "This period" : "No spending data yet"}
              </span>
            </div>
          </Card>
        </section>

        {/* Spending Allocation */}
        <section>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Spending Allocation</h3>
            <Link href="/insights" className="text-xs font-bold text-deep-green flex items-center uppercase tracking-widest">
              Analytics
              <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
            </Link>
          </div>
          <Card className="flex flex-col items-center p-6 lg:p-8 lg:flex-row lg:gap-10">
            <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {donutSegments.length > 0 ? (
                  donutSegments.map((seg, i) => {
                    const dashLength = (seg.percentage / 100) * circumference;
                    const offset = circumference - (cumulativePercent / 100) * circumference;
                    cumulativePercent += seg.percentage;
                    return (
                      <circle
                        key={seg.categoryId}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                        strokeWidth="2.5"
                        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    );
                  })
                ) : (
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-silver-light" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-silver-metallic uppercase tracking-widest">Total</span>
                <span className="text-2xl font-bold text-slate-900">
                  ${Math.round(monthlySpend).toLocaleString()}
                </span>
              </div>
            </div>
            {donutSegments.length > 0 ? (
              <div className="flex flex-col gap-2 mt-4 lg:mt-0 w-full">
                {donutSegments.slice(0, 6).map((seg, i) => (
                  <div key={seg.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-sm text-slate-700">{seg.categoryName}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{seg.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-silver-metallic mt-4 lg:mt-0">
                Import transactions to see spending breakdown
              </p>
            )}
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Activity</h3>
            <Link href="/transactions" className="text-xs font-bold text-silver-metallic flex items-center uppercase tracking-widest">
              History
              <span className="material-symbols-outlined text-sm ml-1">history</span>
            </Link>
          </div>
          <div className="space-y-3">
            {recentTxns.length > 0 ? (
              recentTxns.map((txn) => (
                <Card key={txn.id} className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px] text-deep-green">
                        {txn.category?.icon || "receipt_long"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{txn.description}</p>
                      <p className="text-[11px] text-silver-metallic">{txn.category?.name || "Uncategorized"}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${txn.amount > 0 ? "text-forest-light" : "text-slate-800"}`}>
                    {formatCurrency(txn.amount)}
                  </span>
                </Card>
              ))
            ) : (
              <Card className="flex items-center justify-center py-12">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-silver-light mb-2">receipt_long</span>
                  <p className="text-sm text-silver-metallic">No transactions yet</p>
                  <p className="text-xs text-silver-metallic/70 mt-1">Import a bank statement to get started</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Import CTA */}
        <Link href="/import" className="block">
          <section className="bg-deep-green rounded-ios p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-silver-light border border-white/10">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Import Data</h4>
                  <p className="text-[11px] text-white/60 font-medium">CSV or Excel sync</p>
                </div>
              </div>
              <span className="bg-silver-metallic text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-black/10">
                Start Import
              </span>
            </div>
          </section>
        </Link>
      </div>
    </>
  );
}
