import Parser from "rss-parser";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { extractTickersWithAutoDiscovery, loadKnownTickers, isTickersLoaded } from "@/lib/ticker-extraction";
import { calculateScore } from "@/lib/scoring";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "NarrativeTerminal/1.0 (RSS Reader)",
  },
});

export interface IngestResult {
  success: boolean;
  sourcesProcessed: number;
  itemsIngested: number;
  errors: string[];
}

/**
 * Ingest RSS feeds from enabled sources
 */
export async function ingestRssFeeds(
  supabase: SupabaseClient<Database>,
  sourceIds?: string[]
): Promise<IngestResult> {
  const result: IngestResult = {
    success: true,
    sourcesProcessed: 0,
    itemsIngested: 0,
    errors: [],
  };

  // Load tickers if not already loaded
  if (!isTickersLoaded()) {
    await loadKnownTickers(supabase);
  }

  // Get enabled RSS sources
  let query = supabase
    .from("sources")
    .select("*")
    .eq("type", "rss")
    .eq("enabled", true);

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

  // Process sources in parallel batches of 5
  const CONCURRENCY = 5;
  for (let i = 0; i < sources.length; i += CONCURRENCY) {
    const batch = sources.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async (source: any) => {
        const itemsIngested = await ingestRssSource(supabase, source);

        // Update last_fetched_at
        await (supabase
          .from("sources") as any)
          .update({ last_fetched_at: new Date().toISOString() })
          .eq("id", source.id);

        return { source, itemsIngested };
      })
    );

    for (const batchResult of batchResults) {
      if (batchResult.status === "fulfilled") {
        result.sourcesProcessed++;
        result.itemsIngested += batchResult.value.itemsIngested;
      } else {
        const errorMessage = batchResult.reason instanceof Error
          ? batchResult.reason.message
          : "Unknown error";
        result.errors.push(errorMessage);
        console.error("Failed to ingest RSS source:", batchResult.reason);
      }
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Ingest a single RSS source
 */
async function ingestRssSource(
  supabase: SupabaseClient<Database>,
  source: Database["public"]["Tables"]["sources"]["Row"]
): Promise<number> {
  if (!source.url) {
    throw new Error("Source has no URL");
  }

  // Parse the RSS feed
  const feed = await parser.parseURL(source.url);
  let itemsIngested = 0;

  for (const item of feed.items || []) {
    try {
      // Generate a unique ID for the item
      const externalId = item.guid || item.link || `${source.id}-${item.title}`;

      // Check if we already have this item
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("external_id", externalId)
        .eq("source_id", source.id)
        .single();

      if (existing) {
        continue; // Skip duplicates
      }

      // Extract text content
      const text = item.title || "";
      const fullContent = item.contentSnippet || item.content || item.summary || "";

      // Extract tickers from title and content (with auto-discovery)
      const combinedText = `${text} ${fullContent}`;
      const extractedTickers = await extractTickersWithAutoDiscovery(supabase, combinedText);

      // Calculate score
      const publishedAt = item.pubDate
        ? new Date(item.pubDate)
        : new Date();

      const score = calculateScore({
        sourceWeight: source.weight,
        velocity: 0, // RSS has no engagement metrics
        publishedAt,
        tickerCount: extractedTickers.length,
      });

      // Insert feed item
      const { data: feedItem, error: insertError } = (await supabase
        .from("feed_items")
        .insert({
          external_id: externalId,
          source_id: source.id,
          source_type: "rss",
          text: text.substring(0, 500),
          full_content: fullContent.substring(0, 5000),
          url: item.link || null,
          published_at: publishedAt.toISOString(),
          velocity: 0,
          score,
        } as any)
        .select()
        .single()) as any;

      if (insertError) {
        console.error(`Failed to insert item from ${source.name}:`, insertError);
        continue;
      }

      // Link tickers (batch insert)
      if (feedItem && extractedTickers.length > 0) {
        const tickerLinks = extractedTickers.map((t) => ({
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

      itemsIngested++;
    } catch (error) {
      console.error(`Failed to process item from ${source.name}:`, error);
    }
  }

  return itemsIngested;
}
