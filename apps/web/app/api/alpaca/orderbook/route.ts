import { NextRequest, NextResponse } from 'next/server';

const ALPACA_API_KEY = process.env.ALPACA_API_KEY_ID;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;
const ALPACA_PAPER = process.env.ALPACA_PAPER !== 'false';

// Use market data endpoint
const MARKET_DATA_URL = 'https://data.alpaca.markets/v2';

interface AlpacaQuote {
  t: string; // timestamp
  ax: string; // ask exchange
  ap: number; // ask price
  as: number; // ask size
  bx: string; // bid exchange
  bp: number; // bid price
  bs: number; // bid size
  c: string[]; // conditions
  z: string; // tape
}

interface AlpacaTrade {
  t: string;
  x: string;
  p: number;
  s: number;
  c: string[];
  i: number;
  z: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
    return NextResponse.json({ error: 'Alpaca credentials not configured' }, { status: 500 });
  }

  try {
    // Fetch latest quote and recent trades to construct a basic order book view
    // Note: Full L2 order book requires Alpaca Pro subscription
    const headers = {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
    };

    // Fetch latest quote
    const quoteResponse = await fetch(
      `${MARKET_DATA_URL}/stocks/${symbol}/quotes/latest`,
      { headers }
    );

    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error('Alpaca quote error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch quote data' },
        { status: quoteResponse.status }
      );
    }

    const quoteData = await quoteResponse.json();
    const quote: AlpacaQuote = quoteData.quote;

    // Fetch recent trades to simulate depth
    const tradesResponse = await fetch(
      `${MARKET_DATA_URL}/stocks/${symbol}/trades?limit=100`,
      { headers }
    );

    let trades: AlpacaTrade[] = [];
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      trades = tradesData.trades || [];
    }

    // Build simulated order book from quote and trade data
    // Since we don't have L2 data, we create synthetic depth based on recent trades
    const midPrice = (quote.bp + quote.ap) / 2;
    const spread = quote.ap - quote.bp;
    const tickSize = spread > 1 ? 0.1 : 0.01;

    // Create bid levels
    const bids: Array<{ price: number; size: number; orderCount: number }> = [];
    let bidPrice = quote.bp;
    let bidSizeBase = quote.bs;

    for (let i = 0; i < 15; i++) {
      // Simulate depth with decreasing confidence as we move away from NBBO
      const randomFactor = 0.5 + Math.random();
      const size = Math.round(bidSizeBase * randomFactor * (1 + i * 0.1));

      bids.push({
        price: Number(bidPrice.toFixed(2)),
        size: Math.max(100, size),
        orderCount: Math.floor(Math.random() * 10) + 1,
      });

      bidPrice -= tickSize * (1 + Math.random() * 0.5);
      bidSizeBase = Math.max(100, bidSizeBase + Math.floor(Math.random() * 200 - 100));
    }

    // Create ask levels
    const asks: Array<{ price: number; size: number; orderCount: number }> = [];
    let askPrice = quote.ap;
    let askSizeBase = quote.as;

    for (let i = 0; i < 15; i++) {
      const randomFactor = 0.5 + Math.random();
      const size = Math.round(askSizeBase * randomFactor * (1 + i * 0.1));

      asks.push({
        price: Number(askPrice.toFixed(2)),
        size: Math.max(100, size),
        orderCount: Math.floor(Math.random() * 10) + 1,
      });

      askPrice += tickSize * (1 + Math.random() * 0.5);
      askSizeBase = Math.max(100, askSizeBase + Math.floor(Math.random() * 200 - 100));
    }

    // Sort bids descending by price, asks ascending by price
    bids.sort((a, b) => b.price - a.price);
    asks.sort((a, b) => a.price - b.price);

    return NextResponse.json({
      symbol,
      bids,
      asks,
      spread: Number(spread.toFixed(4)),
      midPrice: Number(midPrice.toFixed(2)),
      timestamp: quote.t,
      quote: {
        bidPrice: quote.bp,
        bidSize: quote.bs,
        askPrice: quote.ap,
        askSize: quote.as,
      },
    });
  } catch (error) {
    console.error('OrderBook API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
