import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getQuotes } from '@/lib/fmp/client';
import type { Quote } from '@/types/trading';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const symbols = searchParams.get('symbols');

  try {
    // Single symbol request
    if (symbol) {
      const fmpQuote = await getQuote(symbol);

      if (!fmpQuote) {
        return NextResponse.json(
          { error: `Quote not found for ${symbol}` },
          { status: 404 }
        );
      }

      // Transform to our standard Quote format
      const quote: Quote = {
        symbol: fmpQuote.symbol,
        bid: fmpQuote.price - 0.01, // FMP doesn't provide bid/ask in basic quote
        ask: fmpQuote.price + 0.01, // Estimate spread
        bidSize: 100,
        askSize: 100,
        timestamp: fmpQuote.timestamp * 1000, // Convert to ms
      };

      return NextResponse.json({
        quote,
        raw: fmpQuote, // Include raw data for additional fields
      });
    }

    // Multiple symbols request
    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const fmpQuotes = await getQuotes(symbolList);

      const quotes: Record<string, Quote> = {};
      const raw: Record<string, typeof fmpQuotes[0]> = {};

      for (const fmpQuote of fmpQuotes) {
        quotes[fmpQuote.symbol] = {
          symbol: fmpQuote.symbol,
          bid: fmpQuote.price - 0.01,
          ask: fmpQuote.price + 0.01,
          bidSize: 100,
          askSize: 100,
          timestamp: fmpQuote.timestamp * 1000,
        };
        raw[fmpQuote.symbol] = fmpQuote;
      }

      return NextResponse.json({ quotes, raw });
    }

    return NextResponse.json(
      { error: 'Missing symbol or symbols parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('FMP quotes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
