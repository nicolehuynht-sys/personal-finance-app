import type { CategorizationRule } from "@/lib/types";

interface MatchInput {
  description: string;
  amount: number;
  institution?: string;
}

export function applyUserRules(
  transaction: MatchInput,
  rules: CategorizationRule[]
): { categoryId: string; ruleId: string } | null {
  // Sort by priority descending (higher priority checked first)
  const sorted = [...rules]
    .filter((r) => r.is_active)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (matchesRule(transaction, rule)) {
      return { categoryId: rule.category_id, ruleId: rule.id };
    }
  }

  return null;
}

function matchesRule(transaction: MatchInput, rule: CategorizationRule): boolean {
  let value: string;

  switch (rule.match_field) {
    case "description":
      value = transaction.description;
      break;
    case "amount":
      value = String(transaction.amount);
      break;
    case "institution":
      value = transaction.institution || "";
      break;
    default:
      return false;
  }

  const upperValue = value.toUpperCase();
  const upperMatch = rule.match_value.toUpperCase();

  switch (rule.match_type) {
    case "exact":
      return upperValue === upperMatch;
    case "contains":
      return upperValue.includes(upperMatch);
    case "starts_with":
      return upperValue.startsWith(upperMatch);
    case "regex":
      try {
        return new RegExp(rule.match_value, "i").test(value);
      } catch {
        return false;
      }
    default:
      return false;
  }
}
