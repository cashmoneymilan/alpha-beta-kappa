import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/sources/performance - Get performance stats for all sources
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const sortBy = searchParams.get("sort") || "alpha_score";
  const order = searchParams.get("order") || "desc";

  try {
    // Join sources with performance data
    let query = supabase
      .from("sources")
      .select(`
        id,
        handle,
        name,
        type,
        category,
        weight,
        enabled,
        source_performance (
          total_signals,
          signals_with_tickers,
          hit_rate_1h,
          hit_rate_4h,
          hit_rate_1d,
          hit_rate_1w,
          avg_return_1h,
          avg_return_4h,
          avg_return_1d,
          avg_return_1w,
          best_ticker,
          best_ticker_avg_return,
          alpha_score,
          last_calculated_at
        )
      `);

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data: sources, error } = await query as any;

    if (error) {
      throw error;
    }

    // Flatten and sort results
    const results = (sources || []).map((source: any) => ({
      id: source.id,
      handle: source.handle,
      name: source.name,
      type: source.type,
      category: source.category,
      weight: source.weight,
      enabled: source.enabled,
      performance: Array.isArray(source.source_performance)
        ? source.source_performance[0] || null
        : source.source_performance || null,
    }));

    // Sort by performance metric
    results.sort((a: any, b: any) => {
      const aPerf = a.performance;
      const bPerf = b.performance;

      if (!aPerf && !bPerf) return 0;
      if (!aPerf) return 1;
      if (!bPerf) return -1;

      const aVal = aPerf[sortBy as keyof typeof aPerf] ?? 0;
      const bVal = bPerf[sortBy as keyof typeof bPerf] ?? 0;

      return order === "desc"
        ? (bVal as number) - (aVal as number)
        : (aVal as number) - (bVal as number);
    });

    return NextResponse.json({ sources: results });
  } catch (error) {
    console.error("Failed to fetch source performance:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch source performance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
