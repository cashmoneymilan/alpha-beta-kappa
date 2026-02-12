import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getAccounts, getOrders, placeOrder, cancelOrder } from '@/lib/snaptrade/client';
import type { SnapTradeOrderRequest, SnapTradeOrderType, SnapTradeTimeInForce } from '@/lib/snaptrade/types';

function transformOrder(order: any) {
  return {
    id: order.brokerage_order_id,
    symbol: order.symbol?.symbol || order.symbol,
    side: order.action?.toLowerCase() || '',
    type: order.order_type?.toLowerCase() || '',
    qty: order.total_quantity || 0,
    filledQty: order.filled_quantity || 0,
    filledAvgPrice: order.execution_price || null,
    limitPrice: order.limit_price || null,
    stopPrice: order.stop_price || null,
    status: order.status?.toLowerCase() || '',
    timeInForce: order.time_in_force?.toLowerCase() || '',
    createdAt: order.time_placed,
    filledAt: order.time_executed || null,
  };
}

/**
 * GET /api/bot/snaptrade/orders
 * Query: ?accountId=xxx&state=all|open|executed
 * If accountId is omitted, fetches orders for all accounts.
 */
export async function GET(req: NextRequest) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const accountId = req.nextUrl.searchParams.get('accountId');
    const state = (req.nextUrl.searchParams.get('state') as 'all' | 'open' | 'executed') || 'all';

    if (accountId) {
      const orders = await getOrders(creds.userId, creds.userSecret, accountId, state);
      return NextResponse.json({ orders: (orders as any[]).map(transformOrder) });
    }

    // Get all accounts, then orders for each
    const accounts = await getAccounts(creds.userId, creds.userSecret) as any[];
    const allOrders = await Promise.all(
      accounts.map(async (acct: any) => {
        try {
          const orders = await getOrders(creds.userId, creds.userSecret, acct.id, state);
          return (orders as any[]).map((o: any) => ({
            ...transformOrder(o),
            accountId: acct.id,
            accountName: acct.name,
          }));
        } catch {
          return [];
        }
      })
    );

    return NextResponse.json({ orders: allOrders.flat() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bot/snaptrade/orders
 * Body: { accountId, symbol, action, orderType, quantity, limitPrice?, stopPrice?, timeInForce? }
 */
export async function POST(req: NextRequest) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const body = await req.json();
    const { accountId, symbol, action, orderType, quantity, limitPrice, stopPrice, timeInForce = 'day' } = body;

    if (!accountId || !symbol || !action || !orderType || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: accountId, symbol, action, orderType, quantity' },
        { status: 400 }
      );
    }

    const orderTypeMap: Record<string, SnapTradeOrderType> = {
      market: 'Market',
      limit: 'Limit',
      stop: 'StopLoss',
      stop_limit: 'StopLimit',
    };

    const tifMap: Record<string, SnapTradeTimeInForce> = {
      day: 'Day',
      gtc: 'GTC',
      fok: 'FOK',
    };

    const orderRequest: SnapTradeOrderRequest = {
      account_id: accountId,
      action: action.toUpperCase() as 'BUY' | 'SELL',
      order_type: orderTypeMap[orderType] || 'Market',
      time_in_force: tifMap[timeInForce] || 'Day',
      units: quantity,
      symbol: symbol.toUpperCase(),
    };

    if (limitPrice && (orderType === 'limit' || orderType === 'stop_limit')) {
      orderRequest.price = limitPrice;
    }
    if (stopPrice && (orderType === 'stop' || orderType === 'stop_limit')) {
      orderRequest.stop = stopPrice;
    }

    const result = await placeOrder(creds.userId, creds.userSecret, orderRequest);
    return NextResponse.json({ success: true, order: transformOrder(result) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to place order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bot/snaptrade/orders
 * Body: { accountId, orderId }
 */
export async function DELETE(req: NextRequest) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const body = await req.json();
    const { accountId, orderId } = body;

    if (!accountId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: accountId, orderId' },
        { status: 400 }
      );
    }

    await cancelOrder(creds.userId, creds.userSecret, accountId, orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
