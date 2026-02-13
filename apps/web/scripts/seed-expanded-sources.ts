/**
 * Seed expanded sources — Twitter, RSS, and Reddit
 * Run with: npx tsx scripts/seed-expanded-sources.ts
 *
 * Deduplicates against existing sources by handle.
 * Uses Supabase directly for reliability.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SourceSeed {
  handle: string;
  name: string;
  type: "twitter" | "rss" | "reddit";
  category: string;
  weight: number;
  description: string;
  url?: string;
  enabled?: boolean;
}

// ─── NEW TWITTER ACCOUNTS ────────────────────────────────────────────────

const NEW_TWITTER: SourceSeed[] = [
  // Breaking news
  {
    handle: "LiveSquawk",
    name: "LiveSquawk",
    type: "twitter",
    category: "breaking",
    weight: 8,
    description: "Real-time market squawk box headlines",
  },
  {
    handle: "BreakingMarkets",
    name: "Breaking Markets",
    type: "twitter",
    category: "breaking",
    weight: 7,
    description: "Breaking market news and alerts",
  },
  {
    handle: "BNONews",
    name: "BNO News",
    type: "twitter",
    category: "breaking",
    weight: 7,
    description: "Breaking news from around the world",
  },
  {
    handle: "StockMKTNewz",
    name: "Stock Market News",
    type: "twitter",
    category: "breaking",
    weight: 8,
    description: "Real-time stock market news and updates",
  },
  {
    handle: "financialjuice",
    name: "Financial Juice",
    type: "twitter",
    category: "breaking",
    weight: 7,
    description: "Financial news headlines aggregator",
  },
  // Flow/Options
  {
    handle: "spotgamma",
    name: "SpotGamma",
    type: "twitter",
    category: "flow",
    weight: 8,
    description: "Options flow and gamma exposure analysis",
  },
  {
    handle: "VolSignals",
    name: "Vol Signals",
    type: "twitter",
    category: "flow",
    weight: 7,
    description: "Volatility signals and options flow",
  },
  {
    handle: "darkpoolcharts",
    name: "Dark Pool Charts",
    type: "twitter",
    category: "flow",
    weight: 7,
    description: "Dark pool and institutional flow visualization",
  },
  // Research/Analysis
  {
    handle: "LynAldenContact",
    name: "Lyn Alden",
    type: "twitter",
    category: "research",
    weight: 9,
    description: "Macro investing research and analysis",
  },
  {
    handle: "AswathDamodaran",
    name: "Aswath Damodaran",
    type: "twitter",
    category: "research",
    weight: 9,
    description: "Valuation expert, NYU Stern professor",
  },
  {
    handle: "jessefelder",
    name: "Jesse Felder",
    type: "twitter",
    category: "research",
    weight: 8,
    description: "Contrarian value investing analysis",
  },
  {
    handle: "profgalloway",
    name: "Scott Galloway",
    type: "twitter",
    category: "research",
    weight: 7,
    description: "Tech sector analysis and market commentary",
  },
  {
    handle: "CathieDWood",
    name: "Cathie Wood",
    type: "twitter",
    category: "research",
    weight: 7,
    description: "ARK Invest CEO, disruptive innovation focus",
  },
  {
    handle: "elerianm",
    name: "Mohamed El-Erian",
    type: "twitter",
    category: "research",
    weight: 9,
    description: "Chief economic advisor, macro analysis",
  },
  {
    handle: "LizAnnSonders",
    name: "Liz Ann Sonders",
    type: "twitter",
    category: "research",
    weight: 8,
    description: "Schwab chief investment strategist",
  },
  {
    handle: "PeterLBrandt",
    name: "Peter Brandt",
    type: "twitter",
    category: "research",
    weight: 8,
    description: "Classical chart pattern analysis, 40+ years",
  },
  {
    handle: "TaviCosta",
    name: "Tavi Costa",
    type: "twitter",
    category: "research",
    weight: 7,
    description: "Crescat Capital, commodities and macro",
  },
  // Sector specialists
  {
    handle: "EricBalchunas",
    name: "Eric Balchunas",
    type: "twitter",
    category: "sector",
    weight: 8,
    description: "Bloomberg ETF analyst, fund flow tracking",
  },
  {
    handle: "JavierBlas",
    name: "Javier Blas",
    type: "twitter",
    category: "sector",
    weight: 8,
    description: "Bloomberg commodities and energy reporter",
  },
  {
    handle: "BiotechNewsPat",
    name: "Biotech News Pat",
    type: "twitter",
    category: "sector",
    weight: 7,
    description: "Biotech sector news and FDA updates",
  },
  // Macro/Fed watchers
  {
    handle: "NickTimiraos",
    name: "Nick Timiraos",
    type: "twitter",
    category: "macro",
    weight: 9,
    description: "WSJ Fed reporter, dubbed 'Fed whisperer'",
  },
  {
    handle: "RobinBrooksIIF",
    name: "Robin Brooks",
    type: "twitter",
    category: "macro",
    weight: 8,
    description: "IIF chief economist, FX and global macro",
  },
  {
    handle: "LukeGromen",
    name: "Luke Gromen",
    type: "twitter",
    category: "macro",
    weight: 8,
    description: "FFTT macro research, fiscal dominance thesis",
  },
  {
    handle: "AndreasSteno",
    name: "Andreas Steno",
    type: "twitter",
    category: "macro",
    weight: 7,
    description: "Steno Research, global macro and rates",
  },
  {
    handle: "NorthmanTrader",
    name: "Sven Henrich",
    type: "twitter",
    category: "macro",
    weight: 7,
    description: "Technical analysis and macro commentary",
  },
  {
    handle: "MacroCharts",
    name: "Macro Charts",
    type: "twitter",
    category: "macro",
    weight: 7,
    description: "Macro charting and data visualization",
  },
  // Crypto
  {
    handle: "WClementeIII",
    name: "Will Clemente",
    type: "twitter",
    category: "sector",
    weight: 7,
    description: "Bitcoin on-chain analytics",
  },
  {
    handle: "CryptoKaleo",
    name: "Kaleo",
    type: "twitter",
    category: "sector",
    weight: 6,
    description: "Crypto trading and analysis",
  },
];

// ─── NEW RSS FEEDS ────────────────────────────────────────────────────────

const NEW_RSS: SourceSeed[] = [
  {
    handle: "cnbc-markets",
    name: "CNBC Markets",
    type: "rss",
    category: "breaking",
    weight: 8,
    description: "CNBC market news feed",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
  },
  {
    handle: "reuters-business",
    name: "Reuters Business",
    type: "rss",
    category: "breaking",
    weight: 8,
    description: "Reuters business and finance news",
    url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
  },
  {
    handle: "marketwatch",
    name: "MarketWatch",
    type: "rss",
    category: "breaking",
    weight: 7,
    description: "MarketWatch top stories",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
  },
  {
    handle: "wsj-markets",
    name: "WSJ Markets",
    type: "rss",
    category: "breaking",
    weight: 9,
    description: "Wall Street Journal markets coverage",
    url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
  },
  {
    handle: "barrons",
    name: "Barron's",
    type: "rss",
    category: "research",
    weight: 8,
    description: "Barron's market analysis and commentary",
    url: "https://feeds.barrons.com/barrons/articles",
  },
  {
    handle: "benzinga",
    name: "Benzinga",
    type: "rss",
    category: "breaking",
    weight: 7,
    description: "Benzinga market movers and news",
    url: "https://www.benzinga.com/feed",
  },
  {
    handle: "zerohedge",
    name: "ZeroHedge",
    type: "rss",
    category: "macro",
    weight: 6,
    description: "Financial markets and macro commentary",
    url: "https://feeds.feedburner.com/zerohedge/feed",
  },
  {
    handle: "investopedia",
    name: "Investopedia",
    type: "rss",
    category: "research",
    weight: 6,
    description: "Investopedia market news and education",
    url: "https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline",
  },
  {
    handle: "ft-markets",
    name: "Financial Times Markets",
    type: "rss",
    category: "breaking",
    weight: 9,
    description: "FT markets coverage",
    url: "https://www.ft.com/markets?format=rss",
  },
  {
    handle: "finviz",
    name: "Finviz News",
    type: "rss",
    category: "breaking",
    weight: 7,
    description: "Finviz financial news aggregator",
    url: "https://finviz.com/news.ashx",
  },
];

// ─── NEW REDDIT SUBREDDITS ────────────────────────────────────────────────

const NEW_REDDIT: SourceSeed[] = [
  {
    handle: "r/ValueInvesting",
    name: "Value Investing",
    type: "reddit",
    category: "research",
    weight: 7,
    description: "Value investing discussions and analysis",
    url: "https://reddit.com/r/ValueInvesting",
  },
  {
    handle: "r/Daytrading",
    name: "Day Trading",
    type: "reddit",
    category: "flow",
    weight: 6,
    description: "Day trading strategies and market discussion",
    url: "https://reddit.com/r/Daytrading",
  },
  {
    handle: "r/Forex",
    name: "Forex",
    type: "reddit",
    category: "macro",
    weight: 6,
    description: "Forex trading and currency markets",
    url: "https://reddit.com/r/Forex",
  },
  {
    handle: "r/CryptoMarkets",
    name: "Crypto Markets",
    type: "reddit",
    category: "sector",
    weight: 6,
    description: "Cryptocurrency market analysis",
    url: "https://reddit.com/r/CryptoMarkets",
  },
  {
    handle: "r/Economics",
    name: "Economics",
    type: "reddit",
    category: "macro",
    weight: 7,
    description: "Economic news and analysis",
    url: "https://reddit.com/r/Economics",
  },
];

const ALL_SOURCES: SourceSeed[] = [...NEW_TWITTER, ...NEW_RSS, ...NEW_REDDIT];

async function seedExpandedSources() {
  console.log(`Preparing to seed ${ALL_SOURCES.length} new sources...\n`);
  console.log(`  Twitter: ${NEW_TWITTER.length}`);
  console.log(`  RSS: ${NEW_RSS.length}`);
  console.log(`  Reddit: ${NEW_REDDIT.length}\n`);

  // Fetch existing sources for dedup
  const { data: existing, error: fetchError } = await supabase
    .from("sources")
    .select("handle");

  if (fetchError) {
    console.error("Failed to fetch existing sources:", fetchError);
    process.exit(1);
  }

  const existingHandles = new Set(
    (existing || []).map((s: any) => (s.handle as string).toLowerCase())
  );
  console.log(`Found ${existingHandles.size} existing sources\n`);

  // Filter out duplicates
  const newSources = ALL_SOURCES.filter(
    s => !existingHandles.has(s.handle.toLowerCase())
  );
  console.log(`${newSources.length} new sources to insert (${ALL_SOURCES.length - newSources.length} already exist)\n`);

  if (newSources.length === 0) {
    console.log("Nothing to insert.");
    return;
  }

  let inserted = 0;
  let failed = 0;

  for (const source of newSources) {
    // DB schema has: handle, name, type, weight, url, enabled
    // (no category or description columns)
    const row: Record<string, unknown> = {
      handle: source.handle,
      name: source.name,
      type: source.type,
      weight: source.weight,
      enabled: source.enabled ?? true,
    };

    if (source.url) {
      row.url = source.url;
    }

    const { error } = await supabase.from("sources").insert(row as any);

    if (error) {
      console.error(`  Failed: ${source.handle} — ${error.message}`);
      failed++;
    } else {
      console.log(`  Added: ${source.handle} (${source.type}/${source.category}, weight=${source.weight})`);
      inserted++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Failed: ${failed}, Skipped: ${ALL_SOURCES.length - newSources.length}`);

  // Summary
  const { data: allSources } = await supabase
    .from("sources")
    .select("type")
    .eq("enabled", true);

  if (allSources) {
    const counts: Record<string, number> = {};
    for (const s of allSources as any[]) {
      counts[s.type] = (counts[s.type] || 0) + 1;
    }
    console.log("\nTotal enabled sources by type:");
    for (const [type, count] of Object.entries(counts)) {
      console.log(`  ${type}: ${count}`);
    }
  }
}

seedExpandedSources().catch(console.error);
