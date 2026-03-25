import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  overBudget?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  overBudget = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full h-2 bg-slate-100 rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          overBudget ? "bg-rose-800" : "progress-premium"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
