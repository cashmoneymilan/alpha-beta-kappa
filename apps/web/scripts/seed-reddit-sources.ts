/**
 * Seed Reddit sources for financial subreddit ingestion
 * Run with: npx tsx scripts/seed-reddit-sources.ts
 *
 * Prerequisites:
 * 1. Create a Reddit app at https://www.reddit.com/prefs/apps
 *    - Choose "script" type for server-side apps
 *    - Set redirect URI to http://localhost:3002
 * 2. Set environment variables:
 *    - REDDIT_CLIENT_ID: Your Reddit app client ID
 *    - REDDIT_CLIENT_SECRET: Your Reddit app client secret
 */

const REDDIT_SOURCES = [
  {
    handle: "r/wallstreetbets",
    name: "WallStreetBets",
    type: "reddit",
    weight: 6,
    url: "https://reddit.com/r/wallstreetbets",
  },
  {
    handle: "r/stocks",
    name: "Stocks",
    type: "reddit",
    weight: 7,
    url: "https://reddit.com/r/stocks",
  },
  {
    handle: "r/options",
    name: "Options Trading",
    type: "reddit",
    weight: 6,
    url: "https://reddit.com/r/options",
  },
  {
    handle: "r/investing",
    name: "Investing",
    type: "reddit",
    weight: 7,
    url: "https://reddit.com/r/investing",
  },
  {
    handle: "r/stockmarket",
    name: "Stock Market",
    type: "reddit",
    weight: 6,
    url: "https://reddit.com/r/stockmarket",
  },
  {
    handle: "r/SecurityAnalysis",
    name: "Security Analysis",
    type: "reddit",
    weight: 8,
    url: "https://reddit.com/r/SecurityAnalysis",
  },
];

async function seedRedditSources() {
  const baseUrl = process.env.API_URL || "http://localhost:3002";

  console.log("Seeding Reddit sources...\n");

  for (const source of REDDIT_SOURCES) {
    try {
      const response = await fetch(`${baseUrl}/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✓ Added: ${source.name} (${source.handle})`);
      } else if (response.status === 409) {
        console.log(`- Exists: ${source.name}`);
      } else {
        console.log(`✗ Failed: ${source.name} - ${data.error}`);
      }
    } catch (error) {
      console.log(`✗ Error: ${source.name} - ${error}`);
    }
  }

  console.log("\nDone!");
  console.log("\nTo ingest Reddit data:");
  console.log("1. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables");
  console.log("2. Call POST /api/ingest/reddit with { \"manual\": true }");
  console.log("\nNote: Reddit API requires OAuth credentials from https://www.reddit.com/prefs/apps");
}

seedRedditSources();
