'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  User,
  RefreshCw,
  Loader2,
  AlertCircle,
  Target,
  Medal,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tile } from '@/stores/workspace';
import type { LeaderboardSource } from '@/app/api/leaderboard/route';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardTileProps {
  tile: Tile;
}

interface LeaderboardApiResponse {
  sources: LeaderboardSource[];
  period: string;
  hasRealData: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

type SortKey = 'alpha_score' | 'hit_rate_1d' | 'avg_return_1d' | 'total_predictions';

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'alpha_score', label: 'Alpha' },
  { key: 'hit_rate_1d', label: 'Hit Rate' },
  { key: 'avg_return_1d', label: 'Avg Return' },
  { key: 'total_predictions', label: 'Activity' },
];

export function LeaderboardTile({ tile }: LeaderboardTileProps) {
  const [sortBy, setSortBy] = React.useState<SortKey>('alpha_score');

  const { data, error, isLoading, mutate } = useSWR<LeaderboardApiResponse>(
    `/api/leaderboard?limit=15&sort=${sortBy}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const sources = data?.sources || [];
  const hasRealData = data?.hasRealData || false;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs font-medium">Source Leaderboard</span>
          {!hasRealData && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
              Pending Data
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Sort selector */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
            <SelectTrigger className="w-[90px] h-7 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => mutate()}
                  disabled={isLoading}
                  className="h-7 w-7"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh leaderboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {/* Loading state */}
        {isLoading && !data && (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/50">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
            <span className="text-sm">Failed to load leaderboard</span>
            <Button variant="ghost" size="sm" onClick={() => mutate()} className="text-primary">
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && sources.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-4">
            <Trophy className="h-8 w-8 opacity-50" />
            <span className="text-sm font-medium">No sources yet</span>
            <span className="text-xs text-center">
              Add data sources and run ingestion to see performance rankings.
            </span>
          </div>
        )}

        {/* Leaderboard list */}
        {!isLoading && !error && sources.length > 0 && (
          <div className="p-2 space-y-1">
            {sources.map((source, index) => (
              <SourceRow key={source.id} source={source} rank={index + 1} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function SourceRow({ source, rank }: { source: LeaderboardSource; rank: number }) {
  const [expanded, setExpanded] = React.useState(false);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="w-4 text-center text-xs text-muted-foreground">{rank}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400 bg-green-500/20';
    if (score >= 50) return 'text-primary bg-primary/20';
    return 'text-muted-foreground bg-muted';
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatReturn = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
      >
        {/* Rank */}
        <div className="w-5 flex items-center justify-center">
          {getMedalIcon(rank)}
        </div>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium block truncate">
            {source.handle.startsWith('@') ? source.handle : `@${source.handle}`}
          </span>
          <span className="text-[10px] text-muted-foreground">{source.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px]">
          {/* Hit rate */}
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className={source.hitRate1d >= 55 ? 'text-green-400' : 'text-muted-foreground'}>
              {formatPercent(source.hitRate1d)}
            </span>
          </div>

          {/* Avg return */}
          <div className="flex items-center gap-1">
            {source.avgReturn1d >= 0 ? (
              <ArrowUp className="h-3 w-3 text-green-400" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-400" />
            )}
            <span className={source.avgReturn1d >= 0 ? 'text-green-400' : 'text-red-400'}>
              {formatReturn(source.avgReturn1d)}
            </span>
          </div>

          {/* Alpha score */}
          <span
            className={cn(
              'font-mono font-bold px-2 py-0.5 rounded',
              getScoreColor(source.alphaScore)
            )}
          >
            {Math.round(source.alphaScore)}
          </span>
        </div>

        {/* Open Twitter */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://twitter.com/${source.handle.replace('@', '')}`,
                    '_blank'
                  );
                }}
                className="h-6 w-6 text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Twitter profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 py-2 border-t border-border bg-muted/30 text-[10px] space-y-2">
          {/* Hit rates */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hit Rates</span>
            <div className="flex items-center gap-3">
              <span>1h: {formatPercent(source.hitRate1h)}</span>
              <span>1d: {formatPercent(source.hitRate1d)}</span>
            </div>
          </div>

          {/* Prediction counts */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Predictions</span>
            <div className="flex items-center gap-3">
              <span className="text-green-400">Bull: {source.bullishCount}</span>
              <span className="text-red-400">Bear: {source.bearishCount}</span>
              <span>Total: {source.totalPredictions}</span>
            </div>
          </div>

          {/* Best/worst picks */}
          {source.bestTicker && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Best Pick</span>
              <span className="text-green-400">
                ${source.bestTicker}{' '}
                {source.bestReturn !== null && `(${formatReturn(source.bestReturn)})`}
              </span>
            </div>
          )}

          {source.worstTicker && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Worst Pick</span>
              <span className="text-red-400">
                ${source.worstTicker}{' '}
                {source.worstReturn !== null && `(${formatReturn(source.worstReturn)})`}
              </span>
            </div>
          )}

          {/* Last calculated */}
          {source.lastCalculated && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{new Date(source.lastCalculated).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
