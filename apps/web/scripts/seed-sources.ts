/**
 * Seed RSS sources for financial news ingestion
 * Run with: npx tsx scripts/seed-sources.ts
 */

const RSS_SOURCES = [
  {
    handle: "seeking-alpha",
    name: "Seeking Alpha",
    type: "rss",
    url: "https://seekingalpha.com/market_currents.xml",
    weight: 8,
  },
  {
    handle: "yahoo-finance",
    name: "Yahoo Finance",
    type: "rss",
    url: "https://finance.yahoo.com/rss/topstories",
    weight: 7,
  },
  {
    handle: "coindesk",
    name: "CoinDesk",
    type: "rss",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    weight: 7,
  },
  {
    handle: "techmeme",
    name: "Techmeme",
    type: "rss",
    url: "https://www.techmeme.com/feed.xml",
    weight: 6,
  },
  {
    handle: "bloomberg-markets",
    name: "Bloomberg Markets",
    type: "rss",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    weight: 8,
  },
];

async function seedSources() {
  const baseUrl = process.env.API_URL || "http://localhost:3002";

  console.log("Seeding RSS sources...\n");

  for (const source of RSS_SOURCES) {
    try {
      const response = await fetch(`${baseUrl}/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✓ Added: ${source.name} (${source.url})`);
      } else if (response.status === 409) {
        console.log(`- Exists: ${source.name}`);
      } else {
        console.log(`✗ Failed: ${source.name} - ${data.error}`);
      }
    } catch (error) {
      console.log(`✗ Error: ${source.name} - ${error}`);
    }
  }

  console.log("\nDone! To ingest data, click the refresh icon in the Sources tile or call POST /api/ingest/rss");
}

seedSources();
