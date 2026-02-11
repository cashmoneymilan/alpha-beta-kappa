import type {
  AlpacaAccount,
  AlpacaPosition,
  AlpacaOrder,
  AlpacaBar,
  AlpacaStreamQuote,
  AlpacaStreamTrade,
  AlpacaStreamBar,
} from '@/types/alpaca';
import type {
  Account,
  Position,
  Order,
  Bar,
  Quote,
  Trade,
} from '@/types/trading';

export function transformAccount(raw: AlpacaAccount): Account {
  return {
    id: raw.id,
    accountNumber: raw.account_number,
    status: raw.status,
    currency: raw.currency,
    cash: parseFloat(raw.cash),
    portfolioValue: parseFloat(raw.portfolio_value),
    patternDayTrader: raw.pattern_day_trader,
    tradingBlocked: raw.trading_blocked,
    transfersBlocked: raw.transfers_blocked,
    accountBlocked: raw.account_blocked,
    tradeSuspendedByUser: raw.trade_suspended_by_user,
    shortingEnabled: raw.shorting_enabled,
    equity: parseFloat(raw.equity),
    lastEquity: parseFloat(raw.last_equity),
    multiplier: parseFloat(raw.multiplier),
    buyingPower: parseFloat(raw.buying_power),
    initialMargin: parseFloat(raw.initial_margin),
    maintenanceMargin: parseFloat(raw.maintenance_margin),
    daytradeCount: raw.daytrade_count,
    daytradingBuyingPower: parseFloat(raw.daytrading_buying_power),
    regtBuyingPower: parseFloat(raw.regt_buying_power),
  };
}

export function transformPosition(raw: AlpacaPosition): Position {
  return {
    assetId: raw.asset_id,
    symbol: raw.symbol,
    exchange: raw.exchange,
    assetClass: raw.asset_class,
    avgEntryPrice: parseFloat(raw.avg_entry_price),
    qty: parseFloat(raw.qty),
    side: raw.side,
    marketValue: parseFloat(raw.market_value),
    costBasis: parseFloat(raw.cost_basis),
    unrealizedPl: parseFloat(raw.unrealized_pl),
    unrealizedPlPercent: parseFloat(raw.unrealized_plpc),
    unrealizedIntradayPl: parseFloat(raw.unrealized_intraday_pl),
    unrealizedIntradayPlPercent: parseFloat(raw.unrealized_intraday_plpc),
    currentPrice: parseFloat(raw.current_price),
    lastdayPrice: parseFloat(raw.lastday_price),
    changeToday: parseFloat(raw.change_today),
  };
}

export function transformOrder(raw: AlpacaOrder): Order {
  return {
    id: raw.id,
    clientOrderId: raw.client_order_id,
    symbol: raw.symbol,
    side: raw.side,
    type: raw.type,
    timeInForce: raw.time_in_force,
    qty: parseFloat(raw.qty),
    filledQty: parseFloat(raw.filled_qty),
    filledAvgPrice: raw.filled_avg_price ? parseFloat(raw.filled_avg_price) : null,
    limitPrice: raw.limit_price ? parseFloat(raw.limit_price) : null,
    stopPrice: raw.stop_price ? parseFloat(raw.stop_price) : null,
    status: raw.status as Order['status'],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    submittedAt: raw.submitted_at,
    filledAt: raw.filled_at,
    canceledAt: raw.canceled_at,
    expiredAt: raw.expired_at,
  };
}

export function transformBar(raw: AlpacaBar, symbol: string): Bar {
  return {
    symbol,
    open: raw.o,
    high: raw.h,
    low: raw.l,
    close: raw.c,
    volume: raw.v,
    timestamp: new Date(raw.t).getTime(),
  };
}

export function transformStreamQuote(raw: AlpacaStreamQuote): Quote {
  return {
    symbol: raw.S,
    bid: raw.bp,
    ask: raw.ap,
    bidSize: raw.bs,
    askSize: raw.as,
    timestamp: new Date(raw.t).getTime(),
  };
}

export function transformStreamTrade(raw: AlpacaStreamTrade): Trade {
  return {
    symbol: raw.S,
    price: raw.p,
    size: raw.s,
    timestamp: new Date(raw.t).getTime(),
  };
}

export function transformStreamBar(raw: AlpacaStreamBar): Bar {
  return {
    symbol: raw.S,
    open: raw.o,
    high: raw.h,
    low: raw.l,
    close: raw.c,
    volume: raw.v,
    timestamp: new Date(raw.t).getTime(),
  };
}
