import { applyUserRules } from "./user-rules";
import { applySystemRules } from "./system-rules";
import { classifyBatchWithAI } from "./ai-fallback";
import type { CategorizationResult, CategorizationRule, SystemRule, Category } from "@/lib/types";

interface TransactionInput {
  description: string;
  amount: number;
  institution?: string;
}

export async function categorizeTransaction(
  transaction: TransactionInput,
  userRules: CategorizationRule[],
  systemRules: SystemRule[],
  categories: Category[]
): Promise<CategorizationResult> {
  // 1. User rules (highest priority)
  const userMatch = applyUserRules(transaction, userRules);
  if (userMatch) {
    return {
      categoryId: userMatch.categoryId,
      method: "user_rule",
      ruleId: userMatch.ruleId,
    };
  }

  // 2. System rules
  const systemMatch = applySystemRules(transaction, systemRules, categories);
  if (systemMatch) {
    return {
      categoryId: systemMatch.categoryId,
      method: "system_rule",
      ruleId: systemMatch.ruleId,
    };
  }

  // 3. Uncategorized (AI will be run in batch)
  return { categoryId: null, method: "uncategorized" };
}

export async function categorizeBatch(
  transactions: TransactionInput[],
  userRules: CategorizationRule[],
  systemRules: SystemRule[],
  categories: Category[]
): Promise<CategorizationResult[]> {
  const results: CategorizationResult[] = [];
  const uncategorizedForAI: Array<{
    index: number;
    description: string;
    amount: number;
  }> = [];

  // Step 1: Apply user rules and system rules
  for (let i = 0; i < transactions.length; i++) {
    const result = await categorizeTransaction(
      transactions[i],
      userRules,
      systemRules,
      categories
    );
    results.push(result);

    if (result.method === "uncategorized") {
      uncategorizedForAI.push({
        index: i,
        description: transactions[i].description,
        amount: transactions[i].amount,
      });
    }
  }

  // Step 2: Batch AI fallback for uncategorized items (max 20 per call)
  if (uncategorizedForAI.length > 0) {
    const batchSize = 20;
    for (let i = 0; i < uncategorizedForAI.length; i += batchSize) {
      const batch = uncategorizedForAI.slice(i, i + batchSize);
      try {
        const aiResults = await classifyBatchWithAI(batch, categories);

        for (const [batchIdx, aiResult] of aiResults) {
          results[batchIdx] = {
            categoryId: aiResult.categoryId,
            method: "ai",
            confidence: aiResult.confidence,
          };
        }
      } catch (error) {
        console.error("AI batch failed:", error);
        // Leave as uncategorized
      }
    }
  }

  return results;
}
