/**
 * Prediction Market Signal Ingester
 *
 * Fetches PM sentiment events from the prediction-market-analysis dashboard API
 * and creates feed_items in the alpha_beta_kappa database.
 *
 * Validation gate result (Phase 2.5): PARTIAL PROCEED
 * - Only flow_acceleration BULLISH events are statistically predictive
 *   (65.1% hit rate at 1w, CI [59.0%, 70.7%])
 * - Other event types ingested as informational only (no predictions created)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { calculateScore } from "@/lib/scoring";
import { capturePriceSnapshots } from "./price-snapshot";
import { createPrediction } from "./return-attribution";

const PM_DASHBOARD_URL =
  process.env.PM_DASHBOARD_URL || "http://localhost:3010";

// PM event as returned by the dashboard API
interface PmEvent {
  date: string;
  event_type: string;
  category: string;
  signal_value: number | null;
  threshold: number | null;
  severity: string;
  direction: string;
  description: string;
  mapped_tickers: string[];
  underlying_markets: string[];
  is_entry: boolean;
  is_exit: boolean;
}

export interface PmIngestResult {
  success: boolean;
  sourcesProcessed: number;
  itemsIngested: number;
  predictionsCreated: number;
  errors: string[];
}

/**
 * Per-ticker sentiment based on event direction and asset class.
 *
 * Rising uncertainty is bearish for SPY but bullish for safe havens.
 * Bullish flow is positive for equities and crypto, neutral for safe havens.
 */
type SentimentLabel = "positive" | "negative" | "neutral";

const SAFE_HAVEN_TICKERS = new Set(["GLD", "TLT", "SLV"]);
const CRYPTO_TICKERS = new Set(["BTC", "ETH", "SOL", "COIN"]);

function getTickerSentiment(
  direction: string,
  ticker: string
): SentimentLabel {
  const isSafeHaven = SAFE_HAVEN_TICKERS.has(ticker);
  const isCrypto = CRYPTO_TICKERS.has(ticker);

  switch (direction) {
    case "bullish":
      return isSafeHaven ? "neutral" : "positive";
    case "bearish":
      return isSafeHaven ? "positive" : "negative";
    case "uncertainty_rising":
      return isSafeHaven ? "positive" : "negative";
    case "uncertainty_falling":
      return isSafeHaven ? "neutral" : "positive";
    default:
      return "neutral";
  }
}

/**
 * Get the majority sentiment direction for display purposes.
 */
function getMajoritySentiment(
  direction: string,
  tickers: string[]
): { label: SentimentLabel; score: number; normalized: number } {
  if (tickers.length === 0) {
    return { label: "neutral", score: 0.5, normalized: 0 };
  }

  const sentiments = tickers.map((t) => getTickerSentiment(direction, t));
  const counts = { positive: 0, negative: 0, neutral: 0 };
  for (const s of sentiments) counts[s]++;

  let label: SentimentLabel = "neutral";
  let max = counts.neutral;
  if (counts.positive > max) {
    label = "positive";
    max = counts.positive;
  }
  if (counts.negative > max) {
    label = "negative";
  }

  // Confidence based on how many tickers agree
  const score = max / tickers.length;
  const normalized = label === "positive" ? score : label === "negative" ? -score : 0;
  return { label, score, normalized };
}

/**
 * Determines if an event should create actionable predictions.
 *
 * Per Phase 2.5 validation: only flow_acceleration BULLISH events are predictive.
 */
function isActionableEvent(event: PmEvent): boolean {
  return (
    event.event_type === "flow_acceleration" && event.direction === "bullish"
  );
}

/**
 * Calculate velocity for PM events.
 *
 * multi_alignment events get base velocity of 90 (highest priority).
 * Other high-severity = 80, moderate = 50.
 */
function calculatePmVelocity(event: PmEvent): number {
  if (event.event_type === "multi_alignment") return 90;
  if (event.severity === "high") return 80;
  if (event.severity === "moderate") return 50;
  return 30;
}

/**
 * Fetch PM events from the dashboard API.
 */
async function fetchPmEvents(
  startDate: string,
  severity?: string,
  category?: string
): Promise<PmEvent[]> {
  const params = new URLSearchParams({ start: startDate });
  if (severity) params.set("severity", severity);
  if (category) params.set("category", category);

  const url = `${PM_DASHBOARD_URL}/api/pm-events?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `PM dashboard API failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.rows as PmEvent[];
}

/**
 * Ingest PM events into the feed.
 */
export async function ingestPmSignals(
  supabase: SupabaseClient<Database>,
  options?: { category?: string }
): Promise<PmIngestResult> {
  const result: PmIngestResult = {
    success: true,
    sourcesProcessed: 0,
    itemsIngested: 0,
    predictionsCreated: 0,
    errors: [],
  };

  // Get enabled PM sources
  const { data: sources, error: sourcesError } = (await supabase
    .from("sources")
    .select("*")
    .eq("type", "prediction_market")
    .eq("enabled", true)) as any;

  if (sourcesError) {
    result.success = false;
    result.errors.push(`Failed to fetch PM sources: ${sourcesError.message}`);
    return result;
  }

  if (!sources?.length) {
    result.errors.push("No PM sources configured. Run migration 007 first.");
    return result;
  }

  // Use the composite source for ingestion
  const compositeSource = sources.find(
    (s: any) => s.handle === "pm-composite"
  );
  if (!compositeSource) {
    result.errors.push("pm-composite source not found");
    return result;
  }

  // Fetch events from last 2 days (with buffer for timezone differences)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const startDate = twoDaysAgo.toISOString().split("T")[0]!;

  let events: PmEvent[];
  try {
    events = await fetchPmEvents(
      startDate,
      "moderate,high", // Only ingest severity >= moderate
      options?.category
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    result.success = false;
    result.errors.push(`Failed to fetch PM events: ${msg}`);
    return result;
  }

  console.log(`PM ingester: ${events.length} events from dashboard`);

  for (const event of events) {
    try {
      // Generate external_id for dedup
      // Include hour for crypto hourly events
      const externalId = `pm_${event.event_type}_${event.category}_${event.date}`;

      // Check for duplicates
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("external_id", externalId)
        .eq("source_id", compositeSource.id)
        .single();

      if (existing) continue;

      const tickers = event.mapped_tickers || [];
      const sentiment = getMajoritySentiment(event.direction, tickers);
      const velocity = calculatePmVelocity(event);
      const isActionable = isActionableEvent(event);

      const score = calculateScore({
        sourceWeight: compositeSource.weight,
        velocity,
        publishedAt: new Date(event.date),
        tickerCount: tickers.length,
        isMultiSource: false,
        isBreaking:
          event.event_type === "multi_alignment" || event.is_exit,
        sentiment: { label: sentiment.label, score: sentiment.score, normalized: sentiment.normalized },
      });

      // Build full_content JSON with event details
      const fullContent = JSON.stringify({
        event_type: event.event_type,
        category: event.category,
        signal_value: event.signal_value,
        threshold: event.threshold,
        severity: event.severity,
        direction: event.direction,
        underlying_markets: event.underlying_markets,
        is_entry: event.is_entry,
        is_exit: event.is_exit,
        actionable: isActionable,
      });

      // Insert feed item
      const { data: feedItem, error: insertError } = (await supabase
        .from("feed_items")
        .insert({
          external_id: externalId,
          source_id: compositeSource.id,
          source_type: "prediction_market",
          text: event.description,
          full_content: fullContent,
          published_at: new Date(event.date).toISOString(),
          velocity,
          score,
          sentiment_label: sentiment.label,
          sentiment_score: sentiment.score,
          sentiment_analyzed_at: new Date().toISOString(),
        } as any)
        .select()
        .single()) as any;

      if (insertError) {
        console.error("Failed to insert PM event:", insertError);
        continue;
      }

      // Link tickers
      if (feedItem && tickers.length > 0) {
        for (const ticker of tickers) {
          await supabase
            .from("feed_item_tickers")
            .insert({
              feed_item_id: feedItem.id,
              ticker_symbol: ticker,
              confidence: 1.0,
            } as any)
            .select();
        }
      }

      // Add flags
      if (feedItem) {
        // "new" flag for recent events
        const ageMs =
          Date.now() - new Date(event.date).getTime();
        if (ageMs < 24 * 60 * 60 * 1000) {
          await supabase.from("feed_item_flags").insert({
            feed_item_id: feedItem.id,
            flag: "new",
          } as any);
        }

        // "breaking" flag for multi_alignment and exit signals
        if (
          event.event_type === "multi_alignment" ||
          event.is_exit
        ) {
          await supabase.from("feed_item_flags").insert({
            feed_item_id: feedItem.id,
            flag: "breaking",
          } as any);
        }
      }

      // Create predictions and capture price snapshots
      // ONLY for actionable events (flow_acceleration bullish per validation gate)
      if (feedItem && isActionable && tickers.length > 0) {
        // Capture price snapshots
        await capturePriceSnapshots(
          supabase,
          feedItem.id,
          tickers,
          event.description
        );

        // Create per-ticker predictions with correct directional sentiment
        for (const ticker of tickers) {
          const tickerSentiment = getTickerSentiment(
            event.direction,
            ticker
          );
          const predDirection =
            tickerSentiment === "positive"
              ? "bullish"
              : tickerSentiment === "negative"
                ? "bearish"
                : "neutral";

          await createPrediction(
            supabase,
            feedItem.id,
            compositeSource.id,
            ticker,
            predDirection
          );
          result.predictionsCreated++;
        }
      }

      result.itemsIngested++;

      // Small delay for rate limiting
      await new Promise((r) => setTimeout(r, 50));
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Event ${event.date}/${event.event_type}: ${msg}`);
      console.error("PM event processing error:", error);
    }
  }

  result.sourcesProcessed = 1;
  result.success = result.errors.length === 0;

  // Update last_fetched_at on composite source
  await (supabase.from("sources") as any)
    .update({ last_fetched_at: new Date().toISOString() })
    .eq("id", compositeSource.id);

  console.log(
    `PM ingester complete: ${result.itemsIngested} items, ${result.predictionsCreated} predictions`
  );

  return result;
}
