import { NextRequest, NextResponse } from "next/server";

// Yahoo Finance API endpoint (unofficial but reliable)
const YAHOO_API = "https://query1.finance.yahoo.com/v8/finance/chart";

// In-memory cache for fallback when Yahoo API fails
const cache = new Map<string, { data: MarketData; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  exchange: string;
  timestamp: number;
  // Intraday price data for chart
  chartData: { time: number; price: number }[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  // Check in-memory cache first
  const cached = cache.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    // Fetch from Yahoo Finance with proper headers
    const response = await fetch(
      `${YAHOO_API}/${upperSymbol}?interval=5m&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 60 }, // Next.js cache for 60 seconds
      }
    );

    if (!response.ok) {
      // Return cached data if available, even if stale
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: { "X-Cache": "STALE" },
        });
      }
      return NextResponse.json(
        { error: "Failed to fetch market data", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return NextResponse.json(
        { error: "Symbol not found" },
        { status: 404 }
      );
    }

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const timestamps = result.timestamp || [];

    // Build chart data from intraday prices
    const chartData: { time: number; price: number }[] = [];
    if (timestamps.length && quote?.close) {
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.close[i] !== null) {
          chartData.push({
            time: timestamps[i] * 1000,
            price: quote.close[i],
          });
        }
      }
    }

    const marketData: MarketData = {
      symbol: meta.symbol,
      name: meta.shortName || meta.longName || meta.symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      previousClose: meta.previousClose,
      open: meta.regularMarketOpen || meta.previousClose,
      dayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice,
      dayLow: meta.regularMarketDayLow || meta.regularMarketPrice,
      volume: meta.regularMarketVolume || 0,
      avgVolume: meta.averageDailyVolume3Month || 0,
      marketCap: null, // Not available in chart endpoint
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || meta.regularMarketPrice,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || meta.regularMarketPrice,
      currency: meta.currency || "USD",
      exchange: meta.exchangeName || meta.exchange,
      timestamp: Date.now(),
      chartData,
    };

    // Update in-memory cache
    cache.set(upperSymbol, { data: marketData, timestamp: Date.now() });

    return NextResponse.json(marketData, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Market data fetch error:", error);

    // Return cached data if available, even if stale
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "STALE" },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch market data. Please try again later." },
      { status: 500 }
    );
  }
}
