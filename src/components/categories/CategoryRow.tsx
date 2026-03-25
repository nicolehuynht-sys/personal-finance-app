import type { Category } from "@/lib/types";

interface CategoryRowProps {
  category: Category;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleExclude?: () => void;
}

export function CategoryRow({
  category,
  hasChildren,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onToggleExclude,
}: CategoryRowProps) {
  const excluded = category.exclude_from_totals;

  return (
    <div className="flex items-center gap-4 cursor-pointer" onClick={onToggle}>
      <span
        className={`material-symbols-outlined text-silver-metallic transition-transform ${
          isExpanded ? "rotate-90" : ""
        } ${!hasChildren ? "opacity-0" : ""}`}
      >
        chevron_right
      </span>

      <div
        className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${
          excluded ? "bg-slate-400 text-white" : "bg-deep-green text-white"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'wght' 300" }}
        >
          {category.icon || "category"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold ${excluded ? "text-slate-400" : ""}`}>
          {category.name}
        </p>
        {excluded && (
          <p className="text-[11px] text-slate-400 font-medium">Excluded from totals</p>
        )}
      </div>

      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Exclude toggle */}
        <button
          onClick={onToggleExclude}
          title={excluded ? "Include in totals" : "Exclude from totals"}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            excluded ? "bg-deep-green" : "bg-slate-200"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              excluded ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
        <button onClick={onEdit} className="text-silver-metallic hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-lg">edit_note</span>
        </button>
        <button onClick={onDelete} className="text-silver-metallic hover:text-rose-600 transition-colors">
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
