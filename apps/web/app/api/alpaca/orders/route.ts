import { NextResponse } from 'next/server';
import {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  cancelAllOrders,
  type CreateOrderParams,
} from '@/lib/alpaca/client';
import { transformOrder } from '@/lib/alpaca/transforms';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as 'open' | 'closed' | 'all') || 'open';
    const orderId = searchParams.get('id');

    if (orderId) {
      const rawOrder = await getOrder(orderId);
      const order = transformOrder(rawOrder);
      return NextResponse.json(order);
    }

    const rawOrders = await getOrders(status);
    const orders = rawOrders.map(transformOrder);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.symbol || !body.side || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, side, type' },
        { status: 400 }
      );
    }

    // Validate qty or notional
    if (!body.qty && !body.notional) {
      return NextResponse.json(
        { error: 'Either qty or notional is required' },
        { status: 400 }
      );
    }

    const params: CreateOrderParams = {
      symbol: body.symbol.toUpperCase(),
      side: body.side,
      type: body.type,
      time_in_force: body.time_in_force || 'day',
      ...(body.qty && { qty: Number(body.qty) }),
      ...(body.notional && { notional: Number(body.notional) }),
      ...(body.limit_price && { limit_price: Number(body.limit_price) }),
      ...(body.stop_price && { stop_price: Number(body.stop_price) }),
      ...(body.extended_hours !== undefined && { extended_hours: body.extended_hours }),
      ...(body.client_order_id && { client_order_id: body.client_order_id }),
    };

    const rawOrder = await createOrder(params);
    const order = transformOrder(rawOrder);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (orderId) {
      await cancelOrder(orderId);
      return NextResponse.json({ success: true, orderId });
    } else {
      await cancelAllOrders();
      return NextResponse.json({ success: true, message: 'All orders cancelled' });
    }
  } catch (error) {
    console.error('Error cancelling order(s):', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order(s)' },
      { status: 500 }
    );
  }
}
