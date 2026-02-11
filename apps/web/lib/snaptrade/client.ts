// SnapTrade API Client using official SDK
// Documentation: https://docs.snaptrade.com/

import { Snaptrade } from 'snaptrade-typescript-sdk';
import type {
  SnapTradeAccountHoldings,
  SnapTradePosition,
  SnapTradeOrderRequest,
} from './types';

let snaptradeClient: Snaptrade | null = null;

function getClient(): Snaptrade {
  if (snaptradeClient) {
    return snaptradeClient;
  }

  const clientId = process.env.SNAPTRADE_CLIENT_ID;
  const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY;

  if (!clientId || !consumerKey) {
    throw new Error('Missing SnapTrade API credentials (SNAPTRADE_CLIENT_ID, SNAPTRADE_CONSUMER_KEY)');
  }

  snaptradeClient = new Snaptrade({
    clientId,
    consumerKey,
  });

  return snaptradeClient;
}

// ===== USER MANAGEMENT =====

/**
 * Register a new user with SnapTrade
 * Call this when a user first connects their brokerage
 */
export async function registerUser(userId: string) {
  const client = getClient();
  const response = await client.authentication.registerSnapTradeUser({
    userId,
  });
  return response.data;
}

/**
 * Delete a user from SnapTrade
 */
export async function deleteUser(userId: string) {
  const client = getClient();
  await client.authentication.deleteSnapTradeUser({
    userId,
  });
}

// ===== AUTHENTICATION =====

/**
 * Generate a login link for connecting a brokerage
 * User will be redirected to SnapTrade's connection portal
 */
export async function getLoginLink(
  userId: string,
  userSecret: string,
  brokerageSlug?: string,
  redirectUri?: string
) {
  const client = getClient();
  const response = await client.authentication.loginSnapTradeUser({
    userId,
    userSecret,
    broker: brokerageSlug,
    customRedirect: redirectUri,
  });
  return response.data;
}

/**
 * Get list of connected brokerage authorizations
 */
export async function getAuthorizations(userId: string, userSecret: string) {
  const client = getClient();
  const response = await client.connections.listBrokerageAuthorizations({
    userId,
    userSecret,
  });
  return response.data;
}

/**
 * Delete a brokerage authorization (disconnect)
 */
export async function deleteAuthorization(
  userId: string,
  userSecret: string,
  authorizationId: string
) {
  const client = getClient();
  await client.connections.removeBrokerageAuthorization({
    userId,
    userSecret,
    authorizationId,
  });
}

// ===== BROKERAGES =====

/**
 * Get list of supported brokerages
 */
export async function getBrokerages() {
  const client = getClient();
  const response = await client.referenceData.listAllBrokerages();
  return response.data;
}

// ===== ACCOUNTS =====

/**
 * Get all accounts for a user
 */
export async function getAccounts(userId: string, userSecret: string) {
  const client = getClient();
  const response = await client.accountInformation.listUserAccounts({
    userId,
    userSecret,
  });
  return response.data;
}

/**
 * Get holdings for a specific account
 */
export async function getAccountHoldings(
  userId: string,
  userSecret: string,
  accountId: string
): Promise<SnapTradeAccountHoldings> {
  const client = getClient();
  const response = await client.accountInformation.getUserHoldings({
    userId,
    userSecret,
    accountId,
  });
  // Transform SDK response to match our types
  return response.data as unknown as SnapTradeAccountHoldings;
}

/**
 * Get holdings for all accounts
 */
export async function getAllHoldings(
  userId: string,
  userSecret: string
): Promise<SnapTradeAccountHoldings[]> {
  const client = getClient();
  const response = await client.accountInformation.getAllUserHoldings({
    userId,
    userSecret,
  });
  return response.data as unknown as SnapTradeAccountHoldings[];
}

// ===== POSITIONS =====

/**
 * Get positions for a specific account
 */
export async function getPositions(
  userId: string,
  userSecret: string,
  accountId: string
): Promise<SnapTradePosition[]> {
  const client = getClient();
  const response = await client.accountInformation.getUserAccountPositions({
    userId,
    userSecret,
    accountId,
  });
  return response.data as unknown as SnapTradePosition[];
}

// ===== ORDERS =====

/**
 * Get orders for a specific account
 */
export async function getOrders(
  userId: string,
  userSecret: string,
  accountId: string,
  state?: 'all' | 'open' | 'executed'
) {
  const client = getClient();
  const response = await client.accountInformation.getUserAccountOrders({
    userId,
    userSecret,
    accountId,
    state,
  });
  return response.data;
}

/**
 * Place an order
 */
export async function placeOrder(
  userId: string,
  userSecret: string,
  order: SnapTradeOrderRequest
) {
  const client = getClient();
  const response = await client.trading.placeForceOrder({
    userId,
    userSecret,
    account_id: order.account_id,
    universal_symbol_id: order.universal_symbol_id,
    action: order.action as 'BUY' | 'SELL',
    order_type: order.order_type as 'Limit' | 'Market' | 'StopLimit' | 'Stop',
    time_in_force: order.time_in_force as 'Day' | 'GTC',
    price: order.price,
    stop: order.stop,
    units: order.units,
  });
  return response.data;
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  userId: string,
  userSecret: string,
  accountId: string,
  orderId: string
) {
  const client = getClient();
  await client.trading.cancelUserAccountOrder({
    userId,
    userSecret,
    accountId,
    brokerage_order_id: orderId,
  });
}

// ===== HELPER FUNCTIONS =====

/**
 * Calculate total portfolio value across all accounts
 */
export async function getTotalPortfolioValue(
  userId: string,
  userSecret: string
): Promise<{ total: number; currency: string; byAccount: Map<string, number> }> {
  const holdings = await getAllHoldings(userId, userSecret);

  let total = 0;
  const byAccount = new Map<string, number>();
  let currency = 'USD';

  for (const holding of holdings) {
    const accountValue = holding.total_value?.amount || 0;
    total += accountValue;
    byAccount.set(holding.account.id, accountValue);

    if (holding.total_value?.currency) {
      currency = holding.total_value.currency;
    }
  }

  return { total, currency, byAccount };
}

/**
 * Get all positions across all accounts
 */
export async function getAllPositions(
  userId: string,
  userSecret: string
): Promise<Array<SnapTradePosition & { accountId: string; accountName: string }>> {
  const holdings = await getAllHoldings(userId, userSecret);
  const allPositions: Array<SnapTradePosition & { accountId: string; accountName: string }> = [];

  for (const holding of holdings) {
    for (const position of holding.positions) {
      allPositions.push({
        ...position,
        accountId: holding.account.id,
        accountName: holding.account.name,
      });
    }
  }

  return allPositions;
}
