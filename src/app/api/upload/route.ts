import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseXLSX } from "@/lib/parsers/xlsx-parser";
import { normalizeRows } from "@/lib/parsers/normalizer";
import { deduplicateTransactions } from "@/lib/parsers";
import { categorizeBatch } from "@/lib/categorization/engine";

export async function POST(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = user.id;

  const supabase = createAdminClient();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const accountId = formData.get("accountId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Create upload record
    const { data: upload, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        user_id: userId,
        account_id: accountId || null,
        file_name: file.name,
        file_path: `uploads/${userId}/${Date.now()}_${file.name}`,
        file_size_bytes: file.size,
        mime_type: file.type,
        status: "processing",
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    // 2. Parse file
    const extension = file.name.split(".").pop()?.toLowerCase();
    let headers: string[];
    let rows: Record<string, string>[];

    if (extension === "csv") {
      const text = await file.text();
      const result = parseCSV(text);
      headers = result.headers;
      rows = result.rows;
    } else if (extension === "xlsx" || extension === "xls") {
      const buffer = await file.arrayBuffer();
      const result = parseXLSX(buffer);
      headers = result.headers;
      rows = result.rows;
    } else {
      throw new Error(`Unsupported file type: .${extension}`);
    }

    // 3. Normalize
    const { transactions: normalized, errors } = normalizeRows(rows, headers);

    if (normalized.length === 0) {
      await supabase
        .from("uploads")
        .update({
          status: "failed",
          error_message: errors.length > 0 ? errors[0] : "No valid transactions found",
        })
        .eq("id", upload.id);

      return NextResponse.json(
        { error: "No valid transactions found", details: errors },
        { status: 400 }
      );
    }

    // 4. Deduplicate
    const { data: existing } = await supabase
      .from("transactions")
      .select("date, description, amount")
      .eq("user_id", userId);

    const { unique, duplicateCount } = deduplicateTransactions(
      normalized,
      existing || []
    );

    // 5. Categorize
    const { data: userRules } = await supabase
      .from("categorization_rules")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    const { data: systemRules } = await supabase
      .from("system_rules")
      .select("*");

    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    const categorizationResults = await categorizeBatch(
      unique.map((t) => ({
        description: t.description,
        amount: t.amount,
      })),
      userRules || [],
      systemRules || [],
      categories || [],
      userId
    );

    // 6. Insert transactions
    const transactionsToInsert = unique.map((t, i) => ({
      user_id: userId,
      upload_id: upload.id,
      account_id: accountId || null,
      date: t.date,
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      category_id: categorizationResults[i]?.categoryId || null,
      categorization_method: categorizationResults[i]?.method || "uncategorized",
      ai_confidence: categorizationResults[i]?.confidence || null,
      raw_data: t.raw_data || null,
    }));

    if (transactionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(transactionsToInsert);

      if (insertError) throw insertError;
    }

    // 7. Update upload status
    await supabase
      .from("uploads")
      .update({
        status: "completed",
        row_count: unique.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", upload.id);

    return NextResponse.json({
      uploadId: upload.id,
      status: "completed",
      imported: unique.length,
      duplicatesSkipped: duplicateCount,
      parseErrors: errors.length,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
