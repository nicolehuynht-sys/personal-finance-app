import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEV_USER_ID } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { transactionId, newCategoryId, createRule } = await req.json();

    if (!transactionId || !newCategoryId) {
      return NextResponse.json(
        { error: "transactionId and newCategoryId are required" },
        { status: 400 }
      );
    }

    const userId = DEV_USER_ID;

    // 1. Update the transaction
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        category_id: newCategoryId,
        categorization_method: "manual",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .eq("user_id", userId);

    if (updateError) throw updateError;

    let ruleCreated = false;
    let retroactiveCount = 0;

    // 2. Optionally create a persistent rule
    if (createRule) {
      // Get the transaction description
      const { data: transaction } = await supabase
        .from("transactions")
        .select("description")
        .eq("id", transactionId)
        .single();

      if (transaction) {
        // Extract a simplified merchant name for matching
        const matchValue = extractMerchantName(transaction.description);

        // Upsert the rule
        const { error: ruleError } = await supabase
          .from("categorization_rules")
          .upsert(
            {
              user_id: userId,
              category_id: newCategoryId,
              match_field: "description",
              match_type: "contains",
              match_value: matchValue,
              priority: 10,
              is_active: true,
            },
            {
              onConflict: "user_id,match_field,match_type,match_value",
            }
          );

        if (!ruleError) {
          ruleCreated = true;

          // 3. Retroactively apply to matching transactions
          const { data: matching } = await supabase
            .from("transactions")
            .select("id")
            .eq("user_id", userId)
            .ilike("description", `%${matchValue}%`)
            .neq("categorization_method", "manual");

          if (matching && matching.length > 0) {
            await supabase
              .from("transactions")
              .update({
                category_id: newCategoryId,
                categorization_method: "user_rule",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId)
              .ilike("description", `%${matchValue}%`)
              .neq("categorization_method", "manual");

            retroactiveCount = matching.length;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      ruleCreated,
      retroactiveCount,
    });
  } catch (error) {
    console.error("Categorize failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Categorization failed" },
      { status: 500 }
    );
  }
}

function extractMerchantName(description: string): string {
  // Remove common prefixes/suffixes, card numbers, etc.
  let cleaned = description
    .replace(/\s*#\d+\s*/g, "") // Remove #123
    .replace(/\s*\d{4,}\s*/g, "") // Remove long numbers
    .replace(/\s*(POS|DEBIT|CREDIT|PURCHASE|PAYMENT)\s*/gi, "")
    .trim();

  // Take the first meaningful segment
  const parts = cleaned.split(/\s{2,}|-{2,}/);
  return parts[0].trim().toUpperCase();
}
