export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  if (target.getTime() === yesterday.getTime()) {
    return `Yesterday, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Dev user ID for v1 (no auth)
export const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
