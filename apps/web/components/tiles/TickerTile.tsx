'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  BaselineSeries,
} from 'lightweight-charts';
import {
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Loader2,
  TrendingUp,
  BarChart3,
  Calendar,
  Maximize2,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tile } from '@/stores/workspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Bar } from '@/types/trading';
import { API_ROUTES, CHART_CONFIG } from '@/config/constants';
import { calculateSMA, calculateVolume } from '@/lib/indicators/calculations';
import { OrderBook2D } from '@/components/order-book/OrderBook2D';

interface TickerTileProps {
  tile: Tile;
}

type ChartType = 'candlestick' | 'line' | 'baseline';
type Timeframe = (typeof CHART_CONFIG.TIMEFRAMES)[number];

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1Min', label: '1m' },
  { value: '5Min', label: '5m' },
  { value: '15Min', label: '15m' },
  { value: '1Hour', label: '1H' },
  { value: '1Day', label: '1D' },
];

// Date range presets (Perplexity Finance style) - includes 'custom'
type DateRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX' | 'custom';
const DATE_RANGES: { value: DateRange; label: string; days: number }[] = [
  { value: '1D', label: '1D', days: 1 },
  { value: '5D', label: '5D', days: 5 },
  { value: '1M', label: '1M', days: 30 },
  { value: '3M', label: '3M', days: 90 },
  { value: '6M', label: '6M', days: 180 },
  { value: 'YTD', label: 'YTD', days: -1 },
  { value: '1Y', label: '1Y', days: 365 },
  { value: '5Y', label: '5Y', days: 1825 },
  { value: 'MAX', label: 'MAX', days: 3650 },
];

const CHART_TYPES: { value: ChartType; label: string; icon: typeof TrendingUp }[] = [
  { value: 'line', label: 'Line', icon: TrendingUp },
  { value: 'candlestick', label: 'Candles', icon: BarChart3 },
  { value: 'baseline', label: 'Baseline', icon: TrendingUp },
];

const chartThemes = {
  dark: {
    background: '#0f1419',
    textColor: '#9ca3af',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: '#374151',
    upColor: '#22c55e',
    downColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
  },
  light: {
    background: '#ffffff',
    textColor: '#374151',
    gridColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: '#e5e7eb',
    upColor: '#16a34a',
    downColor: '#dc2626',
    wickUpColor: '#16a34a',
    wickDownColor: '#dc2626',
  },
};

// Fetcher for market data
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

// Check if US market is open
function isMarketOpen(): boolean {
  const now = new Date();
  const etTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now);

  const hour = parseInt(etTime.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(etTime.find((p) => p.type === 'minute')?.value || '0', 10);
  const weekday = etTime.find((p) => p.type === 'weekday')?.value || '';

  if (weekday === 'Sat' || weekday === 'Sun') return false;

  const timeInMinutes = hour * 60 + minute;
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;

  return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

// Format session time
function formatSessionTime(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(now);
}

interface OrderBookApiResponse {
  symbol: string;
  bids: Array<{ price: number; size: number; orderCount: number }>;
  asks: Array<{ price: number; size: number; orderCount: number }>;
  spread: number;
  midPrice: number;
  timestamp: string;
  quote: {
    bidPrice: number;
    bidSize: number;
    askPrice: number;
    askSize: number;
  };
}

// Stats item component
function StatItem({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("text-xs font-mono font-medium", className)}>{value}</span>
    </div>
  );
}

export function TickerTile({ tile }: TickerTileProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Baseline'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'>[]>([]);

  const [chartType, setChartType] = useState<ChartType>('baseline');
  const [timeframe, setTimeframe] = useState<Timeframe>('1Day');
  const [dateRange, setDateRange] = useState<DateRange>('1M');
  const [bars, setBars] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVolume, setShowVolume] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Responsive tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width || 0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isCompact = containerWidth > 0 && containerWidth < 450;
  const isVeryCompact = containerWidth > 0 && containerWidth < 350;

  // Custom date range picker state
  const [showCalendar, setShowCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Apply custom date range - FIXED: now sets 'custom' instead of '1M'
  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      let newTimeframe: Timeframe = '1Day';
      if (daysDiff <= 1) newTimeframe = '5Min';
      else if (daysDiff <= 5) newTimeframe = '15Min';
      else if (daysDiff <= 30) newTimeframe = '1Hour';
      else newTimeframe = '1Day';

      setTimeframe(newTimeframe);
      setDateRange('custom');
      setShowCalendar(false);
    }
  };

  // Auto-select appropriate timeframe based on date range
  const getTimeframeForRange = (range: DateRange): Timeframe => {
    switch (range) {
      case '1D':
        return '5Min';
      case '5D':
        return '15Min';
      case '1M':
      case '3M':
        return '1Hour';
      case '6M':
      case 'YTD':
      case '1Y':
      case '5Y':
      case 'MAX':
      case 'custom':
        return '1Day';
      default:
        return '1Day';
    }
  };

  // Calculate limit based on date range
  const getLimitForRange = (range: DateRange): number => {
    if (range === 'custom') return 500;

    const rangeConfig = DATE_RANGES.find(r => r.value === range);
    if (!rangeConfig) return 200;

    if (range === 'YTD') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const daysSinceYearStart = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceYearStart * 8;
    }

    const tf = getTimeframeForRange(range);
    switch (tf) {
      case '5Min':
        return rangeConfig.days * 78;
      case '15Min':
        return rangeConfig.days * 26;
      case '1Hour':
        return rangeConfig.days * 7;
      case '1Day':
        return rangeConfig.days;
      default:
        return 200;
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    const autoTimeframe = getTimeframeForRange(range);
    setTimeframe(autoTimeframe);
  };

  const { resolvedTheme } = useTheme();
  const chartTheme = useMemo(() => {
    return resolvedTheme === 'light' ? chartThemes.light : chartThemes.dark;
  }, [resolvedTheme]);

  const symbol = (tile.props?.ticker as string) || 'AAPL';

  // Fetch quote data from FMP for stats grid
  const { data: quoteData, isLoading: quoteLoading } = useSWR(
    `/api/fmp/quotes?symbol=${symbol}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  // Fetch order book data
  const {
    data: orderBookData,
    isLoading: orderBookLoading,
    mutate: mutateOrderBook,
  } = useSWR<OrderBookApiResponse>(showOrderBook ? `/api/alpaca/orderbook?symbol=${symbol}` : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  });

  // Process quote data for display
  const tickerInfo = useMemo(() => {
    const raw = quoteData?.raw;
    if (!raw) {
      return {
        price: null,
        change: null,
        changePercent: null,
        previousClose: null,
        open: null,
        dayHigh: null,
        dayLow: null,
        yearHigh: null,
        yearLow: null,
        volume: null,
        avgVolume: null,
        marketCap: null,
        pe: null,
        eps: null,
      };
    }

    return {
      price: raw.price,
      change: raw.change,
      changePercent: raw.changesPercentage,
      previousClose: raw.previousClose,
      open: raw.open,
      dayHigh: raw.dayHigh,
      dayLow: raw.dayLow,
      yearHigh: raw.yearHigh,
      yearLow: raw.yearLow,
      volume: raw.volume,
      avgVolume: raw.avgVolume,
      marketCap: raw.marketCap,
      pe: raw.pe,
      eps: raw.eps,
    };
  }, [quoteData]);

  // Process order book data
  const orderBook = useMemo(() => {
    if (!orderBookData) {
      return { bids: [], asks: [], spread: 0, spreadPercent: 0 };
    }

    const bestBid = orderBookData.bids[0]?.price || 0;
    const bestAsk = orderBookData.asks[0]?.price || 0;

    return {
      bids: orderBookData.bids.map((b, i) => ({
        ...b,
        total: orderBookData.bids.slice(0, i + 1).reduce((sum, l) => sum + l.size, 0),
      })),
      asks: orderBookData.asks.map((a, i) => ({
        ...a,
        total: orderBookData.asks.slice(0, i + 1).reduce((sum, l) => sum + l.size, 0),
      })),
      spread: orderBookData.spread,
      spreadPercent: bestBid > 0 ? ((bestAsk - bestBid) / bestBid) * 100 : 0,
    };
  }, [orderBookData]);

  // Fetch bar data for chart
  const fetchBars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const limit = getLimitForRange(dateRange);
      const response = await fetch(
        `${API_ROUTES.MARKET_DATA}?symbol=${symbol}&type=bars&timeframe=${timeframe}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      setBars(data.bars || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe, dateRange]);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: chartTheme.background },
        textColor: chartTheme.textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: chartTheme.gridColor },
        horzLines: { color: chartTheme.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: chartTheme.borderColor },
        horzLine: { labelBackgroundColor: chartTheme.borderColor },
      },
      timeScale: {
        borderColor: chartTheme.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: chartTheme.borderColor,
      },
    });

    chartRef.current = chart;

    // Create appropriate series based on chart type
    if (chartType === 'line') {
      seriesRef.current = chart.addSeries(LineSeries, {
        color: chartTheme.upColor,
        lineWidth: 2,
      });
    } else if (chartType === 'baseline') {
      // Baseline series with green above / red below previous close
      const firstBar = bars[0];
      const prevClose = tickerInfo.previousClose || (firstBar ? firstBar.open : 0);
      seriesRef.current = chart.addSeries(BaselineSeries, {
        baseValue: { type: 'price', price: prevClose },
        topLineColor: chartTheme.upColor,
        topFillColor1: 'rgba(34, 197, 94, 0.28)',
        topFillColor2: 'rgba(34, 197, 94, 0.05)',
        bottomLineColor: chartTheme.downColor,
        bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
        bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
        lineWidth: 2,
      });
    } else {
      seriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: chartTheme.upColor,
        downColor: chartTheme.downColor,
        borderUpColor: chartTheme.upColor,
        borderDownColor: chartTheme.downColor,
        wickUpColor: chartTheme.wickUpColor,
        wickDownColor: chartTheme.wickDownColor,
      });
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeSeriesRef.current = null;
      smaSeriesRef.current = [];
    };
  }, [chartType, chartTheme, tickerInfo.previousClose]);

  // Update data when bars change
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || bars.length === 0) return;

    const chartData: CandlestickData[] = bars.map((bar: Bar) => ({
      time: (bar.timestamp / 1000) as UTCTimestamp,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    if (chartType === 'line' || chartType === 'baseline') {
      const lineData = chartData.map((d) => ({
        time: d.time,
        value: d.close,
      }));
      (seriesRef.current as ISeriesApi<'Line'> | ISeriesApi<'Baseline'>).setData(lineData);
    } else {
      (seriesRef.current as ISeriesApi<'Candlestick'>).setData(chartData);
    }

    chartRef.current.timeScale().fitContent();
  }, [bars, chartType]);

  // Manage volume series
  useEffect(() => {
    if (!chartRef.current || bars.length === 0) return;

    if (showVolume) {
      if (!volumeSeriesRef.current) {
        volumeSeriesRef.current = chartRef.current.addSeries(HistogramSeries, {
          priceScaleId: 'volume',
          priceFormat: { type: 'volume' },
        });
        chartRef.current.priceScale('volume').applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        });
      }
      const volumeData = calculateVolume(bars, chartTheme.upColor, chartTheme.downColor);
      volumeSeriesRef.current.setData(volumeData);
    } else if (volumeSeriesRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }
  }, [bars, showVolume, chartTheme.upColor, chartTheme.downColor]);

  // Manage SMA series
  useEffect(() => {
    if (!chartRef.current || bars.length === 0) return;

    smaSeriesRef.current.forEach((series) => {
      if (chartRef.current) {
        chartRef.current.removeSeries(series);
      }
    });
    smaSeriesRef.current = [];

    if (showSMA) {
      const periods = [20, 50];
      const colors = ['#f59e0b', '#3b82f6'];

      periods.forEach((period, i) => {
        if (chartRef.current) {
          const series = chartRef.current.addSeries(LineSeries, {
            color: colors[i],
            lineWidth: 1,
            priceScaleId: 'right',
          });
          const data = calculateSMA(bars, period);
          series.setData(data);
          smaSeriesRef.current.push(series);
        }
      });
    }
  }, [bars, showSMA]);

  const isPositive = (tickerInfo.change || 0) >= 0;

  // Format helpers
  const formatVolume = (vol: number | null) => {
    if (vol === null) return '-';
    if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
    return vol.toString();
  };

  const formatMarketCap = (cap: number | null) => {
    if (cap === null) return '-';
    if (cap >= 1_000_000_000_000) return `$${(cap / 1_000_000_000_000).toFixed(2)}T`;
    if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(2)}B`;
    if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Perplexity Finance Style Header */}
      <div className="border-b border-border bg-card p-3">
        {/* Row 1: Price and Change */}
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-xs font-medium text-muted-foreground">{symbol}</span>
          {tickerInfo.price !== null ? (
            <>
              <span className="text-2xl font-bold text-foreground">
                ${tickerInfo.price.toFixed(2)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>
                  {isPositive ? '+' : ''}${Math.abs(tickerInfo.change || 0).toFixed(2)}
                </span>
                <span>
                  ({isPositive ? '+' : ''}{tickerInfo.changePercent?.toFixed(2)}%)
                </span>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">
              {quoteLoading ? 'Loading...' : 'No data'}
            </span>
          )}
        </div>

        {/* Row 2: Session info */}
        <div className="text-xs text-muted-foreground mb-3">
          {isMarketOpen() ? 'Regular session' : 'Market closed'}: {formatSessionTime()}
        </div>

        {/* Row 3: Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Date range buttons - always visible */}
            {isCompact ? (
              <Select value={dateRange} onValueChange={(v) => handleDateRangeChange(v as DateRange)}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value} className="text-xs">
                      {range.label}
                    </SelectItem>
                  ))}
                  {dateRange === 'custom' && (
                    <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <>
                {DATE_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    variant={dateRange === range.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleDateRangeChange(range.value)}
                    className={cn(
                      'h-7 px-2 text-xs',
                      dateRange === range.value && 'bg-zinc-700 text-white'
                    )}
                  >
                    {range.label}
                  </Button>
                ))}
                {dateRange === 'custom' && (
                  <Badge variant="outline" className="h-7 px-2 text-xs">Custom</Badge>
                )}
              </>
            )}

            {/* Calendar picker */}
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-foreground">Custom Date Range</div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Start Date</Label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">End Date</Label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleApplyCustomRange}
                    disabled={!customStartDate || !customEndDate}
                    className="w-full h-7 text-xs"
                  >
                    Apply Range
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Chart type toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={chartType === 'line' || chartType === 'baseline' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType(chartType === 'baseline' ? 'line' : 'baseline')}
                    className={cn('h-7 px-2', (chartType === 'line' || chartType === 'baseline') && 'bg-zinc-700 text-white')}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{chartType === 'baseline' ? 'Line chart' : 'Baseline chart'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={chartType === 'candlestick' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType('candlestick')}
                    className={cn('h-7 px-2', chartType === 'candlestick' && 'bg-zinc-700 text-white')}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Candlestick chart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!isVeryCompact && (
              <>
                <div className="w-px h-5 bg-border mx-1" />

                {/* Indicators */}
                <Button
                  variant={showVolume ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setShowVolume(!showVolume)}
                  className={cn('h-7 px-2 text-xs', showVolume && 'bg-zinc-700 text-white')}
                >
                  Vol
                </Button>
                <Button
                  variant={showSMA ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setShowSMA(!showSMA)}
                  className={cn('h-7 px-2 text-xs', showSMA && 'bg-zinc-700 text-white')}
                >
                  SMA
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Order book toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showOrderBook ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowOrderBook(!showOrderBook)}
                    className={cn('h-7 px-2', showOrderBook && 'bg-primary/20 text-primary')}
                  >
                    {showOrderBook ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showOrderBook ? 'Hide' : 'Show'} Order Book</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main content area with chart and optional order book */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart and stats container */}
        <div className="flex-1 flex flex-col">
          {/* Chart container */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
                <div className="text-destructive text-sm">{error}</div>
              </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />
          </div>

          {/* Stats Grid - Perplexity Finance style */}
          {showStats && tickerInfo.price !== null && (
            <div className="border-t border-border bg-muted/30 p-3">
              <div className={cn(
                "grid gap-4 text-sm",
                isVeryCompact ? "grid-cols-2" : isCompact ? "grid-cols-3" : "grid-cols-6"
              )}>
                <StatItem label="Prev Close" value={formatPrice(tickerInfo.previousClose)} />
                <StatItem
                  label="Day Range"
                  value={tickerInfo.dayLow && tickerInfo.dayHigh ? `${formatPrice(tickerInfo.dayLow)} - ${formatPrice(tickerInfo.dayHigh)}` : '-'}
                />
                <StatItem
                  label="52W Range"
                  value={tickerInfo.yearLow && tickerInfo.yearHigh ? `${formatPrice(tickerInfo.yearLow)} - ${formatPrice(tickerInfo.yearHigh)}` : '-'}
                />
                <StatItem label="Volume" value={formatVolume(tickerInfo.volume)} />
                <StatItem label="Market Cap" value={formatMarketCap(tickerInfo.marketCap)} />
                <StatItem label="P/E Ratio" value={tickerInfo.pe?.toFixed(2) || '-'} />
              </div>
            </div>
          )}
        </div>

        {/* Order book sidebar */}
        {showOrderBook && (
          <div className="w-48 border-l border-border flex flex-col bg-card/50">
            {/* Order book header */}
            <div className="h-8 flex items-center justify-between px-2 border-b border-border">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Order Book</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => mutateOrderBook()}
                      disabled={orderBookLoading}
                      className="h-6 w-6"
                    >
                      <RefreshCw
                        className={cn('h-3 w-3', orderBookLoading && 'animate-spin')}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Order book content */}
            <div className="flex-1 overflow-hidden">
              {orderBookLoading && !orderBookData ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : orderBook.bids.length === 0 && orderBook.asks.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  No data
                </div>
              ) : (
                <OrderBook2D
                  bids={orderBook.bids}
                  asks={orderBook.asks}
                  spread={orderBook.spread}
                  spreadPercent={orderBook.spreadPercent}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Keep backwards compatibility export
export { TickerTile as ChartTile };
