'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Building2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Position } from '@/types/trading';

interface RealHolding extends Position {
  accountId: string;
  accountName: string;
  brokerage: string;
}

interface HoldingsResponse {
  holdings: RealHolding[];
  totalValue: number;
  currency: string;
  balances: Record<string, { cash: number; buyingPower: number | null; currency: string }>;
  accountCount: number;
  message?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

interface RealPortfolioProps {
  compact?: boolean;
}

export function RealPortfolio({ compact = false }: RealPortfolioProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<HoldingsResponse>(
    '/api/snaptrade/holdings',
    fetcher,
    { refreshInterval: 30000 }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };

  // Calculate totals
  const totalUnrealizedPl = data?.holdings.reduce((sum, h) => sum + h.unrealizedPl, 0) || 0;
  const totalCash = Object.values(data?.balances || {}).reduce((sum, b) => sum + b.cash, 0);

  // Format currency
  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percent
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load portfolio data</span>
        </div>
      </Card>
    );
  }

  if (!data?.holdings.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No Connected Brokerages</p>
          <p className="text-sm mt-1">
            Connect your brokerage account in Settings to view your real portfolio.
          </p>
        </div>
      </Card>
    );
  }

  // Compact view for sidebars/tiles
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(data.totalValue, data.currency)}
            </div>
            <div
              className={cn(
                'text-sm flex items-center gap-1',
                totalUnrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {totalUnrealizedPl >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {formatCurrency(Math.abs(totalUnrealizedPl), data.currency)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        </div>

        {/* Positions list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {data.holdings.map((holding) => (
            <div
              key={`${holding.accountId}-${holding.symbol}`}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div>
                <div className="font-medium">{holding.symbol}</div>
                <div className="text-xs text-muted-foreground">
                  {holding.qty} shares @ {formatCurrency(holding.avgEntryPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono">{formatCurrency(holding.marketValue)}</div>
                <div
                  className={cn(
                    'text-xs',
                    holding.unrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {formatPercent(holding.unrealizedPlPercent)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <PieChart className="h-4 w-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-bold font-mono">
            {formatCurrency(data.totalValue, data.currency)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.accountCount} account{data.accountCount > 1 ? 's' : ''} connected
          </div>
        </Card>

        {/* Unrealized P&L */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            {totalUnrealizedPl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Unrealized P&L</span>
          </div>
          <div
            className={cn(
              'text-2xl font-bold font-mono',
              totalUnrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            {totalUnrealizedPl >= 0 ? '+' : ''}
            {formatCurrency(totalUnrealizedPl, data.currency)}
          </div>
        </Card>

        {/* Cash Available */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Cash Available</span>
          </div>
          <div className="text-2xl font-bold font-mono">
            {formatCurrency(totalCash, data.currency)}
          </div>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Holdings</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.holdings.map((holding) => (
              <TableRow key={`${holding.accountId}-${holding.symbol}`}>
                <TableCell>
                  <div className="font-medium">{holding.symbol}</div>
                  <div className="text-xs text-muted-foreground">{holding.exchange}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{holding.accountName}</div>
                  <div className="text-xs text-muted-foreground">{holding.brokerage}</div>
                </TableCell>
                <TableCell className="text-right font-mono">{holding.qty}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(holding.avgEntryPrice)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(holding.currentPrice)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(holding.marketValue)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={cn(
                      'font-mono',
                      holding.unrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {holding.unrealizedPl >= 0 ? '+' : ''}
                    {formatCurrency(holding.unrealizedPl)}
                  </div>
                  <div
                    className={cn(
                      'text-xs',
                      holding.unrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {formatPercent(holding.unrealizedPlPercent)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Account Balances */}
      {Object.keys(data.balances).length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Cash by Account</h3>
          <div className="space-y-2">
            {Object.entries(data.balances).map(([accountId, balance]) => {
              const account = data.holdings.find((h) => h.accountId === accountId);
              return (
                <div
                  key={accountId}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {account?.accountName || 'Unknown Account'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {account?.brokerage || 'Brokerage'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">
                      {formatCurrency(balance.cash, balance.currency)}
                    </div>
                    {balance.buyingPower !== null && (
                      <div className="text-xs text-muted-foreground">
                        BP: {formatCurrency(balance.buyingPower, balance.currency)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
