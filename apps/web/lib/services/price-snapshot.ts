import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// FMP API configuration (primary data source)
const FMP_BASE_URL = "https://financialmodelingprep.com/api";

interface FMPQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  volume: number;
  timestamp: number;
}

/**
 * Get current price for a ticker from FMP (Financial Modeling Prep)
 * FMP provides accurate, real-time data that matches broker prices
 */
async function getFMPPrice(
  symbol: string
): Promise<{ price: number; bid: number | null; ask: number | null } | null> {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    console.error("Missing FMP API key for price snapshot");
    return null;
  }

  try {
    const response = await fetch(
      `${FMP_BASE_URL}/v3/quote/${symbol.toUpperCase()}?apikey=${apiKey}`
    );

    if (response.ok) {
      const data: FMPQuote[] = await response.json();
      const quote = data[0];

      if (quote) {
        // FMP quote doesn't include bid/ask in basic endpoint
        // Estimate spread based on price (typical spread is ~0.01% for liquid stocks)
        const estimatedSpread = Math.max(0.01, quote.price * 0.0001);
        return {
          price: quote.price,
          bid: quote.price - estimatedSpread,
          ask: quote.price + estimatedSpread,
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch FMP price for ${symbol}:`, error);
    return null;
  }
}

// Fallback: Alpaca API configuration (for options and backup)
const ALPACA_DATA_URL = "https://data.alpaca.markets/v2";

interface AlpacaQuote {
  ap: number; // ask price
  bp: number; // bid price
  as: number; // ask size
  bs: number; // bid size
  t: string;  // timestamp
}

interface AlpacaTrade {
  p: number;  // price
  s: number;  // size
  t: string;  // timestamp
}

/**
 * Get current price for a ticker from Alpaca (fallback)
 */
async function getAlpacaPrice(
  symbol: string
): Promise<{ price: number; bid: number | null; ask: number | null } | null> {
  const apiKey = process.env.ALPACA_API_KEY_ID;
  const apiSecret = process.env.ALPACA_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("Missing Alpaca API credentials for price snapshot");
    return null;
  }

  try {
    // Try to get latest quote first (has bid/ask)
    const quoteResponse = await fetch(
      `${ALPACA_DATA_URL}/stocks/${symbol}/quotes/latest`,
      {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret,
        },
      }
    );

    if (quoteResponse.ok) {
      const data = await quoteResponse.json();
      const quote: AlpacaQuote = data.quote;
      const midPrice = (quote.bp + quote.ap) / 2;
      return {
        price: midPrice,
        bid: quote.bp,
        ask: quote.ap,
      };
    }

    // Fallback to latest trade
    const tradeResponse = await fetch(
      `${ALPACA_DATA_URL}/stocks/${symbol}/trades/latest`,
      {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret,
        },
      }
    );

    if (tradeResponse.ok) {
      const data = await tradeResponse.json();
      const trade: AlpacaTrade = data.trade;
      return {
        price: trade.p,
        bid: null,
        ask: null,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch Alpaca price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get price from best available source
 * Priority: FMP (accurate) -> Alpaca (fallback)
 */
async function getPrice(
  symbol: string
): Promise<{ price: number; bid: number | null; ask: number | null } | null> {
  // Try FMP first (more accurate, matches broker prices)
  const fmpPrice = await getFMPPrice(symbol);
  if (fmpPrice) return fmpPrice;

  // Fallback to Alpaca
  return getAlpacaPrice(symbol);
}

/**
 * Detect signal direction from text sentiment
 * Returns: 1 (bullish), -1 (bearish), 0 (neutral)
 */
function detectSignalDirection(text: string): number {
  const lowerText = text.toLowerCase();

  // Bullish indicators
  const bullishPatterns = [
    /\bbuy\b/, /\blong\b/, /\bbullish\b/, /\bcalls?\b/, /\bbreakout\b/,
    /\bupside\b/, /\brally\b/, /\bsurge\b/, /\bmooning\b/, /\b🚀\b/,
    /\bunusual call/i, /\bcall sweep/i, /\bcall flow/i,
    /\bbeat\b.*\bestimates\b/, /\bupgrade\b/, /\braises?\b.*\btarget\b/,
  ];

  // Bearish indicators
  const bearishPatterns = [
    /\bsell\b/, /\bshort\b/, /\bbearish\b/, /\bputs?\b/, /\bbreakdown\b/,
    /\bdownside\b/, /\bcrash\b/, /\btanking\b/, /\bdumping\b/,
    /\bunusual put/i, /\bput sweep/i, /\bput flow/i,
    /\bmiss\b.*\bestimates\b/, /\bdowngrade\b/, /\blowers?\b.*\btarget\b/,
  ];

  let bullishScore = 0;
  let bearishScore = 0;

  for (const pattern of bullishPatterns) {
    if (pattern.test(lowerText)) bullishScore++;
  }

  for (const pattern of bearishPatterns) {
    if (pattern.test(lowerText)) bearishScore++;
  }

  if (bullishScore > bearishScore) return 1;
  if (bearishScore > bullishScore) return -1;
  return 0;
}

export interface SnapshotResult {
  ticker: string;
  success: boolean;
  price?: number;
  error?: string;
}

/**
 * Capture price snapshots for all tickers mentioned in a feed item
 */
export async function capturePriceSnapshots(
  supabase: SupabaseClient<Database>,
  feedItemId: string,
  tickers: string[],
  text: string
): Promise<SnapshotResult[]> {
  const results: SnapshotResult[] = [];
  const signalDirection = detectSignalDirection(text);
  const now = new Date().toISOString();

  for (const ticker of tickers) {
    try {
      // Get current price (FMP primary, Alpaca fallback)
      const priceData = await getPrice(ticker);

      if (!priceData) {
        results.push({
          ticker,
          success: false,
          error: "Could not fetch price",
        });
        continue;
      }

      // Insert price snapshot
      const { error: snapshotError } = await supabase
        .from("price_snapshots")
        .upsert({
          feed_item_id: feedItemId,
          ticker_symbol: ticker,
          snapshot_time: now,
          price: priceData.price,
          bid: priceData.bid,
          ask: priceData.ask,
        } as any);

      if (snapshotError) {
        console.error(`Failed to insert snapshot for ${ticker}:`, snapshotError);
        results.push({
          ticker,
          success: false,
          error: snapshotError.message,
        });
        continue;
      }

      // Create signal returns entry for tracking
      const { error: returnError } = await supabase
        .from("signal_returns")
        .upsert({
          feed_item_id: feedItemId,
          ticker_symbol: ticker,
          entry_price: priceData.price,
          entry_time: now,
          signal_direction: signalDirection,
        } as any);

      if (returnError) {
        console.error(`Failed to insert signal return for ${ticker}:`, returnError);
      }

      results.push({
        ticker,
        success: true,
        price: priceData.price,
      });

      // Small delay to respect rate limits
      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      results.push({
        ticker,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Batch capture for multiple feed items (used during bulk ingestion)
 */
export async function batchCapturePriceSnapshots(
  supabase: SupabaseClient<Database>,
  items: Array<{ feedItemId: string; tickers: string[]; text: string }>
): Promise<Map<string, SnapshotResult[]>> {
  const results = new Map<string, SnapshotResult[]>();

  for (const item of items) {
    const itemResults = await capturePriceSnapshots(
      supabase,
      item.feedItemId,
      item.tickers,
      item.text
    );
    results.set(item.feedItemId, itemResults);
  }

  return results;
}
