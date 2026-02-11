import { NextRequest, NextResponse } from "next/server";

const FMP_API_KEY = process.env.FMP_API_KEY;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // If no API key configured, return empty results (client will fallback to static)
  if (!FMP_API_KEY) {
    return NextResponse.json({ results: [], error: "API key not configured" });
  }

  try {
    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) {
      throw new Error(`FMP API error: ${res.status}`);
    }

    const data = await res.json();

    // Transform to our format
    const results = (data || []).map((item: {
      symbol: string;
      name: string;
      stockExchange?: string;
      exchangeShortName?: string;
    }) => ({
      symbol: item.symbol,
      name: item.name,
      exchange: item.stockExchange || item.exchangeShortName || "UNKNOWN",
      type: item.symbol.includes("-") ? "crypto" : "stock"
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Ticker search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
