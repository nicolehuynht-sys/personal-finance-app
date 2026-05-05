import type { Category } from "@/lib/types";

// ── Configuration ──────────────────────────────────────────────
const AI_MODEL = "claude-haiku-4-5"; // Much cheaper than Sonnet, plenty smart for categorization
const MAX_DAILY_AI_CALLS_PER_USER = 10; // Max batch API calls per user per day
const BATCH_MAX_TOKENS = 2048;

// ── In-memory rate limiter (resets on server restart) ──────────
// For production, move this to a database table or Redis
const dailyCalls = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = dailyCalls.get(userId);

  if (!entry || now > entry.resetAt) {
    // Reset at midnight or first call
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    dailyCalls.set(userId, { count: 1, resetAt: tomorrow.getTime() });
    return true;
  }

  if (entry.count >= MAX_DAILY_AI_CALLS_PER_USER) {
    return false; // Rate limited
  }

  entry.count++;
  return true;
}

function getRemainingCalls(userId: string): number {
  const now = Date.now();
  const entry = dailyCalls.get(userId);
  if (!entry || now > entry.resetAt) return MAX_DAILY_AI_CALLS_PER_USER;
  return Math.max(0, MAX_DAILY_AI_CALLS_PER_USER - entry.count);
}

// ── Check if AI is available ───────────────────────────────────
function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function getClient() {
  if (!isAIAvailable()) return null;
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  return new Anthropic();
}

// ── Helpers ────────────────────────────────────────────────────
function buildCategoryList(categories: Category[]): string {
  return categories
    .filter((c) => !c.parent_id)
    .map((parent) => {
      const children = categories.filter((c) => c.parent_id === parent.id);
      const childLines = children
        .map((ch) => `  - "${ch.name}" (id: ${ch.id})`)
        .join("\n");
      return `- "${parent.name}" (id: ${parent.id})${childLines ? "\n" + childLines : ""}`;
    })
    .join("\n");
}

// ── Public API ─────────────────────────────────────────────────
interface AIResult {
  categoryId: string;
  confidence: number;
}

export async function classifyBatchWithAI(
  transactions: Array<{ index: number; description: string; amount: number }>,
  categories: Category[],
  userId?: string
): Promise<Map<number, AIResult>> {
  const results = new Map<number, AIResult>();

  const client = await getClient();
  if (!client) {
    console.log("AI batch categorization skipped: no ANTHROPIC_API_KEY");
    return results;
  }

  if (userId && !checkRateLimit(userId)) {
    const remaining = getRemainingCalls(userId);
    console.log(`AI batch categorization skipped: user ${userId} hit daily limit (${remaining} calls remaining)`);
    return results;
  }

  const categoryList = buildCategoryList(categories);

  const transactionList = transactions
    .map((t) => `[${t.index}] "${t.description}" | $${t.amount}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: BATCH_MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: `Categorize each bank transaction into one of the categories below.

Transactions:
${transactionList}

Categories:
${categoryList}

Respond with a JSON array only: [{ "index": <number>, "categoryId": "<uuid>", "confidence": <0.0-1.0> }, ...]
For any that don't fit, use: { "index": <number>, "categoryId": null, "confidence": 0.0 }`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return results;

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      index: number;
      categoryId: string | null;
      confidence: number;
    }>;

    for (const item of parsed) {
      if (item.categoryId && item.confidence >= 0.6) {
        results.set(item.index, {
          categoryId: item.categoryId,
          confidence: item.confidence,
        });
      }
    }
  } catch (error) {
    console.error("AI batch categorization failed:", error);
  }

  return results;
}
