import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-deep-green text-white hover:bg-rich-green shadow-lg shadow-deep-green/10",
  secondary: "bg-silver-metallic text-white hover:bg-silver-metallic/90",
  ghost: "text-silver-metallic hover:bg-silver-light/50",
  outline: "border border-silver-light text-slate-700 hover:border-silver-metallic",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-bold rounded-xl transition-colors active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
