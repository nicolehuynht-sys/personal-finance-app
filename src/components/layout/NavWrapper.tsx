"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <main className="flex-1 pb-28 lg:pb-0 lg:ml-20">{children}</main>
      <BottomNav />
    </>
  );
}
