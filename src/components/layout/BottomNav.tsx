"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/", label: "Home", icon: "grid_view" },
  { href: "/transactions", label: "History", icon: "receipt_long" },
  { href: "/import", label: "Import", icon: "add", isFab: true },
  { href: "/insights", label: "Insights", icon: "analytics" },
  { href: "/categories", label: "Categories", icon: "tune" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-silver-light px-6 pb-8 pt-3 lg:hidden">
        <div className="flex justify-between items-end max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

            if (tab.isFab) {
              return (
                <Link key={tab.href} href={tab.href} className="relative -top-6">
                  <div className="w-14 h-14 bg-deep-green text-white rounded-2xl shadow-xl shadow-deep-green/20 flex items-center justify-center active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-2xl font-bold">
                      {tab.icon}
                    </span>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1.5 ${
                  isActive ? "text-deep-green" : "text-silver-metallic"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-20 bg-white border-r border-silver-light flex-col items-center py-8 gap-2">
        {/* Logo */}
        <div className="w-10 h-10 bg-deep-green rounded-xl flex items-center justify-center text-white mb-8">
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
        </div>

        {tabs.map((tab) => {
          const isActive = tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);

          if (tab.isFab) {
            return (
              <Link key={tab.href} href={tab.href} className="my-4">
                <div className="w-12 h-12 bg-deep-green text-white rounded-2xl shadow-lg shadow-deep-green/20 flex items-center justify-center hover:bg-rich-green transition-colors">
                  <span className="material-symbols-outlined text-xl font-bold">
                    {tab.icon}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-colors ${
                isActive
                  ? "text-deep-green bg-deep-green/5"
                  : "text-silver-metallic hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {tab.icon}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Spacer to push logout to bottom */}
        <div className="flex-1" />

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-silver-metallic hover:text-rose-600 hover:bg-rose-50 transition-colors mb-4"
          title="Log out"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </nav>
    </>
  );
}
