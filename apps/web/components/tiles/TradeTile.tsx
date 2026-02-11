'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tile } from '@/stores/workspace';
import { useTradingStore, type AccountMode } from '@/stores/tradingStore';
import { useMarketDataStore, selectLatestPrice } from '@/stores/marketDataStore';
import { REFRESH_INTERVALS } from '@/config/constants';
import { OrderConfirmModal, type OrderPreview } from './OrderConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TradeTileProps {
  tile: Tile;
}

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';
type OptionsOrderType = 'buy_to_open' | 'sell_to_open' | 'buy_to_close' | 'sell_to_close';
type ActiveTab = 'trade' | 'options' | 'orders' | 'history';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Position size presets as percentage of buying power
const POSITION_SIZE_PRESETS = [
  { label: '5%', value: 0.05 },
  { label: '10%', value: 0.1 },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
];

// ===========================================
// Trade Panel (Stock Trading)
// ===========================================
function TradePanel({ ticker }: { ticker: string }) {
  const [symbol, setSymbol] = useState(ticker || 'AAPL');
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    account,
    positions,
    submitOrder,
    isSubmittingOrder,
    orderSubmitError,
    clearErrors,
    fetchAccount,
    fetchPositions,
  } = useTradingStore();

  const latestPrice = useMarketDataStore(selectLatestPrice(symbol.toUpperCase()));

  useEffect(() => {
    fetchAccount();
    fetchPositions();
  }, [fetchAccount, fetchPositions]);

  const existingPosition = useMemo(() => {
    return positions.find((p) => p.symbol.toUpperCase() === symbol.toUpperCase());
  }, [positions, symbol]);

  const estimatedPrice = useMemo(() => {
    if (orderType === 'limit' && limitPrice) {
      return parseFloat(limitPrice);
    }
    return latestPrice || 0;
  }, [orderType, limitPrice, latestPrice]);

  const orderPreview = useMemo((): OrderPreview | null => {
    const qty = parseFloat(quantity) || 0;
    if (!qty || !estimatedPrice) return null;

    const estimatedCost = qty * estimatedPrice;
    const equity = account?.equity || 0;
    const buyingPower = account?.buyingPower || 0;
    const percentOfEquity = equity > 0 ? (estimatedCost / equity) * 100 : 0;
    const buyingPowerUsed = side === 'buy' ? estimatedCost : 0;
    const buyingPowerRemaining = buyingPower - buyingPowerUsed;
    const hasInsufficientFunds = side === 'buy' && estimatedCost > buyingPower;

    return {
      symbol: symbol.toUpperCase(),
      side,
      type: orderType,
      qty,
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      estimatedPrice,
      estimatedCost,
      percentOfEquity,
      buyingPowerUsed,
      buyingPowerRemaining,
      hasInsufficientFunds,
      existingPosition: existingPosition
        ? {
            qty: existingPosition.qty,
            side: existingPosition.side,
            avgEntryPrice: existingPosition.avgEntryPrice,
            unrealizedPl: existingPosition.unrealizedPl,
          }
        : undefined,
    };
  }, [symbol, side, orderType, quantity, limitPrice, estimatedPrice, account, existingPosition]);

  const handlePresetClick = useCallback(
    (percentage: number) => {
      if (!account?.buyingPower || !estimatedPrice) return;
      const maxCost = account.buyingPower * percentage;
      const shares = Math.floor(maxCost / estimatedPrice);
      setQuantity(shares.toString());
    },
    [account?.buyingPower, estimatedPrice]
  );

  const handleSubmitClick = useCallback(() => {
    clearErrors();
    setShowConfirmModal(true);
  }, [clearErrors]);

  const handleConfirmOrder = useCallback(async () => {
    const order = {
      symbol: symbol.toUpperCase(),
      side,
      type: orderType,
      qty: parseFloat(quantity),
      ...(orderType === 'limit' && limitPrice ? { limit_price: parseFloat(limitPrice) } : {}),
    };

    const result = await submitOrder(order);
    if (result) {
      setShowConfirmModal(false);
      setQuantity('1');
      setLimitPrice('');
    }
  }, [symbol, side, orderType, quantity, limitPrice, submitOrder]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const estimatedCost = (parseFloat(quantity) || 0) * estimatedPrice;
  const percentOfEquity =
    account?.equity && estimatedCost ? ((estimatedCost / account.equity) * 100).toFixed(1) : '0';

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      {/* Symbol input */}
      <div>
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block">
          Symbol
        </Label>
        <Input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL"
          className="h-8"
        />
      </div>

      {/* Price display */}
      {estimatedPrice > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current Price</span>
          <span className="font-medium">{formatCurrency(estimatedPrice)}</span>
        </div>
      )}

      {/* Buy/Sell toggle */}
      <ToggleGroup
        type="single"
        value={side}
        onValueChange={(value) => value && setSide(value as OrderSide)}
        className="w-full"
      >
        <ToggleGroupItem
          value="buy"
          className={cn(
            'flex-1 data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:hover:bg-emerald-700',
            side !== 'buy' && 'border border-zinc-700'
          )}
        >
          BUY
        </ToggleGroupItem>
        <ToggleGroupItem
          value="sell"
          className={cn(
            'flex-1 data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:hover:bg-red-700',
            side !== 'sell' && 'border border-zinc-700'
          )}
        >
          SELL
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Order type */}
      <div>
        <Label className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block">
          Order Type
        </Label>
        <ToggleGroup
          type="single"
          value={orderType}
          onValueChange={(value) => value && setOrderType(value as OrderType)}
          className="w-full"
          size="sm"
        >
          <ToggleGroupItem
            value="market"
            className={cn('flex-1', orderType !== 'market' && 'border border-zinc-700')}
          >
            Market
          </ToggleGroupItem>
          <ToggleGroupItem
            value="limit"
            className={cn('flex-1', orderType !== 'limit' && 'border border-zinc-700')}
          >
            Limit
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Quantity */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-[10px] text-zinc-400 uppercase tracking-wider">Quantity</Label>
          <div className="flex gap-1">
            {POSITION_SIZE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => handlePresetClick(preset.value)}
                disabled={!estimatedPrice || !account?.buyingPower}
                className="h-5 px-1.5 text-[9px]"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="1"
          min="1"
          className="h-8"
        />
      </div>

      {/* Limit price */}
      {orderType === 'limit' && (
        <div>
          <Label className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block">
            Limit Price
          </Label>
          <Input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="h-8"
          />
        </div>
      )}

      {/* Order summary */}
      {estimatedPrice > 0 && parseFloat(quantity) > 0 && (
        <div className="bg-muted/50 rounded p-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Cost</span>
            <span className="font-medium">{formatCurrency(estimatedCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">% of Portfolio</span>
            <span
              className={cn(
                'font-medium',
                parseFloat(percentOfEquity) > 50
                  ? 'text-red-400'
                  : parseFloat(percentOfEquity) > 25
                    ? 'text-yellow-400'
                    : 'text-foreground'
              )}
            >
              {percentOfEquity}%
            </span>
          </div>
          {account && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buying Power</span>
              <span
                className={cn(
                  'font-medium',
                  side === 'buy' && estimatedCost > account.buyingPower
                    ? 'text-red-400'
                    : 'text-foreground'
                )}
              >
                {formatCurrency(account.buyingPower)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Existing position */}
      {existingPosition && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-xs">
          <div className="flex justify-between">
            <span className="text-blue-400">Current Position</span>
            <span className="font-medium">
              {existingPosition.qty} {existingPosition.side}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">Unrealized P&L</span>
            <span className={existingPosition.unrealizedPl >= 0 ? 'text-green-400' : 'text-red-400'}>
              {formatCurrency(existingPosition.unrealizedPl)}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {orderSubmitError && (
        <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
          {orderSubmitError}
        </div>
      )}

      {/* Submit */}
      <Button
        variant={side === 'buy' ? 'buy' : 'sell'}
        onClick={handleSubmitClick}
        disabled={isSubmittingOrder || !symbol || !quantity || parseFloat(quantity) <= 0}
        className="w-full mt-auto"
      >
        {isSubmittingOrder ? 'Submitting...' : `Review ${side.toUpperCase()} Order`}
      </Button>

      {/* Confirmation Modal */}
      <OrderConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmOrder}
        orderPreview={orderPreview}
        account={account}
        isSubmitting={isSubmittingOrder}
      />
    </div>
  );
}

// ===========================================
// Options Panel
// ===========================================
interface OptionsContract {
  id: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  expiration_date: string;
  root_symbol: string;
  underlying_symbol: string;
  type: 'call' | 'put';
  strike_price: string;
  close_price: string | null;
}

interface GroupedOptions {
  expiration: string;
  calls: OptionsContract[];
  puts: OptionsContract[];
  strikes: number[];
}

function OptionsPanel({ ticker }: { ticker: string }) {
  const [symbol, setSymbol] = useState(ticker || 'AAPL');
  const [inputSymbol, setInputSymbol] = useState(symbol);
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<OptionsContract | null>(null);
  const [orderType, setOrderType] = useState<OptionsOrderType>('buy_to_open');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR(
    `/api/alpaca/options?symbol=${symbol}&type=chain`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const contracts: OptionsContract[] = data?.contracts || [];

  const groupedOptions = useMemo<GroupedOptions[]>(() => {
    const groups = new Map<string, GroupedOptions>();

    contracts.forEach((contract) => {
      const exp = contract.expiration_date;
      if (!groups.has(exp)) {
        groups.set(exp, { expiration: exp, calls: [], puts: [], strikes: [] });
      }

      const group = groups.get(exp)!;
      const strike = parseFloat(contract.strike_price);

      if (contract.type === 'call') {
        group.calls.push(contract);
      } else {
        group.puts.push(contract);
      }

      if (!group.strikes.includes(strike)) {
        group.strikes.push(strike);
      }
    });

    return Array.from(groups.values())
      .sort((a, b) => a.expiration.localeCompare(b.expiration))
      .map((g) => ({
        ...g,
        strikes: g.strikes.sort((a, b) => a - b),
      }));
  }, [contracts]);

  useEffect(() => {
    if (groupedOptions.length > 0 && !selectedExpiration) {
      setSelectedExpiration(groupedOptions[0]!.expiration);
    }
  }, [groupedOptions, selectedExpiration]);

  const selectedGroup = groupedOptions.find((g) => g.expiration === selectedExpiration);

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSymbol = inputSymbol.toUpperCase().trim();
    if (newSymbol && newSymbol !== symbol) {
      setSymbol(newSymbol);
      setSelectedExpiration(null);
      setSelectedContract(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedContract) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const [side, intent] = orderType.includes('buy') ? ['buy', orderType] : ['sell', orderType];

      const response = await fetch('/api/alpaca/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedContract.symbol,
          qty: quantity,
          side,
          type: 'market',
          time_in_force: 'day',
          position_intent: intent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to place order');
      }

      setSelectedContract(null);
      setQuantity(1);
      alert('Order placed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatExpiration = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const formatStrike = (strike: string | number) => {
    const num = typeof strike === 'string' ? parseFloat(strike) : strike;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <form onSubmit={handleSymbolSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
            className="w-20 h-7 text-sm font-bold"
            placeholder="Symbol"
          />
          <span className="text-xs text-muted-foreground">Options Chain</span>
        </form>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => mutate()}
          className="h-7 w-7"
          title="Refresh"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Loading */}
      {isLoading && contracts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* No data */}
      {!isLoading && contracts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">No options available for {symbol}</p>
        </div>
      )}

      {/* Options Chain */}
      {contracts.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Expiration selector */}
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <Select
                value={selectedExpiration || undefined}
                onValueChange={(value) => setSelectedExpiration(value)}
              >
                <SelectTrigger className="flex-1 h-7 text-xs">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {groupedOptions.map((group) => (
                    <SelectItem key={group.expiration} value={group.expiration}>
                      {formatExpiration(group.expiration)} ({group.strikes.length} strikes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chain table */}
          {selectedGroup && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Fixed header */}
              <div className="flex-shrink-0 border-b border-border bg-card">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1.5 text-left text-green-500 font-medium w-1/3">Calls</th>
                      <th className="px-2 py-1.5 text-center font-medium w-1/3">Strike</th>
                      <th className="px-2 py-1.5 text-right text-red-500 font-medium w-1/3">Puts</th>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* Scrollable body */}
              <ScrollArea className="flex-1">
              <table className="w-full text-xs">
                <tbody>
                  {selectedGroup.strikes.map((strike) => {
                    const call = selectedGroup.calls.find(
                      (c) => parseFloat(c.strike_price) === strike
                    );
                    const put = selectedGroup.puts.find(
                      (p) => parseFloat(p.strike_price) === strike
                    );

                    return (
                      <tr key={strike} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-2 py-1.5">
                          {call && (
                            <button
                              onClick={() => setSelectedContract(call)}
                              className={cn(
                                'w-full text-left px-2 py-1 rounded transition-all',
                                selectedContract?.id === call.id
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'hover:bg-green-500/10'
                              )}
                            >
                              <span className="font-mono">
                                {call.close_price ? `$${parseFloat(call.close_price).toFixed(2)}` : '-'}
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono font-semibold">
                          {formatStrike(strike)}
                        </td>
                        <td className="px-2 py-1.5">
                          {put && (
                            <button
                              onClick={() => setSelectedContract(put)}
                              className={cn(
                                'w-full text-right px-2 py-1 rounded transition-all',
                                selectedContract?.id === put.id
                                  ? 'bg-red-500/20 text-red-500'
                                  : 'hover:bg-red-500/10'
                              )}
                            >
                              <span className="font-mono">
                                {put.close_price ? `$${parseFloat(put.close_price).toFixed(2)}` : '-'}
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </ScrollArea>
            </div>
          )}

          {/* Order panel */}
          {selectedContract && (
            <div className="p-3 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded',
                      selectedContract.type === 'call'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    )}
                  >
                    {selectedContract.type.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono">{formatStrike(selectedContract.strike_price)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatExpiration(selectedContract.expiration_date)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContract(null)} className="h-6 text-xs">
                  Cancel
                </Button>
              </div>

              {error && (
                <div className="mb-2 p-2 text-xs text-red-500 bg-red-500/10 rounded">{error}</div>
              )}

              <div className="flex items-center gap-2">
                <Select value={orderType} onValueChange={(value) => setOrderType(value as OptionsOrderType)}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy_to_open">Buy to Open</SelectItem>
                    <SelectItem value="sell_to_open">Sell to Open</SelectItem>
                    <SelectItem value="buy_to_close">Buy to Close</SelectItem>
                    <SelectItem value="sell_to_close">Sell to Close</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-xs"
                />
                <Button
                  variant={orderType.includes('buy') ? 'buy' : 'sell'}
                  size="sm"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================
// Orders Panel (Open Orders)
// ===========================================
function OrdersPanel() {
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { orders, isLoadingOrders, ordersError, fetchOrders, cancelOrder, cancelAllOrders } = useTradingStore();

  useEffect(() => {
    fetchOrders('open');
    const interval = setInterval(() => fetchOrders('open'), REFRESH_INTERVALS.ORDERS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    setIsCancelling(true);
    await cancelOrder(cancelOrderId);
    setCancelOrderId(null);
    setIsCancelling(false);
  };

  const handleCancelAllOrders = async () => {
    setIsCancelling(true);
    await cancelAllOrders();
    setShowCancelAllDialog(false);
    setIsCancelling(false);
  };

  const orderToCancel = orders.find((o) => o.id === cancelOrderId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800/50">
        <span className="text-xs font-medium text-muted-foreground">Open Orders ({orders.length})</span>
        {orders.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowCancelAllDialog(true)}
            className="h-6 px-2 text-[10px]"
          >
            Cancel All
          </Button>
        )}
      </div>

      {/* Orders list */}
      <ScrollArea className="flex-1">
        {isLoadingOrders && orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading orders...
          </div>
        ) : ordersError ? (
          <div className="flex items-center justify-center h-full text-destructive text-sm">
            {ordersError}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No open orders
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Symbol</TableHead>
                <TableHead className="text-left">Side</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Type</TableHead>
                <TableHead className="text-right">Time</TableHead>
                <TableHead className="text-right w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-zinc-100">{order.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' ? 'bullish' : 'bearish'}>
                      {order.side.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-100">
                    {order.filledQty > 0 ? `${order.filledQty}/${order.qty}` : order.qty}
                  </TableCell>
                  <TableCell className="text-right text-zinc-400 uppercase">
                    {order.type}
                    {order.limitPrice && <span className="text-zinc-100 ml-1">@${order.limitPrice.toFixed(2)}</span>}
                  </TableCell>
                  <TableCell className="text-right text-zinc-400">{formatTime(order.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCancelOrderId(order.id)}
                      className="h-6 px-2 text-[10px]"
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>

      {/* Cancel Single Order Dialog */}
      <AlertDialog open={!!cancelOrderId} onOpenChange={(open) => !open && setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the {orderToCancel?.side.toUpperCase()} order for{' '}
              {orderToCancel?.qty} {orderToCancel?.symbol}
              {orderToCancel?.limitPrice ? ` @ $${orderToCancel.limitPrice.toFixed(2)}` : ''}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel All Dialog */}
      <AlertDialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel All Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel all {orders.length} open order{orders.length !== 1 ? 's' : ''}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Orders</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAllOrders}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel All Orders'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===========================================
// History Panel (Order History)
// ===========================================
function HistoryPanel() {
  const { orderHistory, isLoadingOrders, ordersError, fetchOrders } = useTradingStore();

  useEffect(() => {
    fetchOrders('all');
    const interval = setInterval(() => fetchOrders('all'), REFRESH_INTERVALS.ORDERS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800/50">
        <span className="text-xs font-medium text-muted-foreground">Order History</span>
      </div>

      {/* Orders list */}
      <ScrollArea className="flex-1">
        {isLoadingOrders && orderHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading history...
          </div>
        ) : ordersError ? (
          <div className="flex items-center justify-center h-full text-destructive text-sm">
            {ordersError}
          </div>
        ) : orderHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No order history
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Symbol</TableHead>
                <TableHead className="text-left">Side</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderHistory.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-zinc-100">{order.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' ? 'bullish' : 'bearish'}>
                      {order.side.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-100">
                    {order.filledQty > 0 ? `${order.filledQty}/${order.qty}` : order.qty}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        order.status === 'filled'
                          ? 'filled'
                          : order.status === 'partially_filled'
                            ? 'pending'
                            : order.status === 'canceled' || order.status === 'rejected'
                              ? 'bearish'
                              : 'neutral'
                      }
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-400">{formatTime(order.submittedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}

// ===========================================
// Main TradeTile Component
// ===========================================
export function TradeTile({ tile }: TradeTileProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('trade');
  const ticker = (tile.props?.ticker as string) || 'AAPL';

  const accountMode = useTradingStore((s) => s.accountMode);
  const setAccountMode = useTradingStore((s) => s.setAccountMode);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Account mode toggle */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Mode:</span>
          <div className="flex items-center rounded-md bg-muted/50 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAccountMode('paper')}
              className={cn(
                'h-6 px-2 text-[10px] rounded-sm',
                accountMode === 'paper'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              PAPER
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAccountMode('real')}
              className={cn(
                'h-6 px-2 text-[10px] rounded-sm',
                accountMode === 'real'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              LIVE
            </Button>
          </div>
        </div>
        <Badge
          variant={accountMode === 'paper' ? 'default' : 'destructive'}
          className={cn(
            'text-[9px] h-5',
            accountMode === 'paper' ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' : 'bg-green-600/20 text-green-400 border-green-600/30'
          )}
        >
          {accountMode === 'paper' ? 'Alpaca Paper' : 'Wealthsimple'}
        </Badge>
      </div>

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)} className="h-full flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-muted/30 h-8 p-0">
          <TabsTrigger value="trade" className="flex-1 h-full rounded-none text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Trade
          </TabsTrigger>
          <TabsTrigger value="options" className="flex-1 h-full rounded-none text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Options
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 h-full rounded-none text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 h-full rounded-none text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="flex-1 mt-0 overflow-hidden">
          <TradePanel ticker={ticker} />
        </TabsContent>

        <TabsContent value="options" className="flex-1 mt-0 overflow-hidden">
          <OptionsPanel ticker={ticker} />
        </TabsContent>

        <TabsContent value="orders" className="flex-1 mt-0 overflow-hidden">
          <OrdersPanel />
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0 overflow-hidden">
          <HistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
