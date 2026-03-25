import type { SystemRule, Category } from "@/lib/types";

interface MatchInput {
  description: string;
  amount: number;
  institution?: string;
}

export function applySystemRules(
  transaction: MatchInput,
  systemRules: SystemRule[],
  categories: Category[]
): { categoryId: string; ruleId: string } | null {
  // Sort by priority descending
  const sorted = [...systemRules].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (matchesSystemRule(transaction, rule)) {
      // Find the category by name
      const category = categories.find(
        (c) => c.name.toUpperCase() === rule.category_name.toUpperCase()
      );
      if (category) {
        return { categoryId: category.id, ruleId: rule.id };
      }
    }
  }

  return null;
}

function matchesSystemRule(transaction: MatchInput, rule: SystemRule): boolean {
  let value: string;

  switch (rule.match_field) {
    case "description":
      value = transaction.description;
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
    default:
      return false;
  }
}
