import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SignalReturn } from "@/lib/supabase/types";

// Alpaca API configuration
const ALPACA_DATA_URL = "https://data.alpaca.markets/v2";

// Time intervals for measuring returns (in hours)
const INTERVALS = {
  "1h": 1,
  "4h": 4,
  "1d": 24,
  "1w": 168, // 7 * 24
} as const;

type IntervalKey = keyof typeof INTERVALS;

interface AlpacaBar {
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  t: string; // timestamp
  v: number; // volume
}

/**
 * Get historical price at a specific time from Alpaca
 */
async function getHistoricalPrice(
  symbol: string,
  targetTime: Date
): Promise<number | null> {
  const apiKey = process.env.ALPACA_API_KEY_ID;
  const apiSecret = process.env.ALPACA_API_SECRET;

  if (!apiKey || !apiSecret) {
    return null;
  }

  try {
    // Get 1-minute bars around the target time
    const start = new Date(targetTime.getTime() - 60000).toISOString();
    const end = new Date(targetTime.getTime() + 60000).toISOString();

    const response = await fetch(
      `${ALPACA_DATA_URL}/stocks/${symbol}/bars?timeframe=1Min&start=${start}&end=${end}&limit=1`,
      {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret,
        },
      }
    );

    if (!response.ok) {
      // If no data for that minute, try getting latest available
      const latestResponse = await fetch(
        `${ALPACA_DATA_URL}/stocks/${symbol}/trades/latest`,
        {
          headers: {
            "APCA-API-KEY-ID": apiKey,
            "APCA-API-SECRET-KEY": apiSecret,
          },
        }
      );

      if (latestResponse.ok) {
        const data = await latestResponse.json();
        return data.trade?.p || null;
      }
      return null;
    }

    const data = await response.json();
    const bars: AlpacaBar[] = data.bars?.[symbol] || [];

    if (bars.length > 0) {
      return bars[0]!.c; // Return close price
    }

    return null;
  } catch (error) {
    console.error(`Failed to get historical price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Calculate return percentage
 */
function calculateReturn(entryPrice: number, exitPrice: number): number {
  return ((exitPrice - entryPrice) / entryPrice) * 100;
}

export interface AttributionResult {
  processed: number;
  updated: number;
  errors: string[];
}

/**
 * Process return attribution for signals that need measurement
 */
export async function processReturnAttribution(
  supabase: SupabaseClient<Database>,
  interval: IntervalKey
): Promise<AttributionResult> {
  const result: AttributionResult = {
    processed: 0,
    updated: 0,
    errors: [],
  };

  const hoursAgo = INTERVALS[interval];
  const returnField = `return_${interval}` as const;
  const priceField = `price_${interval}` as const;
  const measuredField = `measured_${interval}_at` as const;

  // Find signals that need this interval measured
  // Entry time should be at least X hours ago, and this interval not yet measured
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const { data: signals, error: queryError } = (await supabase
    .from("signal_returns")
    .select("*")
    .lt("entry_time", cutoffTime.toISOString())
    .is(measuredField, null)
    .limit(100)) as any; // Process in batches

  if (queryError) {
    result.errors.push(`Query failed: ${queryError.message}`);
    return result;
  }

  if (!signals?.length) {
    return result;
  }

  for (const signal of signals) {
    result.processed++;

    try {
      // Calculate target time for this interval
      const entryTime = new Date(signal.entry_time);
      const targetTime = new Date(entryTime.getTime() + hoursAgo * 60 * 60 * 1000);

      // Get price at target time
      const exitPrice = await getHistoricalPrice(signal.ticker_symbol, targetTime);

      if (exitPrice === null) {
        result.errors.push(`No price for ${signal.ticker_symbol} at ${targetTime}`);
        continue;
      }

      // Calculate return
      const returnPct = calculateReturn(signal.entry_price, exitPrice);

      // Update the signal
      const updateData: Partial<SignalReturn> = {
        [returnField]: returnPct,
        [priceField]: exitPrice,
        [measuredField]: new Date().toISOString(),
      };

      const { error: updateError } = await (supabase
        .from("signal_returns") as any)
        .update(updateData)
        .eq("id", signal.id);

      if (updateError) {
        result.errors.push(`Update failed for ${signal.id}: ${updateError.message}`);
        continue;
      }

      result.updated++;

      // Rate limit
      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      result.errors.push(
        `Error processing ${signal.ticker_symbol}: ${
          error instanceof Error ? error.message : "Unknown"
        }`
      );
    }
  }

  return result;
}

/**
 * Process all intervals that need updating
 */
export async function processAllIntervals(
  supabase: SupabaseClient<Database>
): Promise<Record<IntervalKey, AttributionResult>> {
  const results: Record<IntervalKey, AttributionResult> = {
    "1h": { processed: 0, updated: 0, errors: [] },
    "4h": { processed: 0, updated: 0, errors: [] },
    "1d": { processed: 0, updated: 0, errors: [] },
    "1w": { processed: 0, updated: 0, errors: [] },
  };

  for (const interval of Object.keys(INTERVALS) as IntervalKey[]) {
    results[interval] = await processReturnAttribution(supabase, interval);
  }

  return results;
}

/**
 * Recalculate source performance aggregates
 */
export async function recalculateSourcePerformance(
  supabase: SupabaseClient<Database>,
  sourceId?: string
): Promise<void> {
  // Get all sources or specific source
  const query = supabase.from("sources").select("id");
  if (sourceId) {
    query.eq("id", sourceId);
  }

  const { data: sources, error: sourcesError } = (await query) as any;

  if (sourcesError || !sources) {
    console.error("Failed to fetch sources:", sourcesError);
    return;
  }

  for (const source of sources) {
    try {
      // Get all feed items for this source
      const { data: feedItems } = (await supabase
        .from("feed_items")
        .select("id")
        .eq("source_id", source.id)) as any;

      if (!feedItems?.length) continue;

      const feedItemIds = feedItems.map((f: any) => f.id);

      // Get signal returns for these items
      const { data: signals } = (await supabase
        .from("signal_returns")
        .select("*")
        .in("feed_item_id", feedItemIds)) as any;

      if (!signals?.length) continue;

      // Calculate aggregates
      const totalSignals = signals.length;
      const signalsWithReturns = signals.filter((s: any) => s.return_1d !== null);

      // Hit rates (direction matched return sign)
      const calculateHitRate = (returnField: string) => {
        const measured = signals.filter((s: any) => s[returnField] !== null);
        if (!measured.length) return null;

        const hits = measured.filter((s: any) => {
          const ret = s[returnField] as number;
          const dir = s.signal_direction;
          // Hit if: bullish and positive return, bearish and negative return, or neutral
          return dir === 0 || (dir > 0 && ret > 0) || (dir < 0 && ret < 0);
        });

        return (hits.length / measured.length) * 100;
      };

      // Average returns
      const calculateAvgReturn = (returnField: string) => {
        const measured = signals.filter((s: any) => s[returnField] !== null);
        if (!measured.length) return null;

        const sum = measured.reduce((acc: number, s: any) => acc + (s[returnField] as number), 0);
        return sum / measured.length;
      };

      // Find best ticker
      const tickerReturns = new Map<string, number[]>();
      for (const signal of signals) {
        if (signal.return_1d !== null) {
          const returns = tickerReturns.get(signal.ticker_symbol) || [];
          returns.push(signal.return_1d);
          tickerReturns.set(signal.ticker_symbol, returns);
        }
      }

      let bestTicker: string | null = null;
      let bestTickerReturn: number | null = null;

      for (const [ticker, returns] of tickerReturns.entries()) {
        const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
        if (bestTickerReturn === null || avg > bestTickerReturn) {
          bestTicker = ticker;
          bestTickerReturn = avg;
        }
      }

      // Calculate alpha score
      const hitRate1h = calculateHitRate("return_1h");
      const hitRate1d = calculateHitRate("return_1d");
      const avgReturn1d = calculateAvgReturn("return_1d");

      const alphaScore = calculateAlphaScore(
        hitRate1h,
        hitRate1d,
        avgReturn1d,
        totalSignals
      );

      // Upsert source performance
      await (supabase.from("source_performance").upsert({
        source_id: source.id,
        total_signals: totalSignals,
        signals_with_tickers: signalsWithReturns.length,
        hit_rate_1h: hitRate1h,
        hit_rate_4h: calculateHitRate("return_4h"),
        hit_rate_1d: hitRate1d,
        hit_rate_1w: calculateHitRate("return_1w"),
        avg_return_1h: calculateAvgReturn("return_1h"),
        avg_return_4h: calculateAvgReturn("return_4h"),
        avg_return_1d: avgReturn1d,
        avg_return_1w: calculateAvgReturn("return_1w"),
        best_ticker: bestTicker,
        best_ticker_avg_return: bestTickerReturn,
        alpha_score: alphaScore,
        last_calculated_at: new Date().toISOString(),
      } as any) as any);
    } catch (error) {
      console.error(`Failed to calculate performance for ${source.id}:`, error);
    }
  }
}

/**
 * Calculate alpha score (matches SQL function)
 */
function calculateAlphaScore(
  hitRate1h: number | null,
  hitRate1d: number | null,
  avgReturn1d: number | null,
  totalSignals: number
): number {
  // Base score from hit rates (0-50 points)
  let score = (hitRate1h ?? 50) * 0.25 + (hitRate1d ?? 50) * 0.25;

  // Return magnitude bonus (0-30 points)
  score += Math.min(30, Math.max(-30, (avgReturn1d ?? 0) * 100));

  // Sample size confidence (0-20 points)
  score += Math.min(20, totalSignals * 0.5);

  return Math.min(100, Math.max(0, score));
}

/**
 * Create a prediction record from a feed item with sentiment
 */
export async function createPrediction(
  supabase: SupabaseClient<Database>,
  feedItemId: string,
  sourceId: string,
  ticker: string,
  direction: 'bullish' | 'bearish' | 'neutral'
): Promise<string | null> {
  try {
    // Get current price for entry
    const entryPrice = await getHistoricalPrice(ticker, new Date());

    const { data, error } = (await supabase
      .from('source_predictions')
      .insert({
        feed_item_id: feedItemId,
        source_id: sourceId,
        ticker,
        direction,
        entry_price: entryPrice,
        outcome_1h: 'pending',
        outcome_4h: 'pending',
        outcome_1d: 'pending',
      } as any)
      .select('id')
      .single()) as any;

    if (error) {
      console.error('Failed to create prediction:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error creating prediction:', error);
    return null;
  }
}

/**
 * Process pending predictions and fill exit prices/outcomes
 */
export async function processPendingPredictions(
  supabase: SupabaseClient<Database>
): Promise<{ processed: number; updated: number; errors: string[] }> {
  const result = { processed: 0, updated: 0, errors: [] as string[] };

  // Get predictions that need processing
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get pending predictions older than 1 hour
  const { data: predictions, error: fetchError } = (await supabase
    .from('source_predictions')
    .select('*')
    .eq('outcome_1h', 'pending')
    .lt('predicted_at', oneHourAgo.toISOString())
    .limit(100)) as any;

  if (fetchError || !predictions) {
    result.errors.push(`Fetch error: ${fetchError?.message || 'No data'}`);
    return result;
  }

  for (const pred of predictions) {
    result.processed++;
    const predTime = new Date(pred.predicted_at);
    const updates: Record<string, unknown> = {};

    try {
      // Process 1h if needed
      if (pred.outcome_1h === 'pending' && predTime < oneHourAgo) {
        const targetTime = new Date(predTime.getTime() + 60 * 60 * 1000);
        const exitPrice = await getHistoricalPrice(pred.ticker, targetTime);

        if (exitPrice && pred.entry_price) {
          const returnPct = calculateReturn(Number(pred.entry_price), exitPrice);
          updates.exit_price_1h = exitPrice;
          updates.return_1h = returnPct;
          updates.outcome_1h = getOutcome(pred.direction, returnPct);
        }
      }

      // Process 4h if needed
      if (pred.outcome_4h === 'pending' && predTime < fourHoursAgo) {
        const targetTime = new Date(predTime.getTime() + 4 * 60 * 60 * 1000);
        const exitPrice = await getHistoricalPrice(pred.ticker, targetTime);

        if (exitPrice && pred.entry_price) {
          const returnPct = calculateReturn(Number(pred.entry_price), exitPrice);
          updates.exit_price_4h = exitPrice;
          updates.return_4h = returnPct;
          updates.outcome_4h = getOutcome(pred.direction, returnPct);
        }
      }

      // Process 1d if needed
      if (pred.outcome_1d === 'pending' && predTime < oneDayAgo) {
        const targetTime = new Date(predTime.getTime() + 24 * 60 * 60 * 1000);
        const exitPrice = await getHistoricalPrice(pred.ticker, targetTime);

        if (exitPrice && pred.entry_price) {
          const returnPct = calculateReturn(Number(pred.entry_price), exitPrice);
          updates.exit_price_1d = exitPrice;
          updates.return_1d = returnPct;
          updates.outcome_1d = getOutcome(pred.direction, returnPct);
        }
      }

      if (Object.keys(updates).length > 0) {
        updates.processed_at = new Date().toISOString();
        const { error: updateError } = await (supabase
          .from('source_predictions') as any)
          .update(updates)
          .eq('id', pred.id);

        if (updateError) {
          result.errors.push(`Update error for ${pred.id}: ${updateError.message}`);
        } else {
          result.updated++;
        }
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 50));
    } catch (error) {
      result.errors.push(`Error processing ${pred.id}: ${error}`);
    }
  }

  return result;
}

/**
 * Determine if prediction was correct based on direction and return
 */
function getOutcome(
  direction: string | null,
  returnPct: number
): 'correct' | 'incorrect' {
  if (!direction || direction === 'neutral') {
    // Neutral predictions are correct if price didn't move much
    return Math.abs(returnPct) < 1 ? 'correct' : 'incorrect';
  }

  if (direction === 'bullish') {
    return returnPct > 0 ? 'correct' : 'incorrect';
  }

  // bearish
  return returnPct < 0 ? 'correct' : 'incorrect';
}

/**
 * Calculate source performance from predictions table
 */
export async function calculateSourcePerformanceFromPredictions(
  supabase: SupabaseClient<Database>,
  sourceId?: string
): Promise<void> {
  const query = supabase.from('sources').select('id, handle, name');
  if (sourceId) {
    query.eq('id', sourceId);
  }

  const { data: sources, error } = (await query) as any;
  if (error || !sources) return;

  for (const source of sources) {
    // Get all processed predictions for this source
    const { data: predictions } = (await supabase
      .from('source_predictions')
      .select('*')
      .eq('source_id', source.id)
      .not('outcome_1d', 'eq', 'pending')) as any;

    if (!predictions?.length) continue;

    // Calculate hit rates
    const hitRate1h = predictions.filter((p: any) => p.outcome_1h === 'correct').length / predictions.filter((p: any) => p.outcome_1h !== 'pending').length;
    const hitRate4h = predictions.filter((p: any) => p.outcome_4h === 'correct').length / predictions.filter((p: any) => p.outcome_4h !== 'pending').length;
    const hitRate1d = predictions.filter((p: any) => p.outcome_1d === 'correct').length / predictions.filter((p: any) => p.outcome_1d !== 'pending').length;

    // Calculate average returns
    const returns1h = predictions.filter((p: any) => p.return_1h !== null).map((p: any) => Number(p.return_1h));
    const returns4h = predictions.filter((p: any) => p.return_4h !== null).map((p: any) => Number(p.return_4h));
    const returns1d = predictions.filter((p: any) => p.return_1d !== null).map((p: any) => Number(p.return_1d));

    const avgReturn1h = returns1h.length > 0 ? returns1h.reduce((a: number, b: number) => a + b, 0) / returns1h.length : 0;
    const avgReturn4h = returns4h.length > 0 ? returns4h.reduce((a: number, b: number) => a + b, 0) / returns4h.length : 0;
    const avgReturn1d = returns1d.length > 0 ? returns1d.reduce((a: number, b: number) => a + b, 0) / returns1d.length : 0;

    // Find best and worst tickers
    const tickerReturns = new Map<string, number[]>();
    for (const pred of predictions) {
      if ((pred as any).return_1d !== null) {
        const returns = tickerReturns.get((pred as any).ticker) || [];
        returns.push(Number((pred as any).return_1d));
        tickerReturns.set((pred as any).ticker, returns);
      }
    }

    let bestTicker = null;
    let bestReturn = -Infinity;
    let worstTicker = null;
    let worstReturn = Infinity;

    for (const [ticker, returns] of tickerReturns.entries()) {
      const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
      if (avg > bestReturn) {
        bestReturn = avg;
        bestTicker = ticker;
      }
      if (avg < worstReturn) {
        worstReturn = avg;
        worstTicker = ticker;
      }
    }

    // Calculate alpha score
    const alphaScore = calculateAlphaScore(
      hitRate1h * 100,
      hitRate1d * 100,
      avgReturn1d,
      predictions.length
    );

    // Upsert performance record
    await supabase.from('source_performance').upsert({
      source_id: source.id,
      hit_rate_1h: hitRate1h * 100,
      hit_rate_4h: hitRate4h * 100,
      hit_rate_1d: hitRate1d * 100,
      avg_return_1h: avgReturn1h,
      avg_return_4h: avgReturn4h,
      avg_return_1d: avgReturn1d,
      total_predictions: predictions.length,
      bullish_count: predictions.filter((p: any) => p.direction === 'bullish').length,
      bearish_count: predictions.filter((p: any) => p.direction === 'bearish').length,
      best_ticker: bestTicker,
      best_return: bestReturn !== -Infinity ? bestReturn : null,
      worst_ticker: worstTicker,
      worst_return: worstReturn !== Infinity ? worstReturn : null,
      alpha_score: alphaScore,
      last_calculated_at: new Date().toISOString(),
    } as any, { onConflict: 'source_id' });
  }
}
