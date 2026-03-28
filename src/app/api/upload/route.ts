import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseXLSX } from "@/lib/parsers/xlsx-parser";
import { deduplicateTransactions } from "@/lib/parsers";
import { categorizeBatch } from "@/lib/categorization/engine";
import type { NormalizedTransaction } from "@/lib/types";

const UNMAPPED = "__unmapped__";

type ColumnMapping = {
  date: string;
  description: string;
  amount: string;
  credit: string;
  debit: string;
  amountSign: "natural" | "inverted";
};

function parseDate(dateStr: string): string {
  const cleaned = dateStr.trim();
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return cleaned;
  const dashMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, m, d, y] = dashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  throw new Error(`Cannot parse date: "${dateStr}"`);
}

function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[$,\s]/g, "").trim();
  const parenMatch = cleaned.match(/^\((.+)\)$/);
  if (parenMatch) return -parseFloat(parenMatch[1]);
  return parseFloat(cleaned);
}

function normalizeWithMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): { transactions: NormalizedTransaction[]; errors: string[] } {
  const transactions: NormalizedTransaction[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const dateStr = row[mapping.date];
      const description = row[mapping.description];

      if (!dateStr || !description) {
        errors.push(`Row ${i + 1}: Missing date or description`);
        continue;
      }

      let amount: number;

      if (mapping.amount !== UNMAPPED) {
        // Single amount column
        amount = parseAmount(row[mapping.amount] || "0");
        if (mapping.amountSign === "inverted") {
          amount = -amount;
        }
      } else if (mapping.debit !== UNMAPPED && mapping.credit !== UNMAPPED) {
        // Split debit/credit columns
        const creditStr = row[mapping.credit];
        const debitStr = row[mapping.debit];
        if (creditStr && !isNaN(parseAmount(creditStr))) {
          amount = Math.abs(parseAmount(creditStr));
        } else if (debitStr && !isNaN(parseAmount(debitStr))) {
          amount = -Math.abs(parseAmount(debitStr));
        } else {
          amount = 0;
        }
      } else {
        errors.push(`Row ${i + 1}: No amount mapping`);
        continue;
      }

      if (isNaN(amount)) {
        errors.push(`Row ${i + 1}: Invalid amount`);
        continue;
      }

      transactions.push({
        date: parseDate(dateStr),
        description: description.trim(),
        amount,
        currency: "CAD",
        raw_data: row,
      });
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { transactions, errors };
}

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
    const columnMappingStr = formData.get("columnMapping") as string | null;

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

    // 3. Normalize — use column mapping if provided, otherwise fall back to auto-detect
    let normalized: NormalizedTransaction[];
    let normalizeErrors: string[];

    if (columnMappingStr) {
      const mapping: ColumnMapping = JSON.parse(columnMappingStr);
      const result = normalizeWithMapping(rows, mapping);
      normalized = result.transactions;
      normalizeErrors = result.errors;
    } else {
      // Legacy auto-detect path
      const { normalizeRows } = await import("@/lib/parsers/normalizer");
      const result = normalizeRows(rows, headers);
      normalized = result.transactions;
      normalizeErrors = result.errors;
    }

    if (normalized.length === 0) {
      await supabase
        .from("uploads")
        .update({
          status: "failed",
          error_message: normalizeErrors.length > 0 ? normalizeErrors[0] : "No valid transactions found",
        })
        .eq("id", upload.id);

      return NextResponse.json(
        { error: "No valid transactions found", details: normalizeErrors },
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
      parseErrors: normalizeErrors.length,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
