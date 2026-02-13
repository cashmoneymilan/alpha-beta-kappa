import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { extractTickersWithAutoDiscovery, loadKnownTickers, isTickersLoaded } from "@/lib/ticker-extraction";
import { calculateScore } from "@/lib/scoring";
import { capturePriceSnapshots } from "./price-snapshot";

// Reddit API configuration
const REDDIT_API_BASE = "https://oauth.reddit.com";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const USER_AGENT = "narrative-terminal:v1.0.0 (by /u/narrative_terminal)";

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  created_utc: number;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  author: string;
  subreddit: string;
  link_flair_text?: string;
  is_self: boolean;
}

interface RedditListingResponse {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: RedditPost;
    }>;
    after?: string;
    before?: string;
  };
}

export interface IngestResult {
  success: boolean;
  sourcesProcessed: number;
  itemsIngested: number;
  errors: string[];
}

// Token cache to avoid repeated auth requests
let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Get Reddit OAuth token using client credentials flow
 */
async function getRedditToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set");
  }

  // Return cached token if still valid (with 5 min buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.token;
  }

  // Request new token
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Reddit token request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

/**
 * Calculate velocity score for Reddit posts
 * Based on score, upvote ratio, and comment count
 */
function calculateRedditVelocity(post: RedditPost): number {
  // Score combines upvotes and timing
  // upvote_ratio ranges from 0.0 to 1.0
  const netScore = post.score * post.upvote_ratio;

  // Comments indicate engagement
  const commentBoost = post.num_comments * 2;

  // Raw velocity
  const rawVelocity = netScore + commentBoost;

  // Normalize to 0-100 range
  // Posts with 500+ net score and 100+ comments are considered very high velocity
  return Math.min(100, Math.round((rawVelocity / 600) * 100));
}

/**
 * Ingest Reddit posts from enabled sources
 */
export async function ingestRedditFeeds(
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

  // Get enabled Reddit sources
  let query = supabase
    .from("sources")
    .select("*")
    .eq("type", "reddit")
    .eq("enabled", true)
    .order("weight", { ascending: false });

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
    result.errors.push("No Reddit sources configured");
    return result;
  }

  // Get OAuth token
  let token: string;
  try {
    token = await getRedditToken();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.success = false;
    result.errors.push(`Reddit auth failed: ${errorMessage}`);
    return result;
  }

  // Process each source
  for (const source of sources) {
    try {
      const itemsIngested = await ingestRedditSource(supabase, source, token);
      result.sourcesProcessed++;
      result.itemsIngested += itemsIngested;

      // Update last_fetched_at
      await (supabase.from("sources") as any)
        .update({ last_fetched_at: new Date().toISOString() })
        .eq("id", source.id);

      // Rate limit: Reddit allows 60 requests/minute with OAuth
      await delay(1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`${source.name}: ${errorMessage}`);
      console.error(`Failed to ingest ${source.name}:`, error);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Ingest a single Reddit source (subreddit)
 */
async function ingestRedditSource(
  supabase: SupabaseClient<Database>,
  source: Database["public"]["Tables"]["sources"]["Row"],
  token: string
): Promise<number> {
  // Handle can be "r/wallstreetbets" or just "wallstreetbets"
  const subreddit = source.handle.replace(/^r\//, "");

  // Fetch hot posts from subreddit
  const response = await fetch(
    `${REDDIT_API_BASE}/r/${subreddit}/hot?limit=25`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": USER_AGENT,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Reddit API request failed: ${response.status} ${response.statusText}`);
  }

  const data: RedditListingResponse = await response.json();
  const posts = data.data.children.map((child) => child.data);

  let itemsIngested = 0;

  for (const post of posts) {
    try {
      // Skip stickied/announcement posts (usually mod posts)
      if (post.link_flair_text?.toLowerCase().includes("daily") ||
          post.link_flair_text?.toLowerCase().includes("weekly")) {
        continue;
      }

      const externalId = `reddit_${post.id}`;

      // Check if we already have this post
      const { data: existing } = await supabase
        .from("feed_items")
        .select("id")
        .eq("external_id", externalId)
        .eq("source_id", source.id)
        .single();

      if (existing) {
        continue; // Skip duplicates
      }

      // Combine title and selftext for content
      const fullText = post.selftext
        ? `${post.title}\n\n${post.selftext}`
        : post.title;

      // Extract tickers from combined content (with auto-discovery)
      const extractedTickers = await extractTickersWithAutoDiscovery(supabase, fullText);

      // Calculate velocity from Reddit engagement
      const velocity = calculateRedditVelocity(post);

      // Parse publish date
      const publishedAt = new Date(post.created_utc * 1000);

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
          source_type: "reddit",
          text: post.title, // Title as the main text
          full_content: fullText, // Full post content
          url: `https://reddit.com${post.permalink}`,
          published_at: publishedAt.toISOString(),
          velocity,
          score,
        } as any)
        .select()
        .single()) as any;

      if (insertError) {
        console.error(`Failed to insert Reddit post from ${source.name}:`, insertError);
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

      // Capture price snapshots for alpha tracking (only for items < 15 min old)
      if (feedItem && extractedTickers.length > 0 && ageMs < 15 * 60 * 1000) {
        const tickerSymbols = extractedTickers.map((t) => t.symbol);
        await capturePriceSnapshots(supabase, feedItem.id, tickerSymbols, fullText);
      }

      itemsIngested++;
    } catch (error) {
      console.error(`Failed to process Reddit post from ${source.name}:`, error);
    }
  }

  return itemsIngested;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
