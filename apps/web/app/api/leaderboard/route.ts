import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export interface LeaderboardSource {
  id: string;
  handle: string;
  name: string;
  type: string;
  hitRate1h: number;
  hitRate1d: number;
  avgReturn1d: number;
  totalPredictions: number;
  bullishCount: number;
  bearishCount: number;
  alphaScore: number;
  bestTicker: string | null;
  bestReturn: number | null;
  worstTicker: string | null;
  worstReturn: number | null;
  lastCalculated: string | null;
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const limit = parseInt(searchParams.get('limit') || '20');
  const sortBy = searchParams.get('sort') || 'alpha_score';
  const period = searchParams.get('period') || '7d'; // 7d, 30d, all

  try {
    // Get source performance with source details
    const { data: performance, error } = await supabase
      .from('source_performance')
      .select(`
        *,
        source:sources(id, handle, name, type)
      `)
      .order(sortBy, { ascending: false })
      .limit(limit) as any;

    if (error) {
      // If table doesn't exist yet, return empty data
      if (error.code === '42P01') {
        return NextResponse.json({ sources: [], message: 'No performance data yet' });
      }
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!performance || performance.length === 0) {
      // Fall back to sources with their feed item counts
      const { data: sources } = await supabase
        .from('sources')
        .select(`
          id,
          handle,
          name,
          type,
          weight
        `)
        .eq('enabled', true)
        .order('weight', { ascending: false })
        .limit(limit) as any;

      if (!sources) {
        return NextResponse.json({ sources: [] });
      }

      // Get feed item counts per source
      const { data: counts } = await supabase
        .from('feed_items')
        .select('source_id')
        .in('source_id', sources.map((s: any) => s.id)) as any;

      const countMap = new Map<string, number>();
      for (const item of counts || []) {
        countMap.set(item.source_id, (countMap.get(item.source_id) || 0) + 1);
      }

      const leaderboard: LeaderboardSource[] = sources.map((source: any) => ({
        id: source.id,
        handle: source.handle,
        name: source.name,
        type: source.type,
        hitRate1h: 50, // Default pending data
        hitRate1d: 50,
        avgReturn1d: 0,
        totalPredictions: countMap.get(source.id) || 0,
        bullishCount: 0,
        bearishCount: 0,
        alphaScore: source.weight * 10, // Use weight as proxy
        bestTicker: null,
        bestReturn: null,
        worstTicker: null,
        worstReturn: null,
        lastCalculated: null,
      }));

      return NextResponse.json({
        sources: leaderboard,
        period,
        hasRealData: false,
      });
    }

    const leaderboard: LeaderboardSource[] = performance.map((p: any) => ({
      id: p.source?.id || p.source_id,
      handle: p.source?.handle || 'unknown',
      name: p.source?.name || 'Unknown',
      type: p.source?.type || 'twitter',
      hitRate1h: p.hit_rate_1h || 50,
      hitRate1d: p.hit_rate_1d || 50,
      avgReturn1d: p.avg_return_1d || 0,
      totalPredictions: p.total_predictions || 0,
      bullishCount: p.bullish_count || 0,
      bearishCount: p.bearish_count || 0,
      alphaScore: p.alpha_score || 50,
      bestTicker: p.best_ticker,
      bestReturn: p.best_return,
      worstTicker: p.worst_ticker,
      worstReturn: p.worst_return,
      lastCalculated: p.last_calculated_at,
    }));

    return NextResponse.json({
      sources: leaderboard,
      period,
      hasRealData: true,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
