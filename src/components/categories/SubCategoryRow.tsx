import type { Category } from "@/lib/types";

interface SubCategoryRowProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubCategoryRow({ category, onEdit, onDelete }: SubCategoryRowProps) {
  return (
    <div className="relative pl-7 flex items-center justify-between group/sub">
      {/* Horizontal connector node */}
      <div className="absolute left-0 top-1/2 w-4 h-[1px] bg-border-silver" />
      <span className="text-[14px] text-slate-600">{category.name}</span>
      <div className="flex gap-3 opacity-0 group-hover/sub:opacity-100 transition-opacity">
        <button onClick={onEdit} className="text-silver-metallic hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={onDelete} className="text-silver-metallic hover:text-rose-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
