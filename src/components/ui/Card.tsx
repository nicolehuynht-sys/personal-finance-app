import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-silver-light rounded-ios ios-shadow",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
