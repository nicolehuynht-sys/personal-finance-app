import { z } from "zod";

// Database row types
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  institution: string | null;
  account_type: "checking" | "savings" | "credit" | "investment" | "other";
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  icon: string | null;
  is_system: boolean;
  exclude_from_totals: boolean;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

export interface Upload {
  id: string;
  user_id: string;
  account_id: string | null;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  row_count: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  upload_id: string | null;
  account_id: string | null;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category_id: string | null;
  categorization_method:
    | "user_rule"
    | "system_rule"
    | "ai"
    | "manual"
    | "uncategorized"
    | null;
  ai_confidence: number | null;
  notes: string | null;
  is_duplicate: boolean;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category | null;
  account?: Account | null;
}

export interface CategorizationRule {
  id: string;
  user_id: string;
  category_id: string;
  match_field: "description" | "amount" | "institution";
  match_type: "exact" | "contains" | "starts_with" | "regex";
  match_value: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface SystemRule {
  id: string;
  category_name: string;
  match_field: string;
  match_type: string;
  match_value: string;
  priority: number;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
  // Joined
  category?: Category;
}

// Dashboard stats
export interface DashboardStats {
  totalIncome: number;
  totalSpend: number;
  netSavings: number;
  savingsRate: number;
  spendByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    spend: number;
    net: number;
  }>;
}

// Normalized transaction from file parsing
export const normalizedTransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string().default("USD"),
  raw_data: z.record(z.string(), z.unknown()).optional(),
});

export type NormalizedTransaction = z.infer<typeof normalizedTransactionSchema>;

// Categorization result
export interface CategorizationResult {
  categoryId: string | null;
  method: "user_rule" | "system_rule" | "ai" | "uncategorized";
  confidence?: number;
  ruleId?: string;
}
