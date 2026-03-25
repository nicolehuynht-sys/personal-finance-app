import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "default";
  className?: string;
}

const variantStyles = {
  success: "bg-deep-green/10 text-deep-green",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-rose-50 text-rose-800",
  default: "bg-silver-light/50 text-silver-metallic",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
