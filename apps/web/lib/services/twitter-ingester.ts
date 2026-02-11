import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { extractTickers, loadKnownTickers, isTickersLoaded } from "@/lib/ticker-extraction";
import { calculateScore, calculateVelocity } from "@/lib/scoring";
import { capturePriceSnapshots } from "./price-snapshot";

// RapidAPI Twitter scraper configuration
// You can use various Twitter scrapers on RapidAPI - adjust the endpoint as needed
const RAPIDAPI_HOST = "twitter154.p.rapidapi.com";
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;

interface TwitterUser {
  id: string;
  username: string;
  name: string;
}

interface TwitterTweet {
  tweet_id: string;
  text: string;
  created_at: string;
  user: TwitterUser;
  favorite_count: number;
  retweet_count: number;
  reply_count: number;
  views?: number;
}

interface RapidApiResponse {
  results?: TwitterTweet[];
  tweets?: TwitterTweet[];
  data?: TwitterTweet[];
}

export interface IngestResult {
  success: boolean;
  sourcesProcessed: number;
  itemsIngested: number;
  errors: string[];
}

/**
 * Ingest Twitter feeds from enabled sources
 */
export async function ingestTwitterFeeds(
  supabase: SupabaseClient<Database>,
  sourceIds?: string[]
): Promise<IngestResult> {
  const result: IngestResult = {
    success: true,
    sourcesProcessed: 0,
    itemsIngested: 0,
    errors: [],
  };

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    result.success = false;
    result.errors.push("RAPIDAPI_KEY environment variable not set");
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

  // Process each source with rate limiting
  for (const source of sources) {
    try {
      const itemsIngested = await ingestTwitterSource(
        supabase,
        source,
        rapidApiKey
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
 * Ingest a single Twitter source
 */
async function ingestTwitterSource(
  supabase: SupabaseClient<Database>,
  source: Database["public"]["Tables"]["sources"]["Row"],
  rapidApiKey: string
): Promise<number> {
  // Remove @ from handle if present
  const username = source.handle.replace(/^@/, "");

  // Fetch recent tweets using RapidAPI
  // Note: Adjust the endpoint based on the specific RapidAPI Twitter scraper you're using
  const response = await fetch(
    `${RAPIDAPI_BASE_URL}/user/tweets?username=${username}&limit=20&include_replies=false`,
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: RapidApiResponse = await response.json();
  const tweets = data.results || data.tweets || data.data || [];

  let itemsIngested = 0;

  for (const tweet of tweets) {
    try {
      const externalId = tweet.tweet_id;

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

      // Extract tickers
      const extractedTickers = extractTickers(tweet.text);

      // Calculate velocity from engagement
      const velocity = calculateVelocity({
        likes: tweet.favorite_count || 0,
        retweets: tweet.retweet_count || 0,
        replies: tweet.reply_count || 0,
        views: tweet.views || 0,
      });

      // Parse publish date
      const publishedAt = new Date(tweet.created_at);

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
          full_content: tweet.text, // Tweets are short, full content = text
          url: `https://twitter.com/${username}/status/${externalId}`,
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

      // Link tickers
      if (feedItem && extractedTickers.length > 0) {
        const tickerLinks = extractedTickers.map((t) => ({
          feed_item_id: feedItem.id,
          ticker_symbol: t.symbol,
          confidence: t.confidence,
        }));

        for (const link of tickerLinks) {
          await supabase.from("feed_item_tickers").insert(link as any).select();
        }
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
        const tickerSymbols = extractedTickers.map((t) => t.symbol);
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
