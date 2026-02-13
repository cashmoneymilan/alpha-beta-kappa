import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { extractTickersWithAutoDiscovery, loadKnownTickers, isTickersLoaded } from "@/lib/ticker-extraction";
import { calculateScore, calculateVelocity } from "@/lib/scoring";
import { capturePriceSnapshots } from "./price-snapshot";
import { fetchUserTweets, isTwitterConfigured, type Tweet } from "./twitter-client";

export interface IngestResult {
  success: boolean;
  sourcesProcessed: number;
  itemsIngested: number;
  errors: string[];
  batch?: { current: number; total: number };
}

export interface TwitterIngestOptions {
  /** Which batch to process (1-indexed). If omitted, processes all sources. */
  batch?: number;
  /** How many sources per batch. Default: 15. */
  batchSize?: number;
}

/**
 * Ingest Twitter feeds from enabled sources.
 * Supports batching to stay under Vercel's 60s function timeout.
 */
export async function ingestTwitterFeeds(
  supabase: SupabaseClient<Database>,
  sourceIds?: string[],
  options?: TwitterIngestOptions
): Promise<IngestResult> {
  const result: IngestResult = {
    success: true,
    sourcesProcessed: 0,
    itemsIngested: 0,
    errors: [],
  };

  if (!isTwitterConfigured()) {
    result.success = false;
    result.errors.push("TWITTER_USERNAME and TWITTER_PASSWORD environment variables not set");
    return result;
  }

  // Load tickers if not already loaded
  if (!isTickersLoaded()) {
    await loadKnownTickers(supabase);
  }

  // Get enabled Twitter sources
  let query = supabase
    .from("sources")
    .select("*")
    .eq("type", "twitter")
    .eq("enabled", true)
    .order("weight", { ascending: false }); // Process high-weight sources first

  if (sourceIds?.length) {
    query = query.in("id", sourceIds);
  }

  const { data: sources, error: sourcesError } = (await query) as any;

  if (sourcesError) {
    result.success = false;
    result.errors.push(`Failed to fetch sources: ${sourcesError.message}`);
    return result;
  }

  if (!sources?.length) {
    return result;
  }

  // Apply batching if requested
  let sourcesToProcess = sources;
  const batchSize = options?.batchSize ?? 15;

  if (options?.batch) {
    const totalBatches = Math.ceil(sources.length / batchSize);
    const batchIndex = options.batch - 1; // Convert 1-indexed to 0-indexed
    const start = batchIndex * batchSize;
    const end = start + batchSize;
    sourcesToProcess = sources.slice(start, end);
    result.batch = { current: options.batch, total: totalBatches };

    if (sourcesToProcess.length === 0) {
      result.errors.push(`Batch ${options.batch} is empty (total batches: ${totalBatches})`);
      return result;
    }

    console.log(`Twitter batch ${options.batch}/${totalBatches}: processing ${sourcesToProcess.length} sources`);
  }

  // Process each source with rate limiting
  for (const source of sourcesToProcess) {
    try {
      // Reduce tweet count for low-weight sources to save time
      const tweetLimit = source.weight >= 7 ? 20 : 10;

      const itemsIngested = await ingestTwitterSource(
        supabase,
        source,
        tweetLimit
      );
      result.sourcesProcessed++;
      result.itemsIngested += itemsIngested;

      // Update last_fetched_at
      await (supabase
        .from("sources") as any)
        .update({ last_fetched_at: new Date().toISOString() })
        .eq("id", source.id);

      // Rate limit: wait between requests to respect API limits
      await delay(1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`${source.name}: ${errorMessage}`);
      console.error(`Failed to ingest ${source.name}:`, error);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Ingest a single Twitter source using direct account access
 */
async function ingestTwitterSource(
  supabase: SupabaseClient<Database>,
  source: Database["public"]["Tables"]["sources"]["Row"],
  tweetLimit: number = 20
): Promise<number> {
  // Remove @ from handle if present
  const username = source.handle.replace(/^@/, "");

  // Fetch recent tweets via agent-twitter-client
  const tweets: Tweet[] = await fetchUserTweets(username, tweetLimit);

  let itemsIngested = 0;

  for (const tweet of tweets) {
    try {
      const externalId = tweet.id;
      if (!externalId || !tweet.text) continue;

      // Check if we already have this tweet
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("external_id", externalId)
        .eq("source_id", source.id)
        .single();

      if (existing) {
        continue; // Skip duplicates
      }

      // Extract tickers (with auto-discovery of unknown cashtags)
      const extractedTickers = await extractTickersWithAutoDiscovery(supabase, tweet.text);

      // Calculate velocity from engagement
      const velocity = calculateVelocity({
        likes: tweet.likes || 0,
        retweets: tweet.retweets || 0,
        replies: tweet.replies || 0,
        views: tweet.views || 0,
      });

      // Parse publish date
      const publishedAt = tweet.timeParsed ?? new Date(tweet.timestamp ? tweet.timestamp * 1000 : Date.now());

      // Calculate score
      const score = calculateScore({
        sourceWeight: source.weight,
        velocity,
        publishedAt,
        tickerCount: extractedTickers.length,
      });

      // Insert feed item
      const { data: feedItem, error: insertError } = (await supabase
        .from("feed_items")
        .insert({
          external_id: externalId,
          source_id: source.id,
          source_type: "twitter",
          text: tweet.text,
          full_content: tweet.text,
          url: tweet.permanentUrl || `https://twitter.com/${username}/status/${externalId}`,
          published_at: publishedAt.toISOString(),
          velocity,
          score,
        } as any)
        .select()
        .single()) as any;

      if (insertError) {
        console.error(`Failed to insert tweet from ${source.name}:`, insertError);
        continue;
      }

      // Link tickers (batch insert)
      if (feedItem && extractedTickers.length > 0) {
        const tickerLinks = extractedTickers.map((t: any) => ({
          feed_item_id: feedItem.id,
          ticker_symbol: t.symbol,
          confidence: t.confidence,
        }));

        await supabase.from("feed_item_tickers").insert(tickerLinks as any);
      }

      // Add "new" flag for recent items (< 1 hour)
      const ageMs = Date.now() - publishedAt.getTime();
      if (ageMs < 60 * 60 * 1000 && feedItem) {
        await supabase.from("feed_item_flags").insert({
          feed_item_id: feedItem.id,
          flag: "new",
        } as any);
      }

      // Capture price snapshots for alpha tracking (only for items < 15 min old)
      if (feedItem && extractedTickers.length > 0 && ageMs < 15 * 60 * 1000) {
        const tickerSymbols = extractedTickers.map((t: any) => t.symbol);
        await capturePriceSnapshots(supabase, feedItem.id, tickerSymbols, tweet.text);
      }

      itemsIngested++;
    } catch (error) {
      console.error(`Failed to process tweet from ${source.name}:`, error);
    }
  }

  return itemsIngested;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
