import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEV_USER_ID } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const userId = DEV_USER_ID;

  const searchParams = req.nextUrl.searchParams;
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  try {
    // Get all transactions for the user (with optional date filter)
    let query = supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .eq("is_duplicate", false);

    if (fromDate) query = query.gte("date", fromDate);
    if (toDate) query = query.lte("date", toDate);

    const { data: transactions, error } = await query;
    if (error) throw error;

    const txns = transactions || [];

    // Filter out transactions whose category is marked exclude_from_totals
    const countableTxns = txns.filter(
      (t) => !t.category?.exclude_from_totals
    );

    // Calculate stats (using only countable transactions)
    const totalIncome = countableTxns
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSpend = countableTxns
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const netSavings = totalIncome - totalSpend;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Spend by category (excluding transfer/payment categories)
    const categorySpend = new Map<string, { name: string; amount: number }>();
    for (const t of countableTxns) {
      if (t.amount >= 0) continue; // Skip income
      const catName = t.category?.name || "Uncategorized";
      const catId = t.category_id || "uncategorized";
      const existing = categorySpend.get(catId) || { name: catName, amount: 0 };
      existing.amount += Math.abs(Number(t.amount));
      categorySpend.set(catId, existing);
    }

    const spendByCategory = Array.from(categorySpend.entries())
      .map(([categoryId, { name, amount }]) => ({
        categoryId,
        categoryName: name,
        amount: Math.round(amount * 100) / 100,
        percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend (excluding transfer/payment categories)
    const monthlyMap = new Map<
      string,
      { income: number; spend: number }
    >();
    for (const t of countableTxns) {
      const month = t.date.substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { income: 0, spend: 0 };
      if (t.amount > 0) {
        existing.income += Number(t.amount);
      } else {
        existing.spend += Math.abs(Number(t.amount));
      }
      monthlyMap.set(month, existing);
    }

    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { income, spend }]) => ({
        month,
        income: Math.round(income * 100) / 100,
        spend: Math.round(spend * 100) / 100,
        net: Math.round((income - spend) * 100) / 100,
      }));

    return NextResponse.json({
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalSpend: Math.round(totalSpend * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      spendByCategory,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Dashboard stats failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
