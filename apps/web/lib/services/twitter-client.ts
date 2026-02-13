import { Scraper, type Tweet } from "@the-convocation/twitter-scraper";

// Re-export the Tweet type for consumers
export type { Tweet };

// Singleton scraper instance
let scraper: Scraper | null = null;
let initPromise: Promise<void> | null = null;

// Track auth failures to avoid hammering the API
let lastAuthError: { error: Error; timestamp: number } | null = null;
const AUTH_RETRY_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create the singleton Scraper, ensuring it's authenticated.
 * Supports two auth methods:
 *   1. TWITTER_COOKIES (preferred) — paste cookies from browser session
 *   2. TWITTER_USERNAME + TWITTER_PASSWORD — programmatic login (may be Cloudflare-blocked)
 */
async function getScraper(): Promise<Scraper> {
  // If auth recently failed, don't retry yet
  if (lastAuthError) {
    const elapsed = Date.now() - lastAuthError.timestamp;
    if (elapsed < AUTH_RETRY_COOLDOWN_MS) {
      throw lastAuthError.error;
    }
    lastAuthError = null;
  }

  if (!scraper) {
    scraper = new Scraper();
  }

  // If already logged in, return immediately
  if (await scraper.isLoggedIn()) {
    return scraper;
  }

  // Avoid concurrent auth attempts
  if (!initPromise) {
    initPromise = authenticate(scraper).catch((err) => {
      lastAuthError = { error: err, timestamp: Date.now() };
      throw err;
    });
  }

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }

  return scraper;
}

async function authenticate(s: Scraper): Promise<void> {
  // Method 1: Cookie-based auth (preferred — bypasses Cloudflare)
  const cookiesEnv = process.env.TWITTER_COOKIES;
  if (cookiesEnv) {
    console.log("[twitter-client] Authenticating via cookies...");
    const cookies = cookiesEnv
      .split(/;\s*/)
      .map((c) => c.trim())
      .filter(Boolean);
    await s.setCookies(cookies);

    if (await s.isLoggedIn()) {
      console.log("[twitter-client] Cookie auth successful");
      return;
    }
    console.warn("[twitter-client] Cookie auth failed — cookies may be expired");
  }

  // Method 2: Programmatic login (may hit Cloudflare block)
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const email = process.env.TWITTER_EMAIL;

  if (!username || !password) {
    throw new Error(
      "Twitter auth failed. Set TWITTER_COOKIES (preferred) or TWITTER_USERNAME + TWITTER_PASSWORD in .env.local"
    );
  }

  console.log("[twitter-client] Attempting programmatic login as @" + username + "...");
  await s.login(username, password, email);

  // Cache cookies for future use
  const freshCookies = await s.getCookies();
  const cookieStr = freshCookies.map((c) => `${c.key}=${c.value}`).join("; ");
  console.log("[twitter-client] Login successful. To avoid future Cloudflare blocks, add to .env.local:");
  console.log(`TWITTER_COOKIES=${cookieStr}`);
}

/**
 * Fetch recent tweets from a user by screen name.
 * Returns an array of Tweet objects.
 */
export async function fetchUserTweets(
  username: string,
  limit: number = 20
): Promise<Tweet[]> {
  const s = await getScraper();
  const tweets: Tweet[] = [];

  const iterator = s.getTweets(username, limit);
  for await (const tweet of iterator) {
    // Skip retweets — we only want original content
    if (tweet.isRetweet) continue;
    tweets.push(tweet);
    if (tweets.length >= limit) break;
  }

  return tweets;
}

/**
 * Post a tweet. Note: @the-convocation/twitter-scraper does not support
 * sendTweet natively. This uses the internal API directly.
 */
export async function postTweet(
  text: string,
  _replyToTweetId?: string
): Promise<Response> {
  const s = await getScraper();

  // The upstream library doesn't expose sendTweet, so we use the
  // internal Twitter API via the authenticated scraper's fetch.
  // For now, use searchTweets as a connectivity test and throw
  // an informative error about posting support.
  void s;
  throw new Error(
    "Tweet posting requires agent-twitter-client which is currently blocked by Cloudflare. " +
    "Posting will be enabled once cookie-based auth is working and we switch to a library that supports it."
  );
}

/**
 * Check if the Twitter client is configured (credentials or cookies present).
 */
export function isTwitterConfigured(): boolean {
  return !!(
    process.env.TWITTER_COOKIES ||
    (process.env.TWITTER_USERNAME && process.env.TWITTER_PASSWORD)
  );
}
