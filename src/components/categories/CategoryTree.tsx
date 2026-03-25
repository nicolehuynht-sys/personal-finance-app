"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { CategoryRow } from "./CategoryRow";
import { SubCategoryRow } from "./SubCategoryRow";

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSub: (parentId: string) => void;
  onToggleExclude?: (category: Category) => void;
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onAddSub,
  onToggleExclude,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build tree: parents with children nested
  const parents = categories.filter((c) => !c.parent_id);
  const childrenMap = new Map<string, Category[]>();
  categories
    .filter((c) => c.parent_id)
    .forEach((c) => {
      const list = childrenMap.get(c.parent_id!) || [];
      list.push(c);
      childrenMap.set(c.parent_id!, list);
    });

  return (
    <div className="space-y-8">
      {parents.map((parent) => {
        const children = childrenMap.get(parent.id) || [];
        const isExpanded = expanded.has(parent.id);

        return (
          <div key={parent.id} className="group">
            <CategoryRow
              category={parent}
              hasChildren={children.length > 0}
              isExpanded={isExpanded}
              onToggle={() => toggleExpand(parent.id)}
              onEdit={() => onEdit(parent)}
              onDelete={() => onDelete(parent)}
              onToggleExclude={() => onToggleExclude?.(parent)}
            />

            {isExpanded && (
              <div className="relative ml-[54px] mt-4 space-y-5">
                {/* Vertical connector line */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border-silver" />

                {children.map((child) => (
                  <SubCategoryRow
                    key={child.id}
                    category={child}
                    onEdit={() => onEdit(child)}
                    onDelete={() => onDelete(child)}
                  />
                ))}

                <button
                  onClick={() => onAddSub(parent.id)}
                  className="relative pl-7 flex items-center gap-2 text-[13px] text-deep-green font-semibold"
                >
                  <div className="absolute left-0 top-1/2 w-4 h-[1px] bg-border-silver" />
                  <span className="material-symbols-outlined text-[16px]">
                    add_circle
                  </span>
                  <span>Add sub-category</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
