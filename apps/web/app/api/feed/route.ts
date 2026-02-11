import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  // Parse query params
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const since = searchParams.get("since");
  const until = searchParams.get("until");
  const sourceTypes = searchParams.get("source_types")?.split(",").filter(Boolean);
  const sourceIds = searchParams.get("source_ids")?.split(",").filter(Boolean);
  const tickers = searchParams.get("tickers")?.split(",").filter(Boolean);
  const assetClass = searchParams.get("asset_class");
  const minScore = parseInt(searchParams.get("min_score") || "0");

  try {
    // Build base query (sentiment columns are optional - may not exist in all DBs)
    let query = supabase
      .from("feed_items")
      .select(
        `
        id,
        text,
        full_content,
        url,
        published_at,
        velocity,
        score,
        source_type,
        source:sources(id, handle, name, weight),
        tickers:feed_item_tickers(ticker_symbol, confidence),
        flags:feed_item_flags(flag)
      `,
        { count: "exact" }
      )
      .gte("score", minScore)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (since) {
      query = query.gte("published_at", since);
    }
    if (until) {
      query = query.lte("published_at", until);
    }
    if (sourceTypes?.length) {
      query = query.in("source_type", sourceTypes);
    }
    if (sourceIds?.length) {
      query = query.in("source_id", sourceIds);
    }

    const { data, error, count } = await query as any;

    if (error) {
      console.error("Feed query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by tickers if specified (requires post-processing)
    let items = (data || []) as any[];
    if (tickers?.length) {
      const tickerSet = new Set(tickers.map((t) => t.toUpperCase()));
      items = items.filter((item: any) =>
        item.tickers?.some((t: { ticker_symbol: string }) =>
          tickerSet.has(t.ticker_symbol.toUpperCase())
        )
      );
    }

    // Filter by asset class if specified (requires joining with tickers table)
    // For now, we'll skip this as it requires a more complex query

    // Transform to FlowItem format expected by frontend
    const flowItems = items.map((item: any) => ({
      id: item.id,
      time: item.published_at,
      source: {
        handle: item.source?.handle || "unknown",
        name: item.source?.name || "Unknown",
        weight: item.source?.weight || 5,
      },
      sourceType: item.source_type,
      tickers: item.tickers?.map((t: { ticker_symbol: string }) => t.ticker_symbol) || [],
      text: item.text,
      fullContent: item.full_content,
      velocity: item.velocity,
      score: item.score,
      flags: item.flags?.map((f: { flag: string }) => f.flag) || [],
      url: item.url || "#",
      sentiment: null,
    }));

    return NextResponse.json({
      items: flowItems,
      total: count || 0,
      has_more: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
