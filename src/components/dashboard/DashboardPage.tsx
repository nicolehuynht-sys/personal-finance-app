"use client";

import { Card } from "@/components/ui/Card";
import Link from "next/link";

export function DashboardPage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-silver-light">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-deep-green/10 flex items-center justify-center text-deep-green font-bold text-sm">
              AR
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-deep-green rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-silver-metallic">
              Welcome back
            </p>
            <h1 className="text-base font-bold text-slate-800">Alex Rivera</h1>
          </div>
        </div>
        <div />
      </header>

      <div className="px-6 py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-6xl mx-auto">
        {/* Summary Cards — carousel on mobile, side-by-side on desktop */}
        <section className="flex gap-4 overflow-x-auto hide-scrollbar snap-x -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2">
          <Card className="min-w-[88%] md:min-w-0 snap-center relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-silver-metallic mb-1">
                  Total Balance
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  $0.00
                </h2>
              </div>
              <div className="bg-deep-green/5 text-deep-green p-2 rounded-xl border border-deep-green/10">
                <span className="material-symbols-outlined text-xl">
                  account_balance_wallet
                </span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[11px] text-silver-metallic font-medium">
                Import data to get started
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
                  $0.00
                </h2>
              </div>
              <div className="bg-silver-light text-silver-metallic p-2 rounded-xl">
                <span className="material-symbols-outlined text-xl">
                  payments
                </span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[11px] text-silver-metallic font-medium">
                No spending data yet
              </span>
            </div>
          </Card>
        </section>

        {/* Spending Allocation */}
        <section>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              Spending Allocation
            </h3>
            <Link
              href="/insights"
              className="text-xs font-bold text-deep-green flex items-center uppercase tracking-widest"
            >
              Analytics
              <span className="material-symbols-outlined text-sm ml-1">
                chevron_right
              </span>
            </Link>
          </div>
          <Card className="flex flex-col items-center p-6 lg:p-8 lg:flex-row lg:gap-10">
            <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex-shrink-0 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-silver-light"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-silver-metallic uppercase tracking-widest">
                  Total
                </span>
                <span className="text-2xl font-bold text-slate-900">$0</span>
              </div>
            </div>
            <p className="text-sm text-silver-metallic mt-4 lg:mt-0">
              Import transactions to see spending breakdown
            </p>
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              Recent Activity
            </h3>
            <Link
              href="/transactions"
              className="text-xs font-bold text-silver-metallic flex items-center uppercase tracking-widest"
            >
              History
              <span className="material-symbols-outlined text-sm ml-1">
                history
              </span>
            </Link>
          </div>
          <div className="space-y-4">
            <Card className="flex items-center justify-center py-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-silver-light mb-2">
                  receipt_long
                </span>
                <p className="text-sm text-silver-metallic">
                  No transactions yet
                </p>
                <p className="text-xs text-silver-metallic/70 mt-1">
                  Import a bank statement to get started
                </p>
              </div>
            </Card>
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
                  <p className="text-[11px] text-white/60 font-medium">
                    CSV or Excel sync
                  </p>
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
