import { NextResponse } from 'next/server';
import { getPositions, closePosition, closeAllPositions } from '@/lib/alpaca/client';
import { transformPosition, transformOrder } from '@/lib/alpaca/transforms';

export async function GET() {
  try {
    const rawPositions = await getPositions();
    const positions = rawPositions.map(transformPosition);
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (symbol) {
      // Close specific position
      const rawOrder = await closePosition(symbol);
      const order = transformOrder(rawOrder);
      return NextResponse.json(order);
    } else {
      // Close all positions
      const rawOrders = await closeAllPositions();
      const orders = rawOrders.map(transformOrder);
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error('Error closing position(s):', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to close position(s)' },
      { status: 500 }
    );
  }
}
