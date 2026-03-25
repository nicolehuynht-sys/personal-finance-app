interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-silver-metallic">
      {children}
    </h3>
  );
}
