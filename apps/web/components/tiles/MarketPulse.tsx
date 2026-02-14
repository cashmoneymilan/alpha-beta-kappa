'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import {
  ExternalLink,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  BarChart3,
  RefreshCw,
  Loader2,
  Bell,
  Brain,
  X,
  Sparkles,
  AlertCircle,
  Inbox,
  LayoutGrid,
  List,
  Filter,
  Trophy,
  Users,
  Target,
  Medal,
  ArrowUp,
  ArrowDown,
  User,
  Rss,
  MessageCircle,
} from 'lucide-react';
import type { Tile } from '@/stores/workspace';
import { useSettingsStore } from '@/stores/settings';
import type { TimeWindow, AssetFocus, FeedFilterMode } from '@/stores/settings';
import { usePositionSymbols } from '@/lib/hooks/usePositionSymbols';
import { cn, formatRelativeTime, isWithinTimeWindow, matchesAssetFocus } from '@/lib/utils';
import { useRealtimeFeed } from '@/lib/hooks/useRealtimeFeed';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import type { Source } from '@/lib/source-avatars';
import { getSourceDisplayName } from '@/lib/source-avatars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeedItemRating } from '@/components/ui/FeedItemRating';

interface MarketPulseProps {
  tile: Tile;
}

type ViewMode = 'treemap' | 'feed' | 'sources' | 'leaderboard';
type MomentumState = 'accelerating' | 'stable' | 'fading';
type SourceFilter = 'all' | 'social' | 'news';

// Filter options
const timeOptions: TimeWindow[] = ['1h', '6h', '24h', '7d'];
const assetOptions: AssetFocus[] = ['all', 'equities', 'macro'];

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ===========================================
// Shared Types
// ===========================================
interface FlowItem {
  id: string;
  time: Date;
  source: {
    handle: string;
    name: string;
    weight: number;
  };
  sourceType: 'twitter' | 'rss' | 'news' | 'reddit';
  tickers: string[];
  text: string;
  fullContent?: string;
  velocity: number;
  score: number;
  flags: ('new' | 'repost' | 'multi-source')[];
  url: string;
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  } | null;
}

interface TickerHeat {
  ticker: string;
  mentions: number;
  delta: number;
  velocity: number;
  topNarrative: string;
  topSource: string;
}

interface NarrativeHeat {
  id: string;
  title: string;
  momentum: MomentumState;
  tickers: string[];
  evidenceCount: number;
  lastUpdate: Date;
}

interface Cluster {
  id: string;
  title: string;
  summary: string;
  momentum: MomentumState;
  tickers: string[];
  itemIds: string[];
  itemCount: number;
}

interface HeatApiResponse {
  tickers: TickerHeat[];
  sources: Array<{
    id: string;
    handle: string;
    name: string;
    type: string;
    impactScore: number;
    recentMentions: number;
    recentItems: Array<{
      id: string;
      text: string;
      published_at: string;
      tickers: string[];
    }>;
  }>;
  meta: {
    timeWindow: string;
    tickerCount: number;
    sourceCount: number;
    totalItems: number;
  };
}

// ===========================================
// Shared Components
// ===========================================
function FilterToggle<T extends string>({
  value,
  options,
  onChange,
  labels,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val as T)}
      size="sm"
      className="bg-muted/50 p-0.5 rounded-md"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt}
          value={opt}
          className="h-6 px-2 text-[10px] font-medium data-[state=on]:bg-zinc-700 data-[state=on]:text-white data-[state=on]:shadow-sm"
        >
          {labels?.[opt] || opt}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function RelativeTime({ date }: { date: Date }) {
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    setTimeStr(formatRelativeTime(date));
    const interval = setInterval(() => {
      setTimeStr(formatRelativeTime(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return <span suppressHydrationWarning>{timeStr}</span>;
}

function MomentumBadge({ state }: { state: MomentumState }) {
  const config = {
    accelerating: {
      icon: TrendingUp,
      label: 'Accelerating',
      variant: 'bullish' as const,
    },
    stable: {
      icon: Minus,
      label: 'Stable',
      variant: 'filled' as const,
    },
    fading: {
      icon: TrendingDown,
      label: 'Fading',
      variant: 'bearish' as const,
    },
  };

  const { icon: Icon, label, variant } = config[state];

  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0">
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

function SentimentBadge({ sentiment }: { sentiment: FlowItem['sentiment'] }) {
  if (!sentiment) return null;

  const config = {
    positive: { label: 'Bull', icon: '🐂', variant: 'bullish' as const },
    negative: { label: 'Bear', icon: '🐻', variant: 'bearish' as const },
    neutral: { label: 'Neutral', icon: '➖', variant: 'neutral' as const },
  };

  const { label, icon, variant } = config[sentiment.label];
  const confidence = Math.round(sentiment.score * 100);

  return (
    <Badge variant={variant} className="text-[9px] px-1.5 py-0" title={`${label} sentiment (${confidence}% confidence)`}>
      <span className="mr-0.5">{icon}</span>
      <span className="hidden sm:inline">{confidence}%</span>
    </Badge>
  );
}

// ===========================================
// Treemap View
// ===========================================
function TreemapView({
  tickers,
  narratives,
  isLoading,
  error,
  onTickerClick,
  localFilter,
  setLocalFilter,
}: {
  tickers: TickerHeat[];
  narratives: NarrativeHeat[];
  isLoading: boolean;
  error: boolean;
  onTickerClick: (ticker: string) => void;
  localFilter: AssetFocus;
  setLocalFilter: (filter: AssetFocus) => void;
}) {
  const [activeView, setActiveView] = useState<'tickers' | 'narratives'>('tickers');

  const filterLabels: Record<AssetFocus, string> = {
    all: 'All',
    equities: 'Stocks',
    macro: 'Macro',
    metals: 'Metals',
  };

  // Calculate max mentions for treemap sizing
  const maxMentions = useMemo(() => {
    return Math.max(...tickers.map((t) => t.mentions), 1);
  }, [tickers]);

  // Get color based on delta
  const getColor = (delta: number) => {
    if (delta >= 100) return 'bg-green-500/40 border-green-500/60';
    if (delta >= 50) return 'bg-green-500/20 border-green-500/40';
    if (delta >= 0) return 'bg-blue-500/20 border-blue-500/40';
    if (delta >= -50) return 'bg-red-500/20 border-red-500/40';
    return 'bg-red-500/40 border-red-500/60';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* View toggle */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted">
        <div className="flex items-center gap-1">
          <Button
            variant={activeView === 'tickers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('tickers')}
            className={cn('h-7 text-xs', activeView === 'tickers' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            Tickers ({tickers.length})
          </Button>
          <Button
            variant={activeView === 'narratives' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('narratives')}
            className={cn('h-7 text-xs', activeView === 'narratives' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            Narratives ({narratives.length})
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={localFilter}
            onValueChange={(val) => val && setLocalFilter(val as AssetFocus)}
            size="sm"
            className="bg-muted/50 p-0.5 rounded-md"
          >
            {(['all', 'equities', 'macro'] as AssetFocus[]).map((opt) => (
              <ToggleGroupItem key={opt} value={opt} className="h-6 px-2 text-[10px] font-medium data-[state=on]:bg-zinc-700 data-[state=on]:text-white data-[state=on]:shadow-sm">
                {filterLabels[opt]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="grid grid-cols-4 gap-1 p-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
            <span className="text-sm">Failed to load data</span>
          </div>
        )}

        {/* Ticker Treemap */}
        {!isLoading && !error && activeView === 'tickers' && tickers.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1 p-2">
            {tickers.slice(0, 30).map((item) => {
              const sizeFactor = Math.max(0.6, item.mentions / maxMentions);
              return (
                <button
                  key={item.ticker}
                  onClick={() => onTickerClick(item.ticker)}
                  className={cn(
                    'relative p-2 rounded border transition-all hover:scale-105 cursor-pointer',
                    getColor(item.delta)
                  )}
                  style={{ minHeight: `${40 + sizeFactor * 40}px` }}
                >
                  <div className="text-xs font-bold">{item.ticker}</div>
                  <div className="text-[10px] text-muted-foreground">{item.mentions} mentions</div>
                  <div
                    className={cn(
                      'text-[10px] font-mono font-bold',
                      item.delta >= 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {item.delta > 0 ? '+' : ''}
                    {item.delta}%
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Narratives View */}
        {!isLoading && !error && activeView === 'narratives' && narratives.length > 0 && (
          <div className="p-3 space-y-2">
            {narratives.map((narrative) => (
              <div
                key={narrative.id}
                className={cn(
                  'px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
                  narrative.momentum === 'accelerating'
                    ? 'bg-green-500/10 hover:bg-green-500/20 border-l-4 border-l-green-500'
                    : narrative.momentum === 'stable'
                      ? 'bg-blue-500/10 hover:bg-blue-500/20 border-l-4 border-l-blue-500'
                      : 'bg-red-500/10 hover:bg-red-500/20 border-l-4 border-l-red-500'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{narrative.title}</span>
                      <MomentumBadge state={narrative.momentum} />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1">
                        {narrative.tickers.slice(0, 3).map((ticker) => (
                          <span
                            key={ticker}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTickerClick(ticker);
                            }}
                            className="text-[10px] px-1.5 py-0.5 bg-accent/25 text-accent rounded font-semibold cursor-pointer hover:bg-accent/40"
                          >
                            {ticker}
                          </span>
                        ))}
                        {narrative.tickers.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{narrative.tickers.length - 3}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{narrative.evidenceCount} items</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && tickers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-4">
            <TrendingUp className="h-8 w-8 opacity-50" />
            <span className="text-sm font-medium">No heat data yet</span>
            <span className="text-xs text-center">Run ingestion to populate data.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Feed View
// ===========================================
function FeedView({
  items,
  isLoading,
  error,
  timeWindow,
  setTimeWindow,
  assetFocus,
  setAssetFocus,
  feedFilterMode,
  setFeedFilterMode,
  hasPositions,
  onRefresh,
  newItemsCount,
  onLoadNewItems,
  onCluster,
  isClustering,
  clusters,
  showClusters,
  setShowClusters,
  onTriggerIngestion,
  isIngesting,
}: {
  items: FlowItem[];
  isLoading: boolean;
  error: boolean;
  timeWindow: TimeWindow;
  setTimeWindow: (tw: TimeWindow) => void;
  assetFocus: AssetFocus;
  setAssetFocus: (af: AssetFocus) => void;
  feedFilterMode: FeedFilterMode;
  setFeedFilterMode: (mode: FeedFilterMode) => void;
  hasPositions: boolean;
  onRefresh: () => void;
  newItemsCount: number;
  onLoadNewItems: () => void;
  onCluster: () => void;
  isClustering: boolean;
  clusters: Cluster[];
  showClusters: boolean;
  setShowClusters: (show: boolean) => void;
  onTriggerIngestion: () => void;
  isIngesting: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<FlowItem | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks();

  const handleItemClick = (item: FlowItem) => {
    setSelectedItem(item);
    setOverlayOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <FilterToggle value={timeWindow} options={timeOptions} onChange={setTimeWindow} />
          <FilterToggle
            value={assetFocus}
            options={assetOptions}
            onChange={setAssetFocus}
            labels={{ all: 'All', equities: 'Stocks', macro: 'Macro', metals: 'Metals' } as Record<AssetFocus, string>}
          />
          {hasPositions && (
            <Select value={feedFilterMode} onValueChange={(v) => setFeedFilterMode(v as FeedFilterMode)}>
              <SelectTrigger className="h-6 w-[90px] text-[10px] bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All News</SelectItem>
                <SelectItem value="positions-only">My Positions</SelectItem>
                <SelectItem value="positions-boosted">Boosted</SelectItem>
              </SelectContent>
            </Select>
          )}
          <span className="text-[10px] text-muted-foreground">{items.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {newItemsCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadNewItems}
              className="h-6 px-2 text-[10px] font-medium bg-primary/20 text-primary hover:bg-primary/30 animate-pulse"
            >
              <Bell className="h-3 w-3" />
              {newItemsCount}
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCluster}
                  disabled={isClustering}
                  className="h-7 w-7 text-primary hover:bg-primary/20"
                >
                  {isClustering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Cluster narratives</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Clusters Panel */}
      {showClusters && clusters.length > 0 && (
        <div className="border-b border-border bg-card/50">
          <div className="flex items-center justify-between px-3 py-2 bg-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI Narratives</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">{clusters.length}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowClusters(false)} className="h-6 w-6">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="max-h-48">
            <div className="px-2 py-2 space-y-2">
              {clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-2 rounded-lg border border-border bg-card hover:border-primary/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        cluster.momentum === 'accelerating' && 'bg-green-500',
                        cluster.momentum === 'stable' && 'bg-blue-500',
                        cluster.momentum === 'fading' && 'bg-red-500'
                      )}
                    />
                    <span className="text-sm font-medium">{cluster.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{cluster.itemCount} items</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{cluster.summary}</p>
                  {cluster.tickers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cluster.tickers.map((ticker) => (
                        <span key={ticker} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                          ${ticker}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Feed items */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1 space-y-2">
          {isLoading && items.length === 0 && (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-3 py-2.5 rounded-lg bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Failed to load feed</span>
              <Button variant="ghost" size="sm" onClick={onRefresh} className="text-primary">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-4">
              <Inbox className="h-10 w-10 opacity-50" />
              <div className="text-center">
                <span className="text-sm font-medium block">No feed items available</span>
                <span className="text-xs mt-1 block text-muted-foreground/70">
                  Data is fetched every 30 minutes from RSS sources.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onTriggerIngestion}
                disabled={isIngesting}
                className="mt-2"
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Fetch Now
                  </>
                )}
              </Button>
            </div>
          )}

          {!isLoading && !error && items.map((item) => {
            const source: Source = {
              id: item.source.handle,
              name: item.source.name,
              type: item.sourceType,
              handle: item.sourceType === 'twitter' ? item.source.handle : undefined,
              url: item.url,
            };

            const isHighScore = item.score >= 80;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'group px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
                  'bg-card/50 hover:bg-card border border-transparent',
                  'hover:border-border hover:shadow-sm',
                  isHighScore && 'border-l-2 border-l-green-500'
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <SourceAvatar source={source} size="sm" />
                  <span className="text-xs font-medium text-foreground truncate">{getSourceDisplayName(source)}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">
                    <RelativeTime date={item.time} />
                  </span>
                  {item.flags.includes('new') && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  {item.sentiment && item.sentiment.label !== 'neutral' && <SentimentBadge sentiment={item.sentiment} />}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(item.id);
                    }}
                    className={cn(
                      'ml-auto h-6 w-6 text-muted-foreground hover:text-amber-400',
                      isBookmarked(item.id) ? 'text-amber-400' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <Star className="h-3.5 w-3.5" fill={isBookmarked(item.id) ? 'currentColor' : 'none'} />
                  </Button>
                  <FeedItemRating itemId={item.id} compact className="opacity-0 group-hover:opacity-100" />
                </div>
                <p className="text-sm text-foreground leading-snug line-clamp-2">{item.text}</p>
              </div>
            );
          })}
          {/* Bottom spacer to prevent cutoff */}
          <div className="h-16" aria-hidden="true" />
        </div>
      </ScrollArea>

      {/* Item Detail Panel */}
      {overlayOpen && selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          onClose={() => setOverlayOpen(false)}
          isBookmarked={isBookmarked(selectedItem.id)}
          onToggleBookmark={() => toggleBookmark(selectedItem.id)}
        />
      )}
    </div>
  );
}

// ===========================================
// Item Detail Panel
// ===========================================
function ItemDetailPanel({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: {
  item: FlowItem;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const source: Source = {
    id: item.source.handle,
    name: item.source.name,
    type: item.sourceType,
    handle: item.sourceType === 'twitter' ? item.source.handle : undefined,
    url: item.url,
  };

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[420px] max-w-[90vw] bg-[#1a1d24] border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#22262e]">
          <div className="flex items-center gap-3">
            <SourceAvatar source={source} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.source.name}</span>
                {item.sourceType === 'twitter' && (
                  <span className="text-sm text-muted-foreground">@{item.source.handle}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <RelativeTime date={item.time} />
                <span className="capitalize text-primary">{item.sourceType}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleBookmark}
              className={cn('h-8 w-8', isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-muted-foreground')}
            >
              <Star className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {item.tickers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tickers.map((ticker) => (
                  <span
                    key={ticker}
                    className="px-2.5 py-1 text-sm font-semibold rounded-md bg-primary/15 text-primary cursor-pointer hover:bg-primary/25"
                  >
                    ${ticker}
                  </span>
                ))}
              </div>
            )}

            {item.sentiment && item.sentiment.label !== 'neutral' && (
              <div className="mb-4">
                <SentimentBadge sentiment={item.sentiment} />
              </div>
            )}

            <div className="p-3 rounded-lg bg-[#22262e] border border-border mb-4">
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {item.fullContent || item.text}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Velocity</span>
                </div>
                <span className="font-mono font-medium">{item.velocity}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Score</span>
                </div>
                <span className="font-mono font-bold text-primary">{item.score}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Source Weight</span>
                <span className="font-mono">{item.source.weight}/10</span>
              </div>
            </div>

            {/* Rating section */}
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Rate this item</div>
              <FeedItemRating itemId={item.id} />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-[#22262e]">
          <div className="flex gap-2">
            <Button
              variant={isBookmarked ? 'default' : 'default'}
              onClick={onToggleBookmark}
              className={cn('flex-1', isBookmarked && 'bg-amber-400 text-black hover:bg-amber-500')}
            >
              <Star className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Sources View Component
// ===========================================
interface SourceInfo {
  handle: string;
  name?: string;
  mentions?: number;
}

function SourcesView({ sources, isLoading }: { sources: SourceInfo[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground p-4">
        <Users className="h-8 w-8 opacity-50" />
        <span className="text-sm font-medium">No sources yet</span>
        <span className="text-xs text-center">
          Sources are extracted from feed items. Add more data to see contributors.
        </span>
      </div>
    );
  }

  // Sort by mentions
  const sortedSources = [...sources].sort((a, b) => (b.mentions || 0) - (a.mentions || 0));

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {sortedSources.map((source, idx) => (
          <div
            key={source.handle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium block truncate">
                {source.handle.startsWith('@') ? source.handle : `@${source.handle}`}
              </span>
              {source.name && (
                <span className="text-[10px] text-muted-foreground truncate block">{source.name}</span>
              )}
            </div>
            {source.mentions !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {source.mentions} mentions
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">#{idx + 1}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ===========================================
// Leaderboard View Component (integrated from LeaderboardTile)
// ===========================================
interface LeaderboardSource {
  id: string;
  handle: string;
  name: string;
  type: string;
  hitRate1h: number;
  hitRate1d: number;
  avgReturn1d: number;
  totalPredictions: number;
  bullishCount: number;
  bearishCount: number;
  alphaScore: number;
  bestTicker: string | null;
  bestReturn: number | null;
  worstTicker: string | null;
  worstReturn: number | null;
  lastCalculated: string | null;
}

interface LeaderboardApiResponse {
  sources: LeaderboardSource[];
  period: string;
  hasRealData: boolean;
}

type SortKey = 'alpha_score' | 'hit_rate_1d' | 'avg_return_1d' | 'total_predictions';

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'alpha_score', label: 'Alpha' },
  { key: 'hit_rate_1d', label: 'Hit Rate' },
  { key: 'avg_return_1d', label: 'Avg Return' },
  { key: 'total_predictions', label: 'Activity' },
];

function LeaderboardView() {
  const [sortBy, setSortBy] = React.useState<SortKey>('alpha_score');

  const { data, error, isLoading, mutate } = useSWR<LeaderboardApiResponse>(
    `/api/leaderboard?limit=15&sort=${sortBy}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const sources = data?.sources || [];
  const hasRealData = data?.hasRealData || false;

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

  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm">Failed to load leaderboard</span>
        <Button variant="ghost" size="sm" onClick={() => mutate()} className="text-primary">
          Retry
        </Button>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground p-4">
        <Trophy className="h-8 w-8 opacity-50" />
        <span className="text-sm font-medium">No sources yet</span>
        <span className="text-xs text-center">
          Add data sources and run ingestion to see performance rankings.
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {!hasRealData && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
              Pending Data
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sources.map((source, index) => (
            <div
              key={source.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <div className="w-5 flex items-center justify-center">
                {getMedalIcon(index + 1)}
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ===========================================
// Main MarketPulse Component
// ===========================================
export function MarketPulse({ tile }: MarketPulseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [localFilter, setLocalFilter] = useState<AssetFocus>('all');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isClustering, setIsClustering] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [minScore, setMinScore] = useState<number>(50);

  const timeWindow = useSettingsStore((s) => s.timeWindow);
  const setTimeWindow = useSettingsStore((s) => s.setTimeWindow);
  const assetFocus = useSettingsStore((s) => s.assetFocus);
  const setAssetFocus = useSettingsStore((s) => s.setAssetFocus);
  const userTickers = useSettingsStore((s) => s.userTickers);
  const feedFilterMode = useSettingsStore((s) => s.feedFilterMode);
  const setFeedFilterMode = useSettingsStore((s) => s.setFeedFilterMode);
  const positionBoostAmount = useSettingsStore((s) => s.positionBoostAmount);

  // Get position symbols for filtering
  const positionSymbols = usePositionSymbols();

  // Build source type query param
  const sourceTypeParam = sourceFilter === 'social'
    ? '&source_types=twitter,reddit'
    : sourceFilter === 'news'
      ? '&source_types=rss'
      : '';

  // Feed data
  const {
    data: feedData,
    error: feedError,
    isLoading: feedLoading,
    mutate: mutateFeed,
  } = useSWR(`/api/feed?limit=50&min_score=${minScore}${sourceTypeParam}`, fetcher, { refreshInterval: 30000 });

  // Heat data
  const assetParam = localFilter !== 'all' ? `&asset_class=${localFilter}` : '';
  const {
    data: heatData,
    error: heatError,
    isLoading: heatLoading,
    mutate: mutateHeat,
  } = useSWR<HeatApiResponse>(`/api/heat?hours=24${assetParam}${sourceTypeParam}`, fetcher, { refreshInterval: 60000 });

  // Realtime subscription
  const { newItemsCount, clearNewItems } = useRealtimeFeed({
    onNewItem: () => {},
  });

  const handleLoadNewItems = useCallback(() => {
    mutateFeed();
    clearNewItems();
  }, [mutateFeed, clearNewItems]);

  // Trigger manual RSS ingestion
  const handleTriggerIngestion = useCallback(async () => {
    setIsIngesting(true);
    try {
      await fetch('/api/ingest/rss', { method: 'POST' });
      await mutateFeed();
      await mutateHeat();
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setIsIngesting(false);
    }
  }, [mutateFeed, mutateHeat]);

  // Process feed items
  const feedItems = useMemo(() => {
    if (!feedData?.items?.length) return [];

    const rawItems: FlowItem[] = feedData.items.map((item: Record<string, unknown>) => ({
      ...item,
      time: new Date(item.time as string),
    }));

    // Filter by time and asset focus
    let filtered = rawItems.filter((item) => {
      if (!isWithinTimeWindow(item.time, timeWindow)) return false;
      if (!matchesAssetFocus(item.tickers, assetFocus)) return false;
      return true;
    });

    // Apply position-based filtering
    if (feedFilterMode === 'positions-only' && positionSymbols.size > 0) {
      filtered = filtered.filter((item) =>
        item.tickers.some((t) => positionSymbols.has(t.toUpperCase()))
      );
    }

    // Apply position-based score boosting
    if (feedFilterMode === 'positions-boosted' && positionSymbols.size > 0) {
      filtered = filtered.map((item) => {
        const hasPositionTicker = item.tickers.some((t) => positionSymbols.has(t.toUpperCase()));
        if (hasPositionTicker) {
          return { ...item, score: Math.min(100, item.score + positionBoostAmount) };
        }
        return item;
      });
      // Re-sort by boosted score
      filtered.sort((a, b) => b.score - a.score);
    }

    return filtered;
  }, [feedData, timeWindow, assetFocus, feedFilterMode, positionSymbols, positionBoostAmount]);

  // Process ticker heat data
  const tickerHeat = useMemo(() => {
    if (!heatData?.tickers?.length) return [];

    let filtered = heatData.tickers.filter((item) => matchesAssetFocus([item.ticker], localFilter));

    if (userTickers.length > 0) {
      const userSet = new Set(userTickers);
      const userHeat = filtered.filter((item) => userSet.has(item.ticker));
      const otherHeat = filtered.filter((item) => !userSet.has(item.ticker));
      filtered = [...userHeat, ...otherHeat];
    }

    return filtered;
  }, [heatData?.tickers, localFilter, userTickers]);

  // Derive narratives
  const narratives = useMemo<NarrativeHeat[]>(() => {
    const narrativeGroups: Record<string, { tickers: string[]; mentions: number; avgDelta: number }> = {};

    for (const ticker of tickerHeat) {
      const narrative = ticker.topNarrative;
      if (!narrativeGroups[narrative]) {
        narrativeGroups[narrative] = { tickers: [], mentions: 0, avgDelta: 0 };
      }
      narrativeGroups[narrative].tickers.push(ticker.ticker);
      narrativeGroups[narrative].mentions += ticker.mentions;
      narrativeGroups[narrative].avgDelta += ticker.delta;
    }

    return Object.entries(narrativeGroups)
      .map(([title, data], idx) => {
        const avgDelta = data.avgDelta / data.tickers.length;
        let momentum: MomentumState = 'stable';
        if (avgDelta > 50) momentum = 'accelerating';
        else if (avgDelta < 10) momentum = 'fading';

        return {
          id: String(idx),
          title,
          momentum,
          tickers: data.tickers.slice(0, 5),
          evidenceCount: data.mentions,
          lastUpdate: new Date(),
        };
      })
      .sort((a, b) => b.evidenceCount - a.evidenceCount)
      .slice(0, 10);
  }, [tickerHeat]);

  // AI clustering
  const handleCluster = async () => {
    setIsClustering(true);
    try {
      const res = await fetch('/api/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 30 }),
      });
      const result = await res.json();
      if (result.clusters) {
        setClusters(result.clusters);
        setShowClusters(true);
      }
    } catch (err) {
      console.error('Clustering failed');
    } finally {
      setIsClustering(false);
    }
  };

  const handleTickerClick = (ticker: string) => {
    // Could open a detail panel or filter feed by ticker
    console.log('Ticker clicked:', ticker);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* View mode toggle */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'treemap' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('treemap')}
            className={cn('h-7 px-2 text-xs gap-1', viewMode === 'treemap' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <LayoutGrid className="h-3 w-3" />
            Heat
          </Button>
          <Button
            variant={viewMode === 'feed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('feed')}
            className={cn('h-7 px-2 text-xs gap-1', viewMode === 'feed' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <List className="h-3 w-3" />
            Feed
          </Button>
          <Button
            variant={viewMode === 'sources' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('sources')}
            className={cn('h-7 px-2 text-xs gap-1', viewMode === 'sources' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <Users className="h-3 w-3" />
            Sources
          </Button>
          <Button
            variant={viewMode === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('leaderboard')}
            className={cn('h-7 px-2 text-xs gap-1', viewMode === 'leaderboard' ? 'bg-zinc-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <Trophy className="h-3 w-3" />
            Rank
          </Button>

          {/* Source filter divider + toggle */}
          <div className="border-l border-border h-5 mx-1" />
          <ToggleGroup
            type="single"
            value={sourceFilter}
            onValueChange={(val) => val && setSourceFilter(val as SourceFilter)}
            size="sm"
            className="bg-muted/50 p-0.5 rounded-md"
          >
            <ToggleGroupItem value="all" className="h-6 px-2 text-[10px] font-medium data-[state=on]:bg-zinc-700 data-[state=on]:text-white data-[state=on]:shadow-sm">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="social" className="h-6 px-2 text-[10px] font-medium data-[state=on]:bg-zinc-700 data-[state=on]:text-white data-[state=on]:shadow-sm">
              <MessageCircle className="h-3 w-3 mr-1" />
              Social
            </ToggleGroupItem>
            <ToggleGroupItem value="news" className="h-6 px-2 text-[10px] font-medium data-[state=on]:bg-zinc-700 data-[state=on]:text-white data-[state=on]:shadow-sm">
              <Rss className="h-3 w-3 mr-1" />
              News
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-1">
          {/* Min score selector */}
          <Select value={String(minScore)} onValueChange={(v) => setMinScore(parseInt(v))}>
            <SelectTrigger className="h-7 w-[60px] text-[10px] bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30+</SelectItem>
              <SelectItem value="40">40+</SelectItem>
              <SelectItem value="50">50+</SelectItem>
              <SelectItem value="60">60+</SelectItem>
              <SelectItem value="70">70+</SelectItem>
              <SelectItem value="80">80+</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              mutateFeed();
              mutateHeat();
            }}
            disabled={feedLoading || heatLoading}
            className="h-7 w-7"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', (feedLoading || heatLoading) && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'treemap' && (
        <TreemapView
          tickers={tickerHeat}
          narratives={narratives}
          isLoading={heatLoading}
          error={!!heatError}
          onTickerClick={handleTickerClick}
          localFilter={localFilter}
          setLocalFilter={setLocalFilter}
        />
      )}
      {viewMode === 'feed' && (
        <FeedView
          items={feedItems}
          isLoading={feedLoading}
          error={!!feedError}
          timeWindow={timeWindow}
          setTimeWindow={setTimeWindow}
          assetFocus={assetFocus}
          setAssetFocus={setAssetFocus}
          feedFilterMode={feedFilterMode}
          setFeedFilterMode={setFeedFilterMode}
          hasPositions={positionSymbols.size > 0}
          onRefresh={() => mutateFeed()}
          newItemsCount={newItemsCount}
          onLoadNewItems={handleLoadNewItems}
          onCluster={handleCluster}
          isClustering={isClustering}
          clusters={clusters}
          showClusters={showClusters}
          setShowClusters={setShowClusters}
          onTriggerIngestion={handleTriggerIngestion}
          isIngesting={isIngesting}
        />
      )}
      {viewMode === 'sources' && (
        <SourcesView
          sources={(heatData?.sources || []).map(s => ({
            handle: s.handle,
            name: s.name,
            mentions: s.recentMentions,
          }))}
          isLoading={heatLoading}
        />
      )}
      {viewMode === 'leaderboard' && (
        <LeaderboardView />
      )}
    </div>
  );
}
