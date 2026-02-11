import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

// Cached tickers loaded from database
let KNOWN_TICKERS: Map<string, string> = new Map(); // alias -> symbol
let TICKER_SYMBOLS: Set<string> = new Set();

// Common false positives to filter out
const FALSE_POSITIVES = new Set([
  "CEO", "CFO", "COO", "CTO", "IPO", "ETF", "SEC", "GDP", "CPI", "PMI",
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY", "CHF",
  "NYSE", "NASDAQ", "DOW", "API", "AI", "ML", "US", "UK", "EU",
  "AM", "PM", "EST", "PST", "UTC", "Q1", "Q2", "Q3", "Q4",
  "YTD", "YOY", "MOM", "WOW", "ATH", "ATL", "EPS", "PE", "PB",
  "ROI", "ROE", "ROA", "EBITDA", "DCF", "NPV", "IRR",
  "FED", "FOMC", "ECB", "BOJ", "PPI", "PCE", "NFP",
  "IMO", "FWIW", "TBH", "BTW", "FYI", "ICYMI", "TLDR",
  "THE", "AND", "FOR", "NOT", "BUT", "ARE", "WAS", "HAS",
]);

/**
 * Load known tickers from database into memory cache
 */
export async function loadKnownTickers(
  supabase: SupabaseClient<Database>
): Promise<void> {
  const { data, error } = await supabase
    .from("tickers")
    .select("symbol, aliases");

  if (error) {
    console.error("Failed to load tickers:", error);
    return;
  }

  KNOWN_TICKERS = new Map();
  TICKER_SYMBOLS = new Set();

  for (const ticker of (data || []) as any[]) {
    const symbol = (ticker.symbol as string).toUpperCase();
    TICKER_SYMBOLS.add(symbol);
    KNOWN_TICKERS.set(symbol, symbol);

    // Add aliases
    for (const alias of (ticker.aliases || []) as string[]) {
      KNOWN_TICKERS.set(alias.toUpperCase(), symbol);
    }
  }

  console.log(`Loaded ${TICKER_SYMBOLS.size} tickers with ${KNOWN_TICKERS.size} aliases`);
}

/**
 * Check if tickers are loaded
 */
export function isTickersLoaded(): boolean {
  return TICKER_SYMBOLS.size > 0;
}

export interface ExtractedTicker {
  symbol: string;
  confidence: number;
}

// Regex patterns
const CASHTAG_PATTERN = /\$([A-Z]{1,5})\b/gi;
const TICKER_PATTERN = /\b([A-Z]{2,5})\b/g;

/**
 * Extract ticker symbols from text
 */
export function extractTickers(text: string): ExtractedTicker[] {
  const found: Map<string, number> = new Map();

  // 1. High confidence: Cashtags ($NVDA)
  const cashtagMatches = text.matchAll(CASHTAG_PATTERN);
  for (const match of cashtagMatches) {
    const potential = match[1]!.toUpperCase();

    // Skip false positives
    if (FALSE_POSITIVES.has(potential)) continue;

    // Check if it's a known ticker
    const symbol = KNOWN_TICKERS.get(potential);
    if (symbol) {
      found.set(symbol, 1.0); // Full confidence for cashtags
    } else if (potential.length >= 2 && potential.length <= 5) {
      // Unknown but valid cashtag format - medium-high confidence
      found.set(potential, 0.8);
    }
  }

  // 2. Medium confidence: Uppercase words that match known tickers
  const wordMatches = text.matchAll(TICKER_PATTERN);
  for (const match of wordMatches) {
    const potential = match[1]!.toUpperCase();

    // Skip false positives
    if (FALSE_POSITIVES.has(potential)) continue;

    // Only match if it's a known ticker (no guessing for non-cashtags)
    if (TICKER_SYMBOLS.has(potential) && !found.has(potential)) {
      found.set(potential, 0.7);
    }
  }

  // 3. Check for aliases in lowercase text
  const lowerText = text.toLowerCase();
  for (const [alias, symbol] of KNOWN_TICKERS.entries()) {
    if (alias.length > 3 && !TICKER_SYMBOLS.has(alias)) {
      // Only check longer aliases (e.g., "nvidia" but not "amd")
      if (lowerText.includes(alias.toLowerCase()) && !found.has(symbol)) {
        found.set(symbol, 0.6);
      }
    }
  }

  return Array.from(found.entries())
    .map(([symbol, confidence]) => ({ symbol, confidence }))
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Quick extract for when database isn't available (uses hardcoded common tickers)
 */
const COMMON_TICKERS = new Set([
  "NVDA", "AMD", "AVGO", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA",
  "SPY", "QQQ", "IWM", "DIA", "TLT", "HYG", "LQD",
  "CCJ", "UEC", "UUUU", "DNN",
  "GLD", "SLV", "NEM", "GOLD", "MP",
  "BTC", "ETH", "SOL",
  "XLE", "USO", "XOP",
]);

export function extractTickersQuick(text: string): string[] {
  const found = new Set<string>();

  // Cashtags
  const cashtagMatches = text.matchAll(CASHTAG_PATTERN);
  for (const match of cashtagMatches) {
    const ticker = match[1]!.toUpperCase();
    if (!FALSE_POSITIVES.has(ticker)) {
      found.add(ticker);
    }
  }

  // Known tickers
  const wordMatches = text.matchAll(TICKER_PATTERN);
  for (const match of wordMatches) {
    const ticker = match[1]!.toUpperCase();
    if (COMMON_TICKERS.has(ticker)) {
      found.add(ticker);
    }
  }

  return Array.from(found);
}
