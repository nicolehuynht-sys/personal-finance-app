"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-silver-light">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-silver-light text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
        )}
        <h1 className="text-[17px] font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>
      {rightAction && <div className="flex gap-1">{rightAction}</div>}
    </header>
  );
}
