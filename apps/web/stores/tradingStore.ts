import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type { Account, Position, Order } from '@/types/trading';
import { API_ROUTES } from '@/config/constants';

export type AccountMode = 'paper' | 'real';

// Get API routes based on account mode
const getApiRoutes = (mode: AccountMode) => ({
  account: mode === 'paper' ? API_ROUTES.ACCOUNT : API_ROUTES.SNAPTRADE_ACCOUNTS,
  positions: mode === 'paper' ? API_ROUTES.POSITIONS : API_ROUTES.SNAPTRADE_HOLDINGS,
  orders: mode === 'paper' ? API_ROUTES.ORDERS : API_ROUTES.SNAPTRADE_ORDERS,
});

interface TradingState {
  // Account mode - paper (Alpaca) or real (SnapTrade)
  accountMode: AccountMode;

  // Data
  account: Account | null;
  positions: Position[];
  orders: Order[];
  orderHistory: Order[];

  // Loading states
  isLoadingAccount: boolean;
  isLoadingPositions: boolean;
  isLoadingOrders: boolean;
  isSubmittingOrder: boolean;

  // Error states
  accountError: string | null;
  positionsError: string | null;
  ordersError: string | null;
  orderSubmitError: string | null;

  // Actions
  fetchAccount: () => Promise<void>;
  fetchPositions: () => Promise<void>;
  fetchOrders: (status?: 'open' | 'closed' | 'all') => Promise<void>;
  submitOrder: (order: OrderSubmitParams) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  cancelAllOrders: () => Promise<boolean>;
  closePosition: (symbol: string) => Promise<boolean>;
  closeAllPositions: () => Promise<boolean>;

  // Local updates
  setAccountMode: (mode: AccountMode) => void;
  setAccount: (account: Account) => void;
  setPositions: (positions: Position[]) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  clearErrors: () => void;
}

interface OrderSubmitParams {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
    accountMode: 'paper' as AccountMode,
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

    fetchAccount: async () => {
      set({ isLoadingAccount: true, accountError: null });
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(routes.account);
        if (!response.ok) {
          throw new Error('Failed to fetch account');
        }
        const data = await response.json();
        // Handle different response formats for paper vs real
        const account = get().accountMode === 'paper' ? data : (data.accounts?.[0] || data);
        set({ account, isLoadingAccount: false });
      } catch (error) {
        set({
          accountError: error instanceof Error ? error.message : 'Unknown error',
          isLoadingAccount: false,
        });
      }
    },

    fetchPositions: async () => {
      set({ isLoadingPositions: true, positionsError: null });
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(routes.positions);
        if (!response.ok) {
          throw new Error('Failed to fetch positions');
        }
        const data = await response.json();
        // Handle different response formats for paper vs real (SnapTrade returns holdings)
        const positions = get().accountMode === 'paper' ? data : (data.holdings || data);
        set({ positions, isLoadingPositions: false });
      } catch (error) {
        set({
          positionsError: error instanceof Error ? error.message : 'Unknown error',
          isLoadingPositions: false,
        });
      }
    },

    fetchOrders: async (status = 'open') => {
      set({ isLoadingOrders: true, ordersError: null });
      try {
        const routes = getApiRoutes(get().accountMode);
        const mode = get().accountMode;
        // Different query params for paper vs real
        const statusParam = mode === 'paper' ? `status=${status}` : `state=${status === 'closed' ? 'executed' : 'pending'}`;
        const response = await fetch(`${routes.orders}?${statusParam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        // Handle different response formats
        const orders = mode === 'paper' ? data : (data.orders || data);
        if (status === 'open') {
          set({ orders, isLoadingOrders: false });
        } else if (status === 'closed') {
          set({ orderHistory: orders, isLoadingOrders: false });
        } else {
          // 'all' - separate into open and closed
          const openOrders = orders.filter((o: Order) =>
            ['new', 'partially_filled', 'pending_new', 'accepted', 'pending'].includes(o.status)
          );
          const closedOrders = orders.filter((o: Order) =>
            !['new', 'partially_filled', 'pending_new', 'accepted', 'pending'].includes(o.status)
          );
          set({
            orders: openOrders,
            orderHistory: closedOrders,
            isLoadingOrders: false,
          });
        }
      } catch (error) {
        set({
          ordersError: error instanceof Error ? error.message : 'Unknown error',
          isLoadingOrders: false,
        });
      }
    },

    submitOrder: async (orderParams) => {
      set({ isSubmittingOrder: true, orderSubmitError: null });
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(routes.orders, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderParams),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit order');
        }

        const order = await response.json();
        get().addOrder(order);
        set({ isSubmittingOrder: false });
        return order;
      } catch (error) {
        set({
          orderSubmitError: error instanceof Error ? error.message : 'Unknown error',
          isSubmittingOrder: false,
        });
        return null;
      }
    },

    cancelOrder: async (orderId) => {
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(`${routes.orders}?id=${orderId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to cancel order');
        }
        get().removeOrder(orderId);
        return true;
      } catch (error) {
        console.error('Error cancelling order:', error);
        return false;
      }
    },

    cancelAllOrders: async () => {
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(routes.orders, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to cancel all orders');
        }
        set({ orders: [] });
        return true;
      } catch (error) {
        console.error('Error cancelling all orders:', error);
        return false;
      }
    },

    closePosition: async (symbol) => {
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(`${routes.positions}?symbol=${symbol}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to close position');
        }
        // Refetch positions to update
        get().fetchPositions();
        return true;
      } catch (error) {
        console.error('Error closing position:', error);
        return false;
      }
    },

    closeAllPositions: async () => {
      try {
        const routes = getApiRoutes(get().accountMode);
        const response = await fetch(routes.positions, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to close all positions');
        }
        set({ positions: [] });
        return true;
      } catch (error) {
        console.error('Error closing all positions:', error);
        return false;
      }
    },

    setAccountMode: (mode) => {
      // Clear current data when switching modes
      set({
        accountMode: mode,
        account: null,
        positions: [],
        orders: [],
        orderHistory: [],
        accountError: null,
        positionsError: null,
        ordersError: null,
      });
    },
    setAccount: (account) => set({ account }),
    setPositions: (positions) => set({ positions }),
    setOrders: (orders) => set({ orders }),

    addOrder: (order) =>
      set((state) => ({
        orders: [order, ...state.orders],
      })),

    updateOrder: (order) =>
      set((state) => ({
        orders: state.orders.map((o) => (o.id === order.id ? order : o)),
      })),

    removeOrder: (orderId) =>
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== orderId),
      })),

    clearErrors: () =>
      set({
        accountError: null,
        positionsError: null,
        ordersError: null,
        orderSubmitError: null,
      }),
  }),
      {
        name: 'trading-mode-storage',
        partialize: (state) => ({ accountMode: state.accountMode }),
      }
    )
  )
);

// Non-reactive getter
export const getTradingState = () => useTradingStore.getState();

// Selectors
export const selectAccount = (state: TradingState) => state.account;
export const selectPositions = (state: TradingState) => state.positions;
export const selectOrders = (state: TradingState) => state.orders;

export const selectPositionBySymbol = (symbol: string) => (state: TradingState) =>
  state.positions.find((p) => p.symbol === symbol);

export const selectTotalUnrealizedPl = (state: TradingState) =>
  state.positions.reduce((sum, p) => sum + p.unrealizedPl, 0);

export const selectTotalMarketValue = (state: TradingState) =>
  state.positions.reduce((sum, p) => sum + p.marketValue, 0);
