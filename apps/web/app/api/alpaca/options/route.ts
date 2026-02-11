import { NextRequest, NextResponse } from 'next/server';
import {
  getOptionsContracts,
  getOptionsChain,
  createOptionsOrder,
  getOptionQuote,
} from '@/lib/alpaca/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type') as 'contracts' | 'chain' | 'quote';
  const expiration = searchParams.get('expiration');
  const optionType = searchParams.get('optionType') as 'call' | 'put' | null;

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case 'chain': {
        // Get options chain with nearby expirations
        const today = new Date();
        const threeMonthsOut = new Date();
        threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

        const chain = await getOptionsChain(
          symbol,
          today.toISOString().split('T')[0],
          threeMonthsOut.toISOString().split('T')[0]
        );

        return NextResponse.json(chain);
      }

      case 'quote': {
        const quote = await getOptionQuote(symbol);
        return NextResponse.json(quote);
      }

      case 'contracts':
      default: {
        const contracts = await getOptionsContracts(
          symbol,
          expiration || undefined,
          optionType || undefined
        );

        return NextResponse.json({ contracts });
      }
    }
  } catch (error) {
    console.error('Options API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch options data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, qty, side, type, time_in_force, limit_price, position_intent } = body;

    if (!symbol || !qty || !side || !type || !time_in_force) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await createOptionsOrder({
      symbol,
      qty,
      side,
      type,
      time_in_force,
      limit_price,
      position_intent,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Options order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create options order' },
      { status: 500 }
    );
  }
}
