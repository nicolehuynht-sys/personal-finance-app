"use client";

import { useState, useRef, useEffect } from "react";
import type { Category } from "@/lib/types";

interface CategoryPillProps {
  category: Category | null;
  parentCategory?: Category | null;
  allCategories: Category[];
  onRecategorize: (newCategoryId: string, createRule: boolean) => void;
}

export function CategoryPill({
  category,
  parentCategory,
  allCategories,
  onRecategorize,
}: CategoryPillProps) {
  const [open, setOpen] = useState(false);
  const [createRule, setCreateRule] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Group categories for dropdown: parents with their children
  const parents = allCategories.filter((c) => !c.parent_id);
  const childrenMap = new Map<string, Category[]>();
  allCategories
    .filter((c) => c.parent_id)
    .forEach((c) => {
      const list = childrenMap.get(c.parent_id!) || [];
      list.push(c);
      childrenMap.set(c.parent_id!, list);
    });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${
          category
            ? "bg-deep-green text-white"
            : "bg-slate-100 text-slate-500 border border-silver-light"
        }`}
      >
        {category ? (
          <>
            {parentCategory && (
              <>
                <span>{parentCategory.name}</span>
                <span className="opacity-30">&bull;</span>
              </>
            )}
            <span>{category.name}</span>
          </>
        ) : (
          <span>Uncategorized</span>
        )}
        <span className="material-symbols-outlined text-[12px] ml-0.5">expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-silver-light shadow-lg z-50 py-2 max-h-72 overflow-y-auto">
          {parents.map((parent) => {
            const children = childrenMap.get(parent.id) || [];
            return (
              <div key={parent.id}>
                <button
                  onClick={() => {
                    onRecategorize(parent.id, createRule);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 ${
                    category?.id === parent.id ? "text-deep-green" : "text-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {parent.icon || "category"}
                  </span>
                  {parent.name}
                </button>
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      onRecategorize(child.id, createRule);
                      setOpen(false);
                    }}
                    className={`w-full text-left pl-10 pr-4 py-1.5 text-[13px] hover:bg-slate-50 ${
                      category?.id === child.id
                        ? "text-deep-green font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            );
          })}

          <div className="border-t border-silver-light mt-2 pt-2 px-4">
            <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={createRule}
                onChange={(e) => setCreateRule(e.target.checked)}
                className="rounded border-silver-light text-deep-green focus:ring-deep-green w-3.5 h-3.5"
              />
              Save this categorization for future transactions
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
