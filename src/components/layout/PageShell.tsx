interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`px-6 py-8 space-y-8 ${className}`}>
      {children}
    </div>
  );
}
