import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

interface TickerHeat {
  ticker: string;
  mentions: number;
  delta: number;
  velocity: number;
  topNarrative: string;
  topSource: string;
}

interface SourceHeat {
  id: string;
  handle: string;
  name: string;
  type: string;
  impactScore: number;
  recentMentions: number;
  recentItems: Array<{
    id: string;
    text: string;
    published_at: string;
    tickers: string[];
  }>;
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  // Time window: default 24h
  const hoursBack = parseInt(searchParams.get('hours') || '24');
  const baselineHours = hoursBack * 2; // Compare against double the window
  const assetClass = searchParams.get('asset_class');

  const now = new Date();
  const recentCutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
  const baselineCutoff = new Date(now.getTime() - baselineHours * 60 * 60 * 1000);

  try {
    // Query recent ticker mentions with source and velocity info
    const { data: recentItems, error: recentError } = await supabase
      .from('feed_items')
      .select(`
        id,
        text,
        velocity,
        score,
        published_at,
        source:sources(id, handle, name, weight),
        tickers:feed_item_tickers(ticker_symbol)
      `)
      .gte('published_at', recentCutoff.toISOString())
      .order('published_at', { ascending: false }) as any;

    if (recentError) {
      console.error('Heat recent query error:', recentError);
      return NextResponse.json({ error: recentError.message }, { status: 500 });
    }

    // Query baseline period for delta calculation
    const { data: baselineItems, error: baselineError } = await supabase
      .from('feed_items')
      .select(`
        id,
        tickers:feed_item_tickers(ticker_symbol)
      `)
      .gte('published_at', baselineCutoff.toISOString())
      .lt('published_at', recentCutoff.toISOString()) as any;

    if (baselineError) {
      console.error('Heat baseline query error:', baselineError);
      return NextResponse.json({ error: baselineError.message }, { status: 500 });
    }

    // Query tickers for asset class filtering if needed
    let tickerAssetClasses: Record<string, string> = {};
    if (assetClass && assetClass !== 'all') {
      const { data: tickers } = await supabase
        .from('tickers')
        .select('symbol, asset_class') as any;

      if (tickers) {
        tickerAssetClasses = Object.fromEntries(
          tickers.map((t: any) => [t.symbol, t.asset_class])
        );
      }
    }

    // Aggregate ticker mentions - recent period
    const recentTickerCounts: Record<string, {
      count: number;
      velocity: number;
      sources: Set<string>;
      topSource: string;
      texts: string[];
    }> = {};

    for (const item of recentItems || []) {
      const tickers = item.tickers?.map((t: { ticker_symbol: string }) => t.ticker_symbol) || [];
      const sourceName = item.source?.handle || 'unknown';

      for (const ticker of tickers) {
        // Apply asset class filter
        if (assetClass && assetClass !== 'all') {
          const tickerClass = tickerAssetClasses[ticker];
          if (tickerClass && tickerClass !== assetClass) continue;
        }

        if (!recentTickerCounts[ticker]) {
          recentTickerCounts[ticker] = {
            count: 0,
            velocity: 0,
            sources: new Set(),
            topSource: sourceName,
            texts: [],
          };
        }
        recentTickerCounts[ticker].count++;
        recentTickerCounts[ticker].velocity += item.velocity || 0;
        recentTickerCounts[ticker].sources.add(sourceName);
        if (item.text) {
          recentTickerCounts[ticker].texts.push(item.text);
        }
        // Track highest weight source
        if (item.source?.weight > 5) {
          recentTickerCounts[ticker].topSource = sourceName;
        }
      }
    }

    // Aggregate baseline ticker mentions
    const baselineTickerCounts: Record<string, number> = {};
    for (const item of baselineItems || []) {
      const tickers = item.tickers?.map((t: { ticker_symbol: string }) => t.ticker_symbol) || [];
      for (const ticker of tickers) {
        baselineTickerCounts[ticker] = (baselineTickerCounts[ticker] || 0) + 1;
      }
    }

    // Calculate ticker heat with delta
    const tickerHeat: TickerHeat[] = Object.entries(recentTickerCounts)
      .map(([ticker, data]) => {
        const baseline = baselineTickerCounts[ticker] || 1;
        const delta = Math.round(((data.count - baseline) / baseline) * 100);

        // Extract a simple "narrative" from most common keywords
        const topNarrative = extractTopNarrative(data.texts);

        return {
          ticker,
          mentions: data.count,
          delta: Math.max(0, delta), // No negative deltas in display
          velocity: Math.round(data.velocity / Math.max(1, data.count)),
          topNarrative,
          topSource: data.topSource,
        };
      })
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 30); // Top 30 tickers

    // Aggregate source activity
    const sourceActivity: Record<string, {
      id: string;
      handle: string;
      name: string;
      type: string;
      weight: number;
      count: number;
      totalVelocity: number;
      items: Array<{ id: string; text: string; published_at: string; tickers: string[] }>;
    }> = {};

    for (const item of recentItems || []) {
      const source = item.source;
      if (!source) continue;

      const sourceId = source.id;
      if (!sourceActivity[sourceId]) {
        sourceActivity[sourceId] = {
          id: sourceId,
          handle: source.handle,
          name: source.name,
          type: 'twitter', // Default, would need to join to get actual type
          weight: source.weight,
          count: 0,
          totalVelocity: 0,
          items: [],
        };
      }

      sourceActivity[sourceId].count++;
      sourceActivity[sourceId].totalVelocity += item.velocity || 0;

      if (sourceActivity[sourceId].items.length < 3) {
        sourceActivity[sourceId].items.push({
          id: item.id,
          text: item.text,
          published_at: item.published_at,
          tickers: item.tickers?.map((t: { ticker_symbol: string }) => t.ticker_symbol) || [],
        });
      }
    }

    // Calculate impact score: weight * mentions + velocity bonus
    const sourceHeat: SourceHeat[] = Object.values(sourceActivity)
      .map(source => ({
        id: source.id,
        handle: source.handle.startsWith('@') ? source.handle : `@${source.handle}`,
        name: source.name,
        type: source.type,
        impactScore: Math.min(100, Math.round(
          source.weight * 8 +
          Math.log10(source.count + 1) * 10 +
          Math.log10(source.totalVelocity + 1) * 5
        )),
        recentMentions: source.count,
        recentItems: source.items,
      }))
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 15); // Top 15 sources

    return NextResponse.json({
      tickers: tickerHeat,
      sources: sourceHeat,
      meta: {
        timeWindow: `${hoursBack}h`,
        tickerCount: tickerHeat.length,
        sourceCount: sourceHeat.length,
        totalItems: recentItems?.length || 0,
      },
    });
  } catch (error) {
    console.error('Heat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Simple narrative extraction - find common themes in text
function extractTopNarrative(texts: string[]): string {
  if (!texts.length) return 'General Discussion';

  // Common financial narrative keywords
  const narrativePatterns = [
    { pattern: /supply chain|shortage|inventory/i, label: 'Supply Chain' },
    { pattern: /earnings|revenue|profit/i, label: 'Earnings' },
    { pattern: /fed|rate cut|interest rate|powell/i, label: 'Fed Policy' },
    { pattern: /AI|artificial intelligence|machine learning/i, label: 'AI/Tech' },
    { pattern: /china|tariff|trade war/i, label: 'China/Trade' },
    { pattern: /bitcoin|crypto|eth/i, label: 'Crypto' },
    { pattern: /uranium|nuclear/i, label: 'Nuclear/Uranium' },
    { pattern: /rare earth|REE|mining/i, label: 'Rare Earth' },
    { pattern: /gold|silver|precious/i, label: 'Precious Metals' },
    { pattern: /oil|energy|gas/i, label: 'Energy' },
    { pattern: /EV|electric vehicle|battery/i, label: 'EV/Battery' },
    { pattern: /merger|acquisition|buyout/i, label: 'M&A' },
    { pattern: /IPO|offering|listing/i, label: 'IPO/Offering' },
    { pattern: /short|squeeze|gamma/i, label: 'Short Squeeze' },
    { pattern: /insider|whale|unusual/i, label: 'Unusual Activity' },
  ];

  const counts: Record<string, number> = {};

  for (const text of texts.slice(0, 10)) { // Sample first 10
    for (const { pattern, label } of narrativePatterns) {
      if (pattern.test(text)) {
        counts[label] = (counts[label] || 0) + 1;
      }
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'Market Activity';
}
