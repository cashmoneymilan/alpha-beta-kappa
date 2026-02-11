'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Briefcase,
  TestTube,
  Building2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { API_ROUTES } from '@/config/constants';
import type { Position, Account } from '@/types/trading';

interface RealHolding extends Position {
  accountId: string;
  accountName: string;
  brokerage: string;
}

interface RealHoldingsResponse {
  holdings: RealHolding[];
  totalValue: number;
  currency: string;
  balances: Record<string, { cash: number; buyingPower: number | null; currency: string }>;
  accountCount: number;
}

interface AlpacaPositionsResponse {
  positions: Position[];
}

interface AlpacaAccountResponse {
  account: Account;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function UnifiedPortfolio() {
  const [activeTab, setActiveTab] = useState<'all' | 'paper' | 'real'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real portfolio from SnapTrade
  const {
    data: realData,
    error: realError,
    isLoading: realLoading,
    mutate: mutateReal,
  } = useSWR<RealHoldingsResponse>('/api/snaptrade/holdings', fetcher, {
    refreshInterval: 30000,
  });

  // Fetch paper portfolio from Alpaca
  const {
    data: paperPositions,
    error: paperError,
    isLoading: paperLoading,
    mutate: mutatePaper,
  } = useSWR<AlpacaPositionsResponse>(API_ROUTES.POSITIONS, fetcher, {
    refreshInterval: 30000,
  });

  // Fetch Alpaca account
  const { data: alpacaAccount, isLoading: accountLoading } = useSWR<AlpacaAccountResponse>(
    API_ROUTES.ACCOUNT,
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = realLoading || paperLoading || accountLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([mutateReal(), mutatePaper()]);
    setIsRefreshing(false);
  };

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

  // Calculate totals
  const realTotalValue = realData?.totalValue || 0;
  const paperTotalValue = alpacaAccount?.account?.portfolioValue || 0;
  const totalPortfolioValue = realTotalValue + paperTotalValue;

  const realUnrealizedPl = realData?.holdings.reduce((sum, h) => sum + h.unrealizedPl, 0) || 0;
  const paperUnrealizedPl =
    paperPositions?.positions?.reduce((sum, p) => sum + p.unrealizedPl, 0) || 0;
  const totalUnrealizedPl = realUnrealizedPl + paperUnrealizedPl;

  const hasRealHoldings = (realData?.holdings?.length || 0) > 0;
  const hasPaperHoldings = (paperPositions?.positions?.length || 0) > 0;

  // Combine all positions
  const allPositions = [
    ...(realData?.holdings || []).map((h) => ({
      ...h,
      source: 'real' as const,
    })),
    ...(paperPositions?.positions || []).map((p) => ({
      ...p,
      source: 'paper' as const,
      accountId: 'alpaca-paper',
      accountName: 'Alpaca Paper',
      brokerage: 'Alpaca',
    })),
  ];

  const filteredPositions =
    activeTab === 'all'
      ? allPositions
      : allPositions.filter((p) => p.source === activeTab);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm">Total Portfolio</span>
          </div>
          <div className="text-2xl font-bold font-mono">
            {formatCurrency(totalPortfolioValue)}
          </div>
          <div
            className={cn(
              'text-sm flex items-center gap-1 mt-1',
              totalUnrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            {totalUnrealizedPl >= 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {formatCurrency(Math.abs(totalUnrealizedPl))} ({formatPercent(
              (totalUnrealizedPl / (totalPortfolioValue - totalUnrealizedPl)) * 100 || 0
            )})
          </div>
        </Card>

        {/* Real Portfolio */}
        <Card className={cn('p-4', !hasRealHoldings && 'opacity-60')}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">Real Money</span>
            <Badge variant="bullish" className="ml-auto text-[10px]">LIVE</Badge>
          </div>
          <div className="text-xl font-bold font-mono">
            {formatCurrency(realTotalValue)}
          </div>
          {hasRealHoldings ? (
            <div
              className={cn(
                'text-xs mt-1',
                realUnrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {realUnrealizedPl >= 0 ? '+' : ''}
              {formatCurrency(realUnrealizedPl)}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">No accounts connected</div>
          )}
        </Card>

        {/* Paper Portfolio */}
        <Card className={cn('p-4', !hasPaperHoldings && 'opacity-60')}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TestTube className="h-4 w-4" />
            <span className="text-sm">Paper Trading</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">PAPER</Badge>
          </div>
          <div className="text-xl font-bold font-mono">
            {formatCurrency(paperTotalValue)}
          </div>
          {hasPaperHoldings ? (
            <div
              className={cn(
                'text-xs mt-1',
                paperUnrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {paperUnrealizedPl >= 0 ? '+' : ''}
              {formatCurrency(paperUnrealizedPl)}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">No positions</div>
          )}
        </Card>

        {/* Cash Available */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Cash Available</span>
          </div>
          <div className="text-xl font-bold font-mono">
            {formatCurrency(
              (alpacaAccount?.account?.cash || 0) +
                Object.values(realData?.balances || {}).reduce((sum, b) => sum + b.cash, 0)
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Paper: {formatCurrency(alpacaAccount?.account?.cash || 0)} | Real:{' '}
            {formatCurrency(
              Object.values(realData?.balances || {}).reduce((sum, b) => sum + b.cash, 0)
            )}
          </div>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all" className="text-xs">
                All Positions ({allPositions.length})
              </TabsTrigger>
              <TabsTrigger value="real" className="text-xs">
                Real ({realData?.holdings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="paper" className="text-xs">
                Paper ({paperPositions?.positions?.length || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>

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

        {filteredPositions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No positions found</p>
            {activeTab === 'real' && !hasRealHoldings && (
              <p className="text-sm mt-1">Connect a brokerage in Settings to see real holdings</p>
            )}
          </div>
        ) : (
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
              {filteredPositions.map((position, idx) => (
                <TableRow key={`${position.accountId}-${position.symbol}-${idx}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{position.symbol}</div>
                      <Badge
                        variant={position.source === 'real' ? 'filled' : 'secondary'}
                        className="text-[9px] px-1"
                      >
                        {position.source === 'real' ? 'LIVE' : 'PAPER'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{position.accountName}</div>
                    <div className="text-xs text-muted-foreground">{position.brokerage}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {position.qty.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(position.avgEntryPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(position.currentPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(position.marketValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        'font-mono',
                        position.unrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {position.unrealizedPl >= 0 ? '+' : ''}
                      {formatCurrency(position.unrealizedPl)}
                    </div>
                    <div
                      className={cn(
                        'text-xs',
                        position.unrealizedPl >= 0 ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {formatPercent(position.unrealizedPlPercent)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
