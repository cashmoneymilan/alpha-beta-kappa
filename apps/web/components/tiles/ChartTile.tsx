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
  TrendingDown,
  Activity,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tile } from '@/stores/workspace';
import { useOrderBookStore } from '@/stores/orderBookStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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

interface ChartTileProps {
  tile: Tile;
}

type ChartType = 'candlestick' | 'heikin-ashi' | 'line';
type Timeframe = (typeof CHART_CONFIG.TIMEFRAMES)[number];

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1Min', label: '1m' },
  { value: '5Min', label: '5m' },
  { value: '15Min', label: '15m' },
  { value: '1Hour', label: '1H' },
  { value: '1Day', label: '1D' },
];

// Date range presets (Perplexity-style)
type DateRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';
const DATE_RANGES: { value: DateRange; label: string; days: number }[] = [
  { value: '1D', label: '1D', days: 1 },
  { value: '5D', label: '5D', days: 5 },
  { value: '1M', label: '1M', days: 30 },
  { value: '3M', label: '3M', days: 90 },
  { value: '6M', label: '6M', days: 180 },
  { value: 'YTD', label: 'YTD', days: -1 }, // -1 = calculate from Jan 1
  { value: '1Y', label: '1Y', days: 365 },
  { value: '5Y', label: '5Y', days: 1825 },
  { value: 'MAX', label: 'MAX', days: 3650 },
];

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'candlestick', label: 'Candle' },
  { value: 'heikin-ashi', label: 'HA' },
  { value: 'line', label: 'Line' },
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

function convertToHeikinAshi(data: CandlestickData[]): CandlestickData[] {
  if (data.length === 0) return [];

  const result: CandlestickData[] = [];

  for (let i = 0; i < data.length; i++) {
    const current = data[i]!;
    const previous = i > 0 ? result[i - 1]! : current;

    const haClose = (current.open + current.high + current.low + current.close) / 4;
    const haOpen = (previous.open + previous.close) / 2;
    const haHigh = Math.max(current.high, haOpen, haClose);
    const haLow = Math.min(current.low, haOpen, haClose);

    result.push({
      time: current.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
    });
  }

  return result;
}

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

export function ChartTile({ tile }: ChartTileProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'>[]>([]);

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1Day');
  const [dateRange, setDateRange] = useState<DateRange>('1M');
  const [bars, setBars] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [showTickerDetails, setShowTickerDetails] = useState(false);

  // Responsive header width tracking
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState(0);

  // Track header width for responsive layout
  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setHeaderWidth(entries[0]?.contentRect.width || 0);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Responsive breakpoints
  const isCompact = headerWidth > 0 && headerWidth < 500;
  const isVeryCompact = headerWidth > 0 && headerWidth < 350;

  // Custom date range picker state
  const [showCalendar, setShowCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Apply custom date range
  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Select appropriate timeframe based on date range span
      let newTimeframe: Timeframe = '1Day';
      if (daysDiff <= 1) newTimeframe = '5Min';
      else if (daysDiff <= 5) newTimeframe = '15Min';
      else if (daysDiff <= 30) newTimeframe = '1Hour';
      else newTimeframe = '1Day';

      setTimeframe(newTimeframe);
      setDateRange('1M'); // Reset preset to indicate custom
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
        return '1Day';
      default:
        return '1Day';
    }
  };

  // Calculate limit based on date range
  const getLimitForRange = (range: DateRange): number => {
    const rangeConfig = DATE_RANGES.find(r => r.value === range);
    if (!rangeConfig) return 200;

    if (range === 'YTD') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const daysSinceYearStart = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceYearStart * 8; // Approximate bars per day for 1Hour
    }

    const tf = getTimeframeForRange(range);
    switch (tf) {
      case '5Min':
        return rangeConfig.days * 78; // ~78 5-min bars per day
      case '15Min':
        return rangeConfig.days * 26; // ~26 15-min bars per day
      case '1Hour':
        return rangeConfig.days * 7; // ~7 hours of trading per day
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

  // Fetch ticker data for header (using FMP for accurate prices)
  const { data: tickerData, isLoading: tickerLoading } = useSWR(
    `${API_ROUTES.FMP_BARS}?symbol=${symbol}&timeframe=5Min&limit=78`,
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

  // Process ticker data for header
  const tickerInfo = useMemo(() => {
    if (!tickerData?.bars?.length) {
      return {
        price: null,
        change: null,
        changePercent: null,
        open: null,
        high: null,
        low: null,
        volume: null,
        avgVolume: null,
        vwap: null,
      };
    }

    const barsData = tickerData.bars;
    const latestBar = barsData[barsData.length - 1];
    const firstBar = barsData[0];

    const price = latestBar.close;
    const open = firstBar.open;
    const change = price - open;
    const changePercent = (change / open) * 100;

    // Calculate high/low/volume from all bars
    let dayHigh = -Infinity;
    let dayLow = Infinity;
    let totalVolume = 0;

    for (const bar of barsData) {
      dayHigh = Math.max(dayHigh, bar.high);
      dayLow = Math.min(dayLow, bar.low);
      totalVolume += bar.volume || 0;
    }

    // Calculate VWAP (Volume Weighted Average Price)
    let vwapNumerator = 0;
    let vwapDenominator = 0;
    for (const bar of barsData) {
      const typicalPrice = (bar.high + bar.low + bar.close) / 3;
      vwapNumerator += typicalPrice * (bar.volume || 0);
      vwapDenominator += bar.volume || 0;
    }
    const vwap = vwapDenominator > 0 ? vwapNumerator / vwapDenominator : null;

    return {
      price,
      change,
      changePercent,
      open,
      high: dayHigh !== -Infinity ? dayHigh : null,
      low: dayLow !== Infinity ? dayLow : null,
      volume: totalVolume,
      vwap,
    };
  }, [tickerData]);

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

    if (chartType === 'line') {
      seriesRef.current = chart.addSeries(LineSeries, {
        color: chartTheme.upColor,
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
  }, [chartType, chartTheme]);

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

    let dataToDisplay = chartData;

    if (chartType === 'heikin-ashi') {
      dataToDisplay = convertToHeikinAshi(chartData);
    }

    if (chartType === 'line') {
      const lineData = dataToDisplay.map((d) => ({
        time: d.time,
        value: d.close,
      }));
      (seriesRef.current as ISeriesApi<'Line'>).setData(lineData);
    } else {
      (seriesRef.current as ISeriesApi<'Candlestick'>).setData(dataToDisplay);
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

  // Format volume for display
  const formatVolume = (vol: number | null) => {
    if (vol === null) return '-';
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header with Ticker Info */}
      <div className="border-b border-border bg-card">
        <div ref={headerRef} className="h-9 flex items-center justify-between px-2 text-[10px]">
          {/* Left: Symbol, Price, Change */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTickerDetails(!showTickerDetails)}
              className="flex items-center gap-1 hover:bg-muted/50 rounded px-1 py-0.5 -ml-1"
            >
              <span className="font-bold text-foreground text-sm">{symbol}</span>
              {showTickerDetails ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            {tickerInfo.price !== null ? (
              <>
                <span className="font-mono text-foreground text-sm font-semibold">
                  ${tickerInfo.price.toFixed(2)}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-0.5 font-medium',
                    isPositive ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {tickerInfo.change?.toFixed(2)}
                  </span>
                  <span>
                    ({isPositive ? '+' : ''}
                    {tickerInfo.changePercent?.toFixed(2)}%)
                  </span>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">
                {tickerLoading ? 'Loading...' : 'No data'}
              </span>
            )}

            {!isMarketOpen() && (
              <Badge variant="pending" className="text-[9px] px-1 py-0">
                Closed
              </Badge>
            )}
          </div>

        {/* Center: Date range selector (Perplexity-style) */}
        {isCompact ? (
          <Select value={dateRange} onValueChange={(v) => handleDateRangeChange(v as DateRange)}>
            <SelectTrigger className="w-16 h-6 text-[10px] border-zinc-700 bg-zinc-900/50 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value} className="text-[10px]">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-1">
            {DATE_RANGES.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => handleDateRangeChange(range.value)}
                className={cn(
                  'h-5 px-1.5 text-[10px] font-medium',
                  dateRange === range.value
                    ? 'bg-zinc-700 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {range.label}
              </Button>
            ))}
            {/* Custom date range calendar picker */}
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
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
          </div>
        )}

        {/* Right: Indicators and Chart type */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-5 px-1.5 text-[10px]',
                showVolume
                  ? 'bg-zinc-700 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setShowVolume(!showVolume)}
            >
              Vol
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-5 px-1.5 text-[10px]',
                showSMA
                  ? 'bg-zinc-700 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setShowSMA(!showSMA)}
            >
              SMA
            </Button>
          </div>

          {!isVeryCompact && <div className="w-px h-3 bg-border" />}

          {/* Chart type selector */}
          {isVeryCompact ? (
            <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <SelectTrigger className="w-16 h-6 text-[10px] border-zinc-700 bg-zinc-900/50 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-[10px]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-0.5">
              {CHART_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartType(type.value)}
                  className={cn(
                    'h-5 px-1.5 text-[10px]',
                    chartType === type.value
                      ? 'bg-zinc-700 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          )}

          <div className="w-px h-3 bg-border" />

          {/* Order book toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showOrderBook ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setShowOrderBook(!showOrderBook)}
                  className={cn('h-5 w-5', showOrderBook && 'bg-primary/20 text-primary')}
                >
                  {showOrderBook ? (
                    <PanelRightClose className="h-3 w-3" />
                  ) : (
                    <PanelRightOpen className="h-3 w-3" />
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

        {/* Expanded Ticker Details */}
        {showTickerDetails && tickerInfo.price !== null && (
          <div className="px-3 py-2 border-t border-border/50 bg-muted/30">
            <div className="grid grid-cols-6 gap-4 text-[10px]">
              {/* Open */}
              <div>
                <span className="text-muted-foreground block">Open</span>
                <span className="font-mono font-medium">
                  ${tickerInfo.open?.toFixed(2) || '-'}
                </span>
              </div>

              {/* High */}
              <div>
                <span className="text-muted-foreground block">High</span>
                <span className="font-mono font-medium text-green-500">
                  ${tickerInfo.high?.toFixed(2) || '-'}
                </span>
              </div>

              {/* Low */}
              <div>
                <span className="text-muted-foreground block">Low</span>
                <span className="font-mono font-medium text-red-500">
                  ${tickerInfo.low?.toFixed(2) || '-'}
                </span>
              </div>

              {/* Volume */}
              <div>
                <span className="text-muted-foreground block">Volume</span>
                <span className="font-mono font-medium">
                  {formatVolume(tickerInfo.volume)}
                </span>
              </div>

              {/* VWAP */}
              <div>
                <span className="text-muted-foreground block">VWAP</span>
                <span className="font-mono font-medium">
                  ${tickerInfo.vwap?.toFixed(2) || '-'}
                </span>
              </div>

              {/* Range */}
              <div>
                <span className="text-muted-foreground block">Range</span>
                <span className="font-mono font-medium">
                  {tickerInfo.high && tickerInfo.low
                    ? `$${(tickerInfo.high - tickerInfo.low).toFixed(2)}`
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area with chart and optional order book */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
              <div className="text-destructive text-sm">{error}</div>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>

        {/* Order book sidebar */}
        {showOrderBook && (
          <div className="w-48 border-l border-border flex flex-col bg-card/50">
            {/* Order book header */}
            <div className="h-7 flex items-center justify-between px-2 border-b border-border">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium">Order Book</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => mutateOrderBook()}
                      disabled={orderBookLoading}
                      className="h-5 w-5"
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
                <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
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
