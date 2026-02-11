import { NextRequest, NextResponse } from 'next/server';
import { getBars, getDailyBars, getIntradayBars } from '@/lib/fmp/client';
import type { Bar } from '@/types/trading';
import type { FMPTimeframe } from '@/lib/fmp/types';

// Map our timeframe format to FMP format
const TIMEFRAME_MAP: Record<string, FMPTimeframe> = {
  '1Min': '1min',
  '5Min': '5min',
  '15Min': '15min',
  '30Min': '30min',
  '1Hour': '1hour',
  '4Hour': '4hour',
  '1Day': '1day',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const timeframe = searchParams.get('timeframe') || '1Day';
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing symbol parameter' },
      { status: 400 }
    );
  }

  try {
    const fmpTimeframe = TIMEFRAME_MAP[timeframe] || '1day';
    let rawBars;

    if (fmpTimeframe === '1day') {
      rawBars = await getDailyBars(symbol, from, to);
    } else {
      rawBars = await getIntradayBars(symbol, fmpTimeframe, from, to);
    }

    // Limit the results
    const limitedBars = rawBars.slice(-limit);

    // Transform to our standard Bar format
    const bars: Bar[] = limitedBars.map(bar => {
      // Parse the date string to timestamp
      const timestamp = new Date(bar.date).getTime();

      return {
        symbol: symbol.toUpperCase(),
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        timestamp,
      };
    });

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      bars,
      timeframe,
      count: bars.length,
    });
  } catch (error) {
    console.error('FMP bars error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bars' },
      { status: 500 }
    );
  }
}
