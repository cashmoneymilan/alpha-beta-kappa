import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export interface SmartMoneyActivity {
  id: string;
  sourceId: string;
  sourceHandle: string;
  sourceName: string;
  ticker: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  content: string;
  hitRate: number;
  alphaScore: number;
  publishedAt: string;
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  // Configuration from query params
  const minHitRate = parseFloat(searchParams.get('minHitRate') || '55');
  const minAlphaScore = parseFloat(searchParams.get('minAlphaScore') || '60');
  const sinceMinutes = parseInt(searchParams.get('sinceMinutes') || '60');
  const limit = parseInt(searchParams.get('limit') || '20');
  const watchlist = searchParams.get('watchlist')?.split(',').map(t => t.toUpperCase()) || null;

  try {
    // Get high-performing sources
    const { data: performingSources, error: perfError } = await supabase
      .from('source_performance')
      .select(`
        source_id,
        hit_rate_1d,
        alpha_score,
        source:sources(id, handle, name)
      `)
      .gte('hit_rate_1d', minHitRate)
      .gte('alpha_score', minAlphaScore)
      .order('alpha_score', { ascending: false }) as any;

    if (perfError) {
      // If table doesn't exist, return empty
      if (perfError.code === '42P01') {
        return NextResponse.json({ activities: [], message: 'Performance data not yet available' });
      }
      console.error('Smart money query error:', perfError);
      return NextResponse.json({ error: perfError.message }, { status: 500 });
    }

    if (!performingSources || performingSources.length === 0) {
      return NextResponse.json({
        activities: [],
        message: 'No high-performing sources found matching criteria'
      });
    }

    const sourceIds = performingSources.map((p: any) => p.source_id);
    const sourceMap = new Map(performingSources.map((p: any) => {
      // Handle source as either array or single object from Supabase join
      const source = Array.isArray(p.source) ? p.source[0] : p.source;
      return [
        p.source_id,
        {
          hitRate: p.hit_rate_1d,
          alphaScore: p.alpha_score,
          handle: source?.handle || 'unknown',
          name: source?.name || 'Unknown'
        }
      ];
    }));

    // Get recent feed items from these sources with sentiment
    const sinceTime = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

    let query = supabase
      .from('feed_items')
      .select(`
        id,
        source_id,
        content,
        tickers,
        sentiment_label,
        sentiment_score,
        published_at
      `)
      .in('source_id', sourceIds)
      .gte('published_at', sinceTime)
      .not('sentiment_label', 'is', null)
      .order('published_at', { ascending: false })
      .limit(limit);

    const { data: feedItems, error: feedError } = await query as any;

    if (feedError) {
      console.error('Feed items query error:', feedError);
      return NextResponse.json({ error: feedError.message }, { status: 500 });
    }

    if (!feedItems || feedItems.length === 0) {
      return NextResponse.json({
        activities: [],
        message: 'No recent activity from high-performing sources'
      });
    }

    // Transform to smart money activities
    const activities: SmartMoneyActivity[] = [];

    for (const item of feedItems) {
      const sourceInfo = sourceMap.get(item.source_id) as any;
      if (!sourceInfo) continue;

      const tickers = item.tickers as string[] || [];

      // If watchlist filter, only include items mentioning watched tickers
      if (watchlist && watchlist.length > 0) {
        const hasWatchedTicker = tickers.some(t => watchlist.includes(t.toUpperCase()));
        if (!hasWatchedTicker) continue;
      }

      // Map sentiment label to our format
      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (item.sentiment_label === 'positive') sentiment = 'bullish';
      else if (item.sentiment_label === 'negative') sentiment = 'bearish';

      // Create activity for each ticker mentioned
      for (const ticker of tickers) {
        if (watchlist && !watchlist.includes(ticker.toUpperCase())) continue;

        activities.push({
          id: `${item.id}-${ticker}`,
          sourceId: item.source_id,
          sourceHandle: sourceInfo.handle,
          sourceName: sourceInfo.name,
          ticker: ticker.toUpperCase(),
          sentiment,
          sentimentScore: item.sentiment_score || 0,
          content: item.content,
          hitRate: sourceInfo.hitRate,
          alphaScore: sourceInfo.alphaScore,
          publishedAt: item.published_at,
        });
      }
    }

    // Sort by alpha score (highest first) then by time (most recent first)
    activities.sort((a, b) => {
      if (b.alphaScore !== a.alphaScore) return b.alphaScore - a.alphaScore;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return NextResponse.json({
      activities: activities.slice(0, limit),
      sourceCount: performingSources.length,
      criteria: { minHitRate, minAlphaScore, sinceMinutes },
    });
  } catch (error) {
    console.error('Smart money API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
