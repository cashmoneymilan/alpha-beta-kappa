'use client';

import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  ChevronRight,
  RefreshCw,
  Filter,
  X,
  Building2,
  TestTube,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tile } from '@/stores/workspace';
import type { SourceCategory } from '@/lib/supabase/types';
import { useTradingStore } from '@/stores/tradingStore';
import { REFRESH_INTERVALS, API_ROUTES } from '@/config/constants';
import type { Position, Account } from '@/types/trading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface PortfolioTileProps {
  tile: Tile;
}

type ActiveTab = 'positions' | 'performance';
type PositionFilter = 'all' | 'real' | 'paper';

// Types for unified portfolio
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

const positionFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// ===========================================
// Unified Positions Panel (SnapTrade + Alpaca)
// ===========================================
function UnifiedPositionsPanel() {
  const [filter, setFilter] = useState<PositionFilter>('all');
  const [closePositionSymbol, setClosePositionSymbol] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const { closePosition } = useTradingStore();

  // Fetch real portfolio from SnapTrade
  const {
    data: realData,
    error: realError,
    isLoading: realLoading,
    mutate: mutateReal,
  } = useSWR<RealHoldingsResponse>('/api/snaptrade/holdings', positionFetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  });

  // Fetch paper portfolio from Alpaca
  const {
    data: paperData,
    error: paperError,
    isLoading: paperLoading,
    mutate: mutatePaper,
  } = useSWR<AlpacaPositionsResponse>(API_ROUTES.POSITIONS, positionFetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  });

  // Fetch Alpaca account for portfolio value
  const { data: alpacaAccount } = useSWR<AlpacaAccountResponse>(
    API_ROUTES.ACCOUNT,
    positionFetcher,
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  const isLoading = realLoading || paperLoading;

  // Combine positions from both sources
  const allPositions = useMemo(() => {
    const realPositions = (realData?.holdings || []).map((h) => ({
      ...h,
      source: 'real' as const,
    }));
    const paperPositions = (paperData?.positions || []).map((p) => ({
      ...p,
      source: 'paper' as const,
      accountId: 'alpaca-paper',
      accountName: 'Alpaca Paper',
      brokerage: 'Alpaca',
    }));
    return [...realPositions, ...paperPositions];
  }, [realData, paperData]);

  const filteredPositions = useMemo(() => {
    if (filter === 'all') return allPositions;
    return allPositions.filter((p) => p.source === filter);
  }, [allPositions, filter]);

  // Calculate totals
  const realTotalValue = realData?.totalValue || 0;
  const paperTotalValue = alpacaAccount?.account?.portfolioValue || 0;
  const totalPortfolioValue = realTotalValue + paperTotalValue;

  const realUnrealizedPl = realData?.holdings?.reduce((sum, h) => sum + h.unrealizedPl, 0) || 0;
  const paperUnrealizedPl = paperData?.positions?.reduce((sum, p) => sum + p.unrealizedPl, 0) || 0;
  const totalUnrealizedPl = realUnrealizedPl + paperUnrealizedPl;

  const realCount = realData?.holdings?.length || 0;
  const paperCount = paperData?.positions?.length || 0;

  // Calculate total cash available
  const realCash = Object.values(realData?.balances || {}).reduce((sum, b) => sum + b.cash, 0);
  const paperCash = alpacaAccount?.account?.cash || 0;
  const totalCash = realCash + paperCash;

  const handleClosePosition = async () => {
    if (!closePositionSymbol) return;
    setIsClosing(true);
    await closePosition(closePositionSymbol);
    setClosePositionSymbol(null);
    setIsClosing(false);
    mutatePaper();
  };

  const positionToClose = allPositions.find((p) => p.symbol === closePositionSymbol && p.source === 'paper');

  const handleRefresh = () => {
    mutateReal();
    mutatePaper();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with totals */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="text-xs">
          <span className="text-muted-foreground">Value: </span>
          <span className="text-foreground font-medium">
            ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Cash: </span>
          <span className="text-foreground font-medium">
            ${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">P&L: </span>
          <span className={cn('font-medium', totalUnrealizedPl >= 0 ? 'text-green-400' : 'text-red-400')}>
            {totalUnrealizedPl >= 0 ? '+' : ''}${totalUnrealizedPl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-6 w-6">
          <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/20">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className={cn('h-6 px-2 text-[10px]', filter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          All ({allPositions.length})
        </Button>
        <Button
          variant={filter === 'real' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('real')}
          className={cn('h-6 px-2 text-[10px] gap-1', filter === 'real' ? 'bg-green-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <Building2 className="h-3 w-3" />
          Real ({realCount})
        </Button>
        <Button
          variant={filter === 'paper' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('paper')}
          className={cn('h-6 px-2 text-[10px] gap-1', filter === 'paper' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <TestTube className="h-3 w-3" />
          Paper ({paperCount})
        </Button>
      </div>

      {/* Positions list */}
      <ScrollArea className="flex-1">
        {isLoading && allPositions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading positions...
          </div>
        ) : (realError && paperError) ? (
          <div className="flex items-center justify-center h-32 text-destructive text-sm">
            Failed to load positions
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
            <p>No {filter === 'all' ? '' : filter} positions</p>
            {filter === 'real' && realCount === 0 && (
              <p className="text-[10px] mt-1">Connect a broker in Settings</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Symbol</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.map((position, idx) => (
                <TableRow key={`${position.source}-${position.symbol}-${idx}`}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-zinc-100">{position.symbol}</span>
                      <Badge
                        variant={position.source === 'real' ? 'filled' : 'secondary'}
                        className="text-[9px] px-1 py-0"
                      >
                        {position.source === 'real' ? 'LIVE' : 'PAPER'}
                      </Badge>
                    </div>
                    {position.source === 'real' && (
                      <div className="text-[9px] text-muted-foreground">{position.brokerage}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-zinc-100">{position.qty}</TableCell>
                  <TableCell className="text-right text-zinc-400">
                    ${position.avgEntryPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-zinc-100">
                    ${position.currentPrice.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      position.unrealizedPl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {position.unrealizedPl >= 0 ? '+' : ''}${position.unrealizedPl.toFixed(2)}
                    <span className="text-[10px] ml-1">
                      ({position.unrealizedPlPercent >= 0 ? '+' : ''}
                      {(position.unrealizedPlPercent * 100).toFixed(1)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {position.source === 'paper' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setClosePositionSymbol(position.symbol)}
                        className="h-6 px-2 text-[10px]"
                      >
                        Close
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>

      {/* Close Position Confirmation (paper only) */}
      <AlertDialog open={!!closePositionSymbol} onOpenChange={(open) => !open && setClosePositionSymbol(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Position</AlertDialogTitle>
            <AlertDialogDescription>
              {positionToClose && (
                <>
                  Are you sure you want to close your position of{' '}
                  {positionToClose.qty} {positionToClose.symbol}?
                  <br />
                  <span
                    className={cn(
                      'font-medium',
                      positionToClose.unrealizedPl >= 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    Unrealized P&L: {positionToClose.unrealizedPl >= 0 ? '+' : ''}$
                    {positionToClose.unrealizedPl.toFixed(2)} (
                    {(positionToClose.unrealizedPlPercent * 100).toFixed(1)}%)
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Keep Position</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClosePosition}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClosing ? 'Closing...' : 'Close Position'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===========================================
// Performance Panel
// ===========================================
interface SourcePerformanceData {
  source_id: string;
  total_signals: number;
  signals_with_tickers: number;
  hit_rate_1h: number | null;
  hit_rate_4h: number | null;
  hit_rate_1d: number | null;
  hit_rate_1w: number | null;
  avg_return_1h: number | null;
  avg_return_4h: number | null;
  avg_return_1d: number | null;
  avg_return_1w: number | null;
  best_ticker: string | null;
  best_ticker_avg_return: number | null;
  alpha_score: number | null;
  last_calculated_at: string | null;
}

interface SourceWithPerformance {
  id: string;
  handle: string;
  name: string;
  type: 'twitter' | 'rss' | 'news';
  category: SourceCategory;
  weight: number;
  enabled: boolean;
  performance: SourcePerformanceData | null;
}

interface ApiResponse {
  sources: SourceWithPerformance[];
}

type TimeInterval = '1h' | '4h' | '1d' | '1w';
type SortField = 'alpha_score' | 'hit_rate' | 'avg_return' | 'signals';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_LABELS: Record<SourceCategory, string> = {
  flow: 'Flow',
  research: 'Research',
  breaking: 'Breaking',
  sector: 'Sector',
  macro: 'Macro',
  filings: 'Filings',
  quant: 'Quant',
  contrarian: 'Contrarian',
  general: 'General',
};

const CATEGORY_COLORS: Record<SourceCategory, string> = {
  flow: 'bg-purple-500/20 text-purple-400',
  research: 'bg-blue-500/20 text-blue-400',
  breaking: 'bg-red-500/20 text-red-400',
  sector: 'bg-green-500/20 text-green-400',
  macro: 'bg-yellow-500/20 text-yellow-400',
  filings: 'bg-cyan-500/20 text-cyan-400',
  quant: 'bg-indigo-500/20 text-indigo-400',
  contrarian: 'bg-orange-500/20 text-orange-400',
  general: 'bg-gray-500/20 text-gray-400',
};

function AlphaScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">--</span>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-green-400 bg-green-500/20';
    if (s >= 50) return 'text-yellow-400 bg-yellow-500/20';
    if (s >= 30) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <span className={cn('text-xs font-mono font-bold px-2 py-0.5 rounded', getScoreColor(score))}>
      {score.toFixed(0)}
    </span>
  );
}

function HitRateDisplay({ rate, label }: { rate: number | null; label: string }) {
  if (rate === null) {
    return (
      <div className="text-center">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">--</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          'text-xs font-mono font-medium',
          rate >= 60 ? 'text-green-400' : rate >= 50 ? 'text-foreground' : 'text-red-400'
        )}
      >
        {rate.toFixed(0)}%
      </div>
    </div>
  );
}

function ReturnDisplay({ ret, label }: { ret: number | null; label: string }) {
  if (ret === null) {
    return (
      <div className="text-center">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">--</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          'text-xs font-mono font-medium',
          ret > 0 ? 'text-green-400' : ret < 0 ? 'text-red-400' : 'text-foreground'
        )}
      >
        {ret > 0 ? '+' : ''}
        {ret.toFixed(2)}%
      </div>
    </div>
  );
}

function SourceDetailPanel({
  source,
  interval,
  onClose,
}: {
  source: SourceWithPerformance;
  interval: TimeInterval;
  onClose: () => void;
}) {
  const perf = source.performance;

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{source.name}</span>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-medium',
              CATEGORY_COLORS[source.category || 'general']
            )}
          >
            {CATEGORY_LABELS[source.category || 'general']}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Alpha Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <div className="text-xs text-muted-foreground">Alpha Score</div>
            <div className="text-2xl font-bold font-mono">{perf?.alpha_score?.toFixed(1) || '--'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Signals</div>
            <div className="text-lg font-mono">{perf?.total_signals || 0}</div>
          </div>
        </div>

        {/* Hit Rates */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Hit Rates
          </div>
          <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/20">
            <HitRateDisplay rate={perf?.hit_rate_1h ?? null} label="1H" />
            <HitRateDisplay rate={perf?.hit_rate_4h ?? null} label="4H" />
            <HitRateDisplay rate={perf?.hit_rate_1d ?? null} label="1D" />
            <HitRateDisplay rate={perf?.hit_rate_1w ?? null} label="1W" />
          </div>
        </div>

        {/* Average Returns */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Avg Returns
          </div>
          <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/20">
            <ReturnDisplay ret={perf?.avg_return_1h ?? null} label="1H" />
            <ReturnDisplay ret={perf?.avg_return_4h ?? null} label="4H" />
            <ReturnDisplay ret={perf?.avg_return_1d ?? null} label="1D" />
            <ReturnDisplay ret={perf?.avg_return_1w ?? null} label="1W" />
          </div>
        </div>

        {/* Best Ticker */}
        {perf?.best_ticker && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-xs text-green-400 mb-1">Best Performing Ticker</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-400">{perf.best_ticker}</span>
              <span className="text-sm font-mono text-green-400">
                +{perf.best_ticker_avg_return?.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last calculated:{' '}
          {perf?.last_calculated_at ? new Date(perf.last_calculated_at).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  );
}

function PerformancePanel() {
  const [selectedCategory, setSelectedCategory] = useState<SourceCategory | 'all'>('all');
  const [interval, setInterval] = useState<TimeInterval>('1d');
  const [sortBy, setSortBy] = useState<SortField>('alpha_score');
  const [selectedSource, setSelectedSource] = useState<SourceWithPerformance | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    '/api/sources/performance',
    fetcher,
    { refreshInterval: 60000 }
  );

  const sortedSources = useMemo(() => {
    if (!data?.sources) return [];

    let filtered = data.sources;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
      const aPerf = a.performance;
      const bPerf = b.performance;

      if (!aPerf && !bPerf) return 0;
      if (!aPerf) return 1;
      if (!bPerf) return -1;

      switch (sortBy) {
        case 'alpha_score':
          return (bPerf.alpha_score ?? 0) - (aPerf.alpha_score ?? 0);
        case 'hit_rate':
          const aHit = aPerf[`hit_rate_${interval}`] ?? 0;
          const bHit = bPerf[`hit_rate_${interval}`] ?? 0;
          return bHit - aHit;
        case 'avg_return':
          const aRet = aPerf[`avg_return_${interval}`] ?? 0;
          const bRet = bPerf[`avg_return_${interval}`] ?? 0;
          return bRet - aRet;
        case 'signals':
          return (bPerf.total_signals ?? 0) - (aPerf.total_signals ?? 0);
        default:
          return 0;
      }
    });
  }, [data, selectedCategory, sortBy, interval]);

  const categories = useMemo(() => {
    if (!data?.sources) return [];
    const cats = new Set(data.sources.map((s) => s.category).filter(Boolean));
    return Array.from(cats) as SourceCategory[];
  }, [data]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Alpha Performance</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn('h-7 w-7', showFilters && 'bg-primary/20 text-primary')}
            title="Filters"
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
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
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-3 py-2 border-b border-border bg-muted/20 space-y-2">
          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'h-6 px-2 text-[10px]',
                selectedCategory === 'all' && 'bg-primary/20 text-primary hover:bg-primary/30'
              )}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={cn('h-6 px-2 text-[10px]', selectedCategory === cat && CATEGORY_COLORS[cat])}
              >
                {CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>

          {/* Sort and interval */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
                <SelectTrigger className="w-[100px] h-6 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha_score">Alpha Score</SelectItem>
                  <SelectItem value="hit_rate">Hit Rate</SelectItem>
                  <SelectItem value="avg_return">Avg Return</SelectItem>
                  <SelectItem value="signals">Signals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Interval:</span>
              <Select value={interval} onValueChange={(value) => setInterval(value as TimeInterval)}>
                <SelectTrigger className="w-[60px] h-6 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1H</SelectItem>
                  <SelectItem value="4h">4H</SelectItem>
                  <SelectItem value="1d">1D</SelectItem>
                  <SelectItem value="1w">1W</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Source List */}
      <div className="flex-1 overflow-auto">
        {isLoading && !data ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400 text-sm">
            Failed to load performance data
          </div>
        ) : sortedSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
            <p>No performance data yet</p>
            <p className="text-[10px]">Run ingestion to start tracking</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedSources.map((source, index) => {
              const perf = source.performance;
              const hitRate = perf?.[`hit_rate_${interval}`];
              const avgReturn = perf?.[`avg_return_${interval}`];

              return (
                <div
                  key={source.id}
                  onClick={() => setSelectedSource(source)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
                    'hover:bg-muted/40',
                    index === 0 && perf?.alpha_score && perf.alpha_score >= 60
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-muted/20'
                  )}
                >
                  {/* Rank */}
                  <span
                    className={cn(
                      'w-5 text-xs font-mono text-center',
                      index < 3 ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </span>

                  {/* Source info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{source.name}</span>
                      {source.category && (
                        <span
                          className={cn(
                            'text-[9px] px-1 py-0.5 rounded',
                            CATEGORY_COLORS[source.category]
                          )}
                        >
                          {CATEGORY_LABELS[source.category]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{perf?.total_signals || 0} signals</span>
                      {hitRate !== null && hitRate !== undefined && (
                        <span
                          className={cn(
                            hitRate >= 60 ? 'text-green-400' : hitRate < 50 ? 'text-red-400' : ''
                          )}
                        >
                          {hitRate.toFixed(0)}% hit
                        </span>
                      )}
                      {avgReturn !== null && avgReturn !== undefined && (
                        <span
                          className={cn(
                            avgReturn > 0 ? 'text-green-400' : avgReturn < 0 ? 'text-red-400' : ''
                          )}
                        >
                          {avgReturn > 0 ? '+' : ''}
                          {avgReturn.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Alpha Score */}
                  <AlphaScoreBadge score={perf?.alpha_score ?? null} />

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedSource && (
        <SourceDetailPanel
          source={selectedSource}
          interval={interval}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}

// ===========================================
// Main PortfolioTile Component
// ===========================================
export function PortfolioTile({ tile }: PortfolioTileProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('positions');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)} className="h-full flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-muted/30 h-8 p-0">
          <TabsTrigger value="positions" className="flex-1 h-full rounded-none text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Positions
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 h-full rounded-none text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="flex-1 mt-0 overflow-hidden">
          <UnifiedPositionsPanel />
        </TabsContent>

        <TabsContent value="performance" className="flex-1 mt-0 overflow-hidden">
          <PerformancePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
