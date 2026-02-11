// FMP (Financial Modeling Prep) API Client
import type {
  FMPQuote,
  FMPBar,
  FMPIntradayBar,
  FMPFullQuote,
  FMPSearchResult,
  FMPCompanyProfile,
  FMPTimeframe,
  TIMEFRAME_MAP,
} from './types';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api';

function getApiKey(): string | null {
  return process.env.FMP_API_KEY || null;
}

async function fetchFMP<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [] as unknown as T;
  }
  const url = new URL(`${FMP_BASE_URL}${endpoint}`);

  // Add API key and any additional params
  url.searchParams.set('apikey', apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`FMP API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// ===== QUOTES =====

/**
 * Get real-time quote for a single symbol
 */
export async function getQuote(symbol: string): Promise<FMPQuote | null> {
  const data = await fetchFMP<FMPQuote[]>(`/v3/quote/${symbol.toUpperCase()}`);
  return data[0] || null;
}

/**
 * Get real-time quotes for multiple symbols (batch)
 */
export async function getQuotes(symbols: string[]): Promise<FMPQuote[]> {
  const symbolList = symbols.map(s => s.toUpperCase()).join(',');
  return fetchFMP<FMPQuote[]>(`/v3/quote/${symbolList}`);
}

/**
 * Get full quote with all details
 */
export async function getFullQuote(symbol: string): Promise<FMPFullQuote | null> {
  const data = await fetchFMP<FMPFullQuote[]>(`/v3/quote/${symbol.toUpperCase()}`);
  return data[0] || null;
}

// ===== HISTORICAL DATA =====

/**
 * Get historical daily bars
 */
export async function getDailyBars(
  symbol: string,
  from?: string,
  to?: string
): Promise<FMPBar[]> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const data = await fetchFMP<{ historical: FMPBar[] }>(
    `/v3/historical-price-full/${symbol.toUpperCase()}`,
    params
  );

  // FMP returns data in reverse chronological order, reverse it
  return (data.historical || []).reverse();
}

/**
 * Get intraday bars (1min, 5min, 15min, 30min, 1hour, 4hour)
 */
export async function getIntradayBars(
  symbol: string,
  interval: FMPTimeframe = '5min',
  from?: string,
  to?: string
): Promise<FMPIntradayBar[]> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  // Intraday endpoint uses a different path structure
  const data = await fetchFMP<FMPIntradayBar[]>(
    `/v3/historical-chart/${interval}/${symbol.toUpperCase()}`,
    params
  );

  // FMP returns data in reverse chronological order, reverse it
  return (data || []).reverse();
}

/**
 * Get bars with automatic interval selection
 */
export async function getBars(
  symbol: string,
  timeframe: string = '1Day',
  limit: number = 100
): Promise<FMPBar[] | FMPIntradayBar[]> {
  // Map our timeframe to FMP format
  const timeframeMap: Record<string, FMPTimeframe> = {
    '1Min': '1min',
    '5Min': '5min',
    '15Min': '15min',
    '30Min': '30min',
    '1Hour': '1hour',
    '4Hour': '4hour',
    '1Day': '1day',
  };

  const fmpTimeframe = timeframeMap[timeframe] || '1day';

  if (fmpTimeframe === '1day') {
    const bars = await getDailyBars(symbol);
    return bars.slice(-limit);
  } else {
    const bars = await getIntradayBars(symbol, fmpTimeframe);
    return bars.slice(-limit);
  }
}

// ===== SEARCH =====

/**
 * Search for symbols
 */
export async function searchSymbols(query: string, limit: number = 10): Promise<FMPSearchResult[]> {
  return fetchFMP<FMPSearchResult[]>('/v3/search', {
    query,
    limit: limit.toString(),
  });
}

// ===== COMPANY INFO =====

/**
 * Get company profile
 */
export async function getCompanyProfile(symbol: string): Promise<FMPCompanyProfile | null> {
  const data = await fetchFMP<FMPCompanyProfile[]>(`/v3/profile/${symbol.toUpperCase()}`);
  return data[0] || null;
}

// ===== WEBSOCKET CONFIG =====

/**
 * Get WebSocket configuration for client-side connection
 */
export function getWebSocketConfig() {
  return {
    apiKey: getApiKey() || '',
    url: 'wss://websockets.financialmodelingprep.com',
  };
}

// ===== PRICE SNAPSHOT =====

/**
 * Get a simple price snapshot for a symbol
 * Returns the essential price data needed for UI display
 */
export async function getPriceSnapshot(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
} | null> {
  const quote = await getQuote(symbol);
  if (!quote) return null;

  return {
    symbol: quote.symbol,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changesPercentage,
    volume: quote.volume,
    timestamp: quote.timestamp * 1000, // Convert to ms
  };
}

/**
 * Get price snapshots for multiple symbols
 */
export async function getPriceSnapshots(symbols: string[]): Promise<Map<string, {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}>> {
  const quotes = await getQuotes(symbols);
  const result = new Map();

  for (const quote of quotes) {
    result.set(quote.symbol, {
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changesPercentage,
      volume: quote.volume,
      timestamp: quote.timestamp * 1000,
    });
  }

  return result;
}
