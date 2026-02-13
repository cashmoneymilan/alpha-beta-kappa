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
  "CEO", "CIO", "COO", "CMO", "SVP", "EVP", "VP",
  "LLC", "INC", "LTD", "PLC", "AGM", "IPO",
  "PT", "TP", "BUY", "SELL", "HOLD",
  "DD", "OTM", "ITM", "ATM", "IV", "DTE", "OI",
  "GDP", "QE", "QT", "YCC", "ZIRP",
  "IS", "AS", "BE", "BY", "HE", "IF", "IN", "NO", "OF",
  "OR", "SO", "TO", "UP", "WE", "DO", "GO", "HI",
  "AN", "AT", "AH", "OK", "OH", "EM",
]);

// S&P 500 symbols that overlap with common English words.
// These should ONLY match via $CASHTAG syntax, never bare uppercase words.
const CASHTAG_ONLY_TICKERS = new Set([
  "ALL", "IT", "ON", "NOW", "RE", "SO", "AN", "DO", "LOW", "KEY",
  "MAN", "TOP", "BIG", "AIR", "SEE", "AMP", "MAS", "BEN",
  "A", "C", "D", "F", "J", "K", "L", "O", "T", "U", "V",
  "ARE", "MO", "PM", "IP", "IR", "GL", "ES", "CE",
  "DD", "ED", "GE", "PH",
  "DAY", "APP", "NET", "PATH", "BALL", "FAST", "WELL",
  "COST", "POOL", "TEAM", "DASH", "SNAP",
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

    // Skip CASHTAG_ONLY tickers — these only match via $SYMBOL
    if (CASHTAG_ONLY_TICKERS.has(potential)) continue;

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
  // Mega-cap tech
  "NVDA", "AMD", "AVGO", "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "META", "TSLA",
  "ORCL", "CRM", "ADBE", "NFLX", "INTU", "QCOM", "AMAT", "MU", "LRCX", "KLAC",
  "SNPS", "CDNS", "CRWD", "PANW", "ANET", "MRVL", "ARM", "SMCI", "DELL", "PLTR",
  // Indices/ETFs
  "SPY", "QQQ", "IWM", "DIA", "TLT", "HYG", "LQD",
  "XLF", "XLK", "XLV", "XLE", "XLI", "XLU", "XLY", "XLC", "XLB", "XLP", "XLRE",
  // Financials
  "JPM", "BAC", "WFC", "GS", "MS", "BLK", "SCHW", "COF",
  // Healthcare
  "LLY", "UNH", "JNJ", "ABBV", "MRK", "PFE", "AMGN", "MRNA", "ISRG", "VRTX",
  // Consumer/Industrial
  "WMT", "COST", "HD", "MCD", "NKE", "SBUX", "BA", "CAT", "GE", "HON",
  // Energy
  "XOM", "CVX", "COP", "SLB", "OXY",
  // Uranium
  "CCJ", "UEC", "UUUU", "DNN",
  // Metals
  "GLD", "SLV", "NEM", "GOLD", "MP",
  // Crypto
  "BTC", "ETH", "SOL", "DOGE", "XRP", "ADA", "AVAX", "LINK", "MATIC",
  // Oil/Commodities
  "USO", "XOP",
  // Macro
  "VIX", "DXY", "TNX",
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

// Additional false positives for auto-discovery validation
const AUTO_DISCOVER_BLACKLIST = new Set([
  ...FALSE_POSITIVES,
  ...CASHTAG_ONLY_TICKERS,
  // Common short words that appear as cashtags but aren't tickers
  "THE", "AND", "FOR", "NOT", "BUT", "ARE", "WAS", "HAS",
  "NEW", "OLD", "BIG", "TOP", "OUT", "OFF", "RUN", "WIN",
  "RED", "HOT", "GOT", "SET", "HIT", "CUT", "PUT", "GET",
  "ADD", "LET", "USE", "END", "TRY", "WAY", "OWN", "DID",
  "SAY", "MAY", "TWO", "WAR", "OIL", "GAS", "TAX",
]);

/**
 * Auto-discover and insert an unknown ticker into the database.
 * Only inserts symbols that look valid (2-5 uppercase, not in blacklist).
 * Returns true if the ticker was newly inserted.
 */
export async function autoDiscoverTicker(
  supabase: SupabaseClient<Database>,
  symbol: string
): Promise<boolean> {
  const upper = symbol.toUpperCase();

  // Validate: 2-5 uppercase alpha only
  if (!/^[A-Z]{2,5}$/.test(upper)) return false;

  // Skip known false positives
  if (AUTO_DISCOVER_BLACKLIST.has(upper)) return false;

  // Already in cache
  if (TICKER_SYMBOLS.has(upper)) return false;

  // Insert with name: null as marker for auto-discovered
  const { error } = await supabase
    .from("tickers")
    .insert({ symbol: upper, name: null, asset_class: "equities", aliases: [] } as any);

  if (error) {
    // Likely duplicate (race condition) — not a problem
    if (error.code === "23505") return false;
    console.error(`Auto-discover failed for ${upper}:`, error.message);
    return false;
  }

  // Add to in-memory cache
  TICKER_SYMBOLS.add(upper);
  KNOWN_TICKERS.set(upper, upper);

  console.log(`Auto-discovered ticker: ${upper}`);
  return true;
}

/**
 * Extract tickers with auto-discovery — runs normal extraction, then
 * auto-inserts any unknown cashtags that were found with 0.8 confidence.
 */
export async function extractTickersWithAutoDiscovery(
  supabase: SupabaseClient<Database>,
  text: string
): Promise<ExtractedTicker[]> {
  const tickers = extractTickers(text);

  // Find unknown cashtags (confidence 0.8 = unknown but valid cashtag format)
  const unknowns = tickers.filter(t => t.confidence === 0.8);

  if (unknowns.length > 0) {
    await Promise.allSettled(
      unknowns.map(t => autoDiscoverTicker(supabase, t.symbol))
    );

    // Upgrade confidence for newly-discovered tickers
    for (const t of tickers) {
      if (t.confidence === 0.8 && TICKER_SYMBOLS.has(t.symbol)) {
        t.confidence = 0.9; // Now known via auto-discovery
      }
    }
  }

  return tickers;
}
