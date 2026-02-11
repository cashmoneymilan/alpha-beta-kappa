import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useTradingStore,
  selectPositionBySymbol,
  selectTotalUnrealizedPl,
  selectTotalMarketValue,
} from '../tradingStore';
import type { Account, Position, Order } from '@/types/trading';

// Mock data
const mockAccount: Account = {
  id: 'test-account',
  accountNumber: '12345',
  status: 'ACTIVE',
  currency: 'USD',
  buyingPower: 100000,
  cash: 50000,
  portfolioValue: 150000,
  equity: 150000,
  lastEquity: 145000,
  patternDayTrader: false,
  tradingBlocked: false,
  transfersBlocked: false,
  accountBlocked: false,
  tradeSuspendedByUser: false,
  shortingEnabled: true,
  multiplier: 1,
  initialMargin: 0,
  maintenanceMargin: 0,
  daytradeCount: 0,
  daytradingBuyingPower: 100000,
  regtBuyingPower: 100000,
};

const mockPositions: Position[] = [
  {
    assetId: 'asset-1',
    symbol: 'AAPL',
    exchange: 'NASDAQ',
    assetClass: 'us_equity',
    qty: 100,
    side: 'long',
    marketValue: 15000,
    costBasis: 14000,
    unrealizedPl: 1000,
    unrealizedPlPercent: 7.14,
    unrealizedIntradayPl: 200,
    unrealizedIntradayPlPercent: 1.33,
    currentPrice: 150,
    avgEntryPrice: 140,
    lastdayPrice: 148,
    changeToday: 2.5,
  },
  {
    assetId: 'asset-2',
    symbol: 'NVDA',
    exchange: 'NASDAQ',
    assetClass: 'us_equity',
    qty: 50,
    side: 'long',
    marketValue: 10000,
    costBasis: 9500,
    unrealizedPl: 500,
    unrealizedPlPercent: 5.26,
    unrealizedIntradayPl: 100,
    unrealizedIntradayPlPercent: 1.0,
    currentPrice: 200,
    avgEntryPrice: 190,
    lastdayPrice: 198,
    changeToday: 1.5,
  },
];

const mockOrder: Order = {
  id: 'order-123',
  clientOrderId: 'client-123',
  symbol: 'AAPL',
  qty: 10,
  side: 'buy',
  type: 'market',
  timeInForce: 'day',
  status: 'new',
  filledQty: 0,
  filledAvgPrice: null,
  limitPrice: null,
  stopPrice: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  submittedAt: new Date().toISOString(),
  filledAt: null,
  canceledAt: null,
  expiredAt: null,
};

describe('useTradingStore', () => {
  beforeEach(() => {
    // Reset store state
    useTradingStore.setState({
      account: null,
      positions: [],
      orders: [],
      orderHistory: [],
      isLoadingAccount: false,
      isLoadingPositions: false,
      isLoadingOrders: false,
      isSubmittingOrder: false,
      accountError: null,
      positionsError: null,
      ordersError: null,
      orderSubmitError: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchAccount', () => {
    it('should fetch account successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAccount),
      });

      const { result } = renderHook(() => useTradingStore());

      await act(async () => {
        await result.current.fetchAccount();
      });

      expect(result.current.account).toEqual(mockAccount);
      expect(result.current.accountError).toBeNull();
      expect(result.current.isLoadingAccount).toBe(false);
    });

    it('should handle fetch account error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useTradingStore());

      await act(async () => {
        await result.current.fetchAccount();
      });

      expect(result.current.account).toBeNull();
      expect(result.current.accountError).toBe('Failed to fetch account');
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      global.fetch = vi.fn().mockReturnValue(promise);

      const { result } = renderHook(() => useTradingStore());

      act(() => {
        result.current.fetchAccount();
      });

      expect(result.current.isLoadingAccount).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve(mockAccount),
        });
      });

      expect(result.current.isLoadingAccount).toBe(false);
    });
  });

  describe('fetchPositions', () => {
    it('should fetch positions successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPositions),
      });

      const { result } = renderHook(() => useTradingStore());

      await act(async () => {
        await result.current.fetchPositions();
      });

      expect(result.current.positions).toEqual(mockPositions);
      expect(result.current.positions).toHaveLength(2);
    });

    it('should handle fetch positions error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useTradingStore());

      await act(async () => {
        await result.current.fetchPositions();
      });

      expect(result.current.positions).toEqual([]);
      expect(result.current.positionsError).toBe('Failed to fetch positions');
    });
  });

  describe('submitOrder', () => {
    it('should submit order successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      });

      const { result } = renderHook(() => useTradingStore());

      let submittedOrder: Order | null = null;
      await act(async () => {
        submittedOrder = await result.current.submitOrder({
          symbol: 'AAPL',
          qty: 10,
          side: 'buy',
          type: 'market',
        });
      });

      expect(submittedOrder).toEqual(mockOrder);
      expect(result.current.orders).toContainEqual(mockOrder);
      expect(result.current.orderSubmitError).toBeNull();
    });

    it('should handle order submission error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Insufficient buying power' }),
      });

      const { result } = renderHook(() => useTradingStore());

      let submittedOrder: Order | null = null;
      await act(async () => {
        submittedOrder = await result.current.submitOrder({
          symbol: 'AAPL',
          qty: 10,
          side: 'buy',
          type: 'market',
        });
      });

      expect(submittedOrder).toBeNull();
      expect(result.current.orderSubmitError).toBe('Insufficient buying power');
    });

    it('should set submitting state during order submission', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      global.fetch = vi.fn().mockReturnValue(promise);

      const { result } = renderHook(() => useTradingStore());

      act(() => {
        result.current.submitOrder({
          symbol: 'AAPL',
          qty: 10,
          side: 'buy',
          type: 'market',
        });
      });

      expect(result.current.isSubmittingOrder).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve(mockOrder),
        });
      });

      expect(result.current.isSubmittingOrder).toBe(false);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useTradingStore());

      // First add an order
      act(() => {
        result.current.addOrder(mockOrder);
      });

      expect(result.current.orders).toHaveLength(1);

      let cancelled = false;
      await act(async () => {
        cancelled = await result.current.cancelOrder(mockOrder.id);
      });

      expect(cancelled).toBe(true);
      expect(result.current.orders).toHaveLength(0);
    });

    it('should handle cancel order failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const { result } = renderHook(() => useTradingStore());

      act(() => {
        result.current.addOrder(mockOrder);
      });

      let cancelled = false;
      await act(async () => {
        cancelled = await result.current.cancelOrder(mockOrder.id);
      });

      expect(cancelled).toBe(false);
      // Order should still be in the list
      expect(result.current.orders).toHaveLength(1);
    });
  });

  describe('local state updates', () => {
    it('should add order to list', () => {
      const { result } = renderHook(() => useTradingStore());

      act(() => {
        result.current.addOrder(mockOrder);
      });

      expect(result.current.orders).toContainEqual(mockOrder);
    });

    it('should update order in list', () => {
      const { result } = renderHook(() => useTradingStore());

      act(() => {
        result.current.addOrder(mockOrder);
      });

      const updatedOrder = { ...mockOrder, status: 'filled' as const };

      act(() => {
        result.current.updateOrder(updatedOrder);
      });

      expect(result.current.orders[0]!.status).toBe('filled');
    });

    it('should remove order from list', () => {
      const { result } = renderHook(() => useTradingStore());

      act(() => {
        result.current.addOrder(mockOrder);
      });

      expect(result.current.orders).toHaveLength(1);

      act(() => {
        result.current.removeOrder(mockOrder.id);
      });

      expect(result.current.orders).toHaveLength(0);
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useTradingStore());

      useTradingStore.setState({
        accountError: 'Error 1',
        positionsError: 'Error 2',
        ordersError: 'Error 3',
        orderSubmitError: 'Error 4',
      });

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.accountError).toBeNull();
      expect(result.current.positionsError).toBeNull();
      expect(result.current.ordersError).toBeNull();
      expect(result.current.orderSubmitError).toBeNull();
    });
  });
});

describe('selectors', () => {
  beforeEach(() => {
    useTradingStore.setState({
      positions: mockPositions,
    });
  });

  it('selectPositionBySymbol should find position by symbol', () => {
    const selector = selectPositionBySymbol('AAPL');
    const state = useTradingStore.getState();
    const position = selector(state);

    expect(position?.symbol).toBe('AAPL');
    expect(position?.qty).toBe(100);
  });

  it('selectPositionBySymbol should return undefined for non-existent symbol', () => {
    const selector = selectPositionBySymbol('TSLA');
    const state = useTradingStore.getState();
    const position = selector(state);

    expect(position).toBeUndefined();
  });

  it('selectTotalUnrealizedPl should calculate total unrealized P&L', () => {
    const state = useTradingStore.getState();
    const totalPl = selectTotalUnrealizedPl(state);

    expect(totalPl).toBe(1500); // 1000 + 500
  });

  it('selectTotalMarketValue should calculate total market value', () => {
    const state = useTradingStore.getState();
    const totalValue = selectTotalMarketValue(state);

    expect(totalValue).toBe(25000); // 15000 + 10000
  });
});

describe('order submission validation', () => {
  it('should include all required fields in order submission', async () => {
    let capturedBody: string | undefined;

    global.fetch = vi.fn().mockImplementation((url, options) => {
      capturedBody = options?.body;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      });
    });

    const { result } = renderHook(() => useTradingStore());

    await act(async () => {
      await result.current.submitOrder({
        symbol: 'AAPL',
        qty: 10,
        side: 'buy',
        type: 'limit',
        limit_price: 150,
        time_in_force: 'gtc',
      });
    });

    expect(capturedBody).toBeDefined();
    const parsed = JSON.parse(capturedBody!);
    expect(parsed).toEqual({
      symbol: 'AAPL',
      qty: 10,
      side: 'buy',
      type: 'limit',
      limit_price: 150,
      time_in_force: 'gtc',
    });
  });
});
