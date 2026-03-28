import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseXLSX } from "@/lib/parsers/xlsx-parser";
import { detectBankProfile } from "@/lib/parsers/normalizer";

/**
 * POST /api/upload/preview
 * Parses a file and returns headers, sample rows, and a suggested column mapping.
 * Does NOT insert anything into the database.
 */
export async function POST(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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
      return NextResponse.json({ error: `Unsupported file type: .${extension}` }, { status: 400 });
    }

    // Auto-detect bank profile and suggest mapping
    const profile = detectBankProfile(headers);
    const headerSet = new Set(headers);

    const findMatch = (candidates: string[]): string | undefined =>
      candidates.find((c) => headerSet.has(c));

    const suggestedMapping: Record<string, string | undefined> = {
      date: findMatch(profile.columnMap.date),
      description: findMatch(profile.columnMap.description),
      amount: findMatch(profile.columnMap.amount),
      credit: profile.columnMap.credit ? findMatch(profile.columnMap.credit) : undefined,
      debit: profile.columnMap.debit ? findMatch(profile.columnMap.debit) : undefined,
      amountSign: profile.amountSign,
    };

    return NextResponse.json({
      headers,
      sampleRows: rows.slice(0, 5),
      totalRows: rows.length,
      suggestedMapping,
      detectedBank: profile.institution,
    });
  } catch (error) {
    console.error("Preview failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Preview failed" },
      { status: 500 }
    );
  }
}
