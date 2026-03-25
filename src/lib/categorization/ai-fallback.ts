import Anthropic from "@anthropic-ai/sdk";
import type { Category } from "@/lib/types";

const client = new Anthropic();

interface AIResult {
  categoryId: string;
  confidence: number;
}

export async function classifyWithAI(
  transaction: { description: string; amount: number },
  categories: Category[]
): Promise<AIResult | null> {
  const categoryList = categories
    .filter((c) => !c.parent_id) // Start with parents
    .map((parent) => {
      const children = categories.filter((c) => c.parent_id === parent.id);
      const childLines = children
        .map((ch) => `  - "${ch.name}" (id: ${ch.id})`)
        .join("\n");
      return `- "${parent.name}" (id: ${parent.id})${childLines ? "\n" + childLines : ""}`;
    })
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20241022",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Categorize this bank transaction into one of the categories below.

Transaction: "${transaction.description}" | Amount: ${transaction.amount}

Categories:
${categoryList}

Respond with JSON only: { "categoryId": "<uuid>", "confidence": <0.0-1.0> }
If none fit well, respond: { "categoryId": null, "confidence": 0.0 }`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      categoryId: string | null;
      confidence: number;
    };

    if (!parsed.categoryId) return null;

    return {
      categoryId: parsed.categoryId,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error("AI categorization failed:", error);
    return null;
  }
}

export async function classifyBatchWithAI(
  transactions: Array<{ index: number; description: string; amount: number }>,
  categories: Category[]
): Promise<Map<number, AIResult>> {
  const results = new Map<number, AIResult>();

  const categoryList = categories
    .filter((c) => !c.parent_id)
    .map((parent) => {
      const children = categories.filter((c) => c.parent_id === parent.id);
      const childLines = children
        .map((ch) => `  - "${ch.name}" (id: ${ch.id})`)
        .join("\n");
      return `- "${parent.name}" (id: ${parent.id})${childLines ? "\n" + childLines : ""}`;
    })
    .join("\n");

  const transactionList = transactions
    .map((t) => `[${t.index}] "${t.description}" | $${t.amount}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20241022",
      max_tokens: 2048,
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
