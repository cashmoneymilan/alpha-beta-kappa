import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getOrders, placeOrder, cancelOrder } from '@/lib/snaptrade/client';
import type { SnapTradeOrderRequest, SnapTradeOrderType, SnapTradeTimeInForce } from '@/lib/snaptrade/types';
import type { UserBrokerPartial, BrokerAccountPartial } from '@/lib/snaptrade/db-types';

/**
 * GET /api/snaptrade/orders
 * Get orders for all connected accounts or a specific account
 *
 * Query params:
 * - accountId: (optional) specific account to get orders for
 * - state: (optional) 'all' | 'open' | 'executed' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const state = (searchParams.get('state') as 'all' | 'open' | 'executed') || 'all';

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's SnapTrade credentials
    const { data: userBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
      return NextResponse.json({
        orders: [],
        message: 'No brokerage connected',
      });
    }

    // If accountId specified, get orders for that account
    if (accountId) {
      const orders = await getOrders(
        userBroker.snaptrade_user_id,
        userBroker.snaptrade_user_secret,
        accountId,
        state
      );

      return NextResponse.json({
        orders: orders.map(transformOrder),
      });
    }

    // Otherwise, get all accounts and their orders
    const { data: accounts } = await supabase
      .from('broker_accounts' as any)
      .select('snaptrade_account_id, account_name, brokerage_name')
      .eq('user_id', user.id)
      .eq('is_active', true) as { data: BrokerAccountPartial[] | null };

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        orders: [],
        message: 'No accounts found',
      });
    }

    // Fetch orders for all accounts
    const allOrders = await Promise.all(
      accounts.map(async (account) => {
        try {
          const orders = await getOrders(
            userBroker.snaptrade_user_id!,
            userBroker.snaptrade_user_secret!,
            account.snaptrade_account_id,
            state
          );
          return orders.map(order => ({
            ...transformOrder(order),
            accountId: account.snaptrade_account_id,
            accountName: account.account_name,
            brokerage: account.brokerage_name,
          }));
        } catch (error) {
          console.error(`Failed to fetch orders for account ${account.snaptrade_account_id}:`, error);
          return [];
        }
      })
    );

    return NextResponse.json({
      orders: allOrders.flat(),
    });
  } catch (error) {
    console.error('SnapTrade orders error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/snaptrade/orders
 * Place a new order
 *
 * Body:
 * - accountId: The account to place the order in
 * - symbol: Stock symbol (e.g., 'AAPL')
 * - action: 'buy' | 'sell'
 * - orderType: 'market' | 'limit' | 'stop' | 'stop_limit'
 * - quantity: Number of shares
 * - limitPrice: (optional) Limit price for limit orders
 * - stopPrice: (optional) Stop price for stop orders
 * - timeInForce: 'day' | 'gtc' (default: 'day')
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      accountId,
      symbol,
      action,
      orderType,
      quantity,
      limitPrice,
      stopPrice,
      timeInForce = 'day',
    } = body;

    // Validate required fields
    if (!accountId || !symbol || !action || !orderType || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's SnapTrade credentials
    const { data: userBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
      return NextResponse.json(
        { error: 'No brokerage connected' },
        { status: 400 }
      );
    }

    // Map order type
    const orderTypeMap: Record<string, SnapTradeOrderType> = {
      market: 'Market',
      limit: 'Limit',
      stop: 'StopLoss',
      stop_limit: 'StopLimit',
    };

    // Map time in force
    const tifMap: Record<string, SnapTradeTimeInForce> = {
      day: 'Day',
      gtc: 'GTC',
      fok: 'FOK',
    };

    // Build order request
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

    // Place the order
    const orderResponse = await placeOrder(
      userBroker.snaptrade_user_id,
      userBroker.snaptrade_user_secret,
      orderRequest
    );

    // Log the trade in our database
    await supabase.from('trade_log' as any).insert({
      user_id: user.id,
      account_id: accountId,
      account_type: 'real',
      symbol: symbol.toUpperCase(),
      side: action,
      quantity,
      order_type: orderType,
      status: orderResponse.status,
      brokerage_order_id: orderResponse.brokerage_order_id,
      created_at: new Date().toISOString(),
    } as any);

    return NextResponse.json({
      success: true,
      order: transformOrder(orderResponse),
    });
  } catch (error) {
    console.error('SnapTrade place order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to place order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/snaptrade/orders
 * Cancel an order
 *
 * Body:
 * - accountId: The account the order is in
 * - orderId: The brokerage order ID to cancel
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountId, orderId } = body;

    if (!accountId || !orderId) {
      return NextResponse.json(
        { error: 'Missing accountId or orderId' },
        { status: 400 }
      );
    }

    // Get user's SnapTrade credentials
    const { data: userBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
      return NextResponse.json(
        { error: 'No brokerage connected' },
        { status: 400 }
      );
    }

    await cancelOrder(
      userBroker.snaptrade_user_id,
      userBroker.snaptrade_user_secret,
      accountId,
      orderId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SnapTrade cancel order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

// Transform SnapTrade order to our format
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
