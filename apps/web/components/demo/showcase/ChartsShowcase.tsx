'use client';

import { useState } from 'react';
import { themes } from '../themes';

interface ChartsShowcaseProps {
  themeName: string;
}

type ChartType = 'candle' | 'line' | 'area';
type Timeframe = '1m' | '5m' | '15m' | '1H' | '1D';

// Generate realistic OHLC data
const generateOHLCData = (trend: 'up' | 'down' | 'volatile', count: number = 24) => {
  const data = [];
  let basePrice = 175;

  for (let i = 0; i < count; i++) {
    const trendMultiplier = trend === 'up' ? 0.4 : trend === 'down' ? -0.4 : 0;
    const volatility = trend === 'volatile' ? 4 : 2;
    const change = (Math.random() - 0.5 + trendMultiplier) * volatility;

    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * 1.2;
    const low = Math.min(open, close) - Math.random() * 1.2;
    const volume = Math.floor(Math.random() * 80) + 20;

    data.push({ open, high, low, close, volume, time: i });
    basePrice = close;
  }
  return data;
};

// Sparkline data
const sparklineData = {
  up: [100, 102, 101, 105, 104, 108, 107, 112, 110, 115, 118, 116, 122, 120, 125],
  down: [125, 123, 124, 120, 122, 118, 119, 115, 117, 112, 110, 113, 108, 110, 105],
  flat: [110, 112, 109, 111, 110, 112, 108, 111, 110, 109, 112, 110, 111, 109, 110],
};

export function ChartsShowcase({ themeName }: ChartsShowcaseProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [showSMA, setShowSMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  const mainChartData = generateOHLCData('up', 30);

  // Calculate SMA
  const calculateSMA = (data: typeof mainChartData, period: number) => {
    return data.map((_, i) => {
      if (i < period - 1) return null;
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      return sum / period;
    });
  };

  const sma7 = calculateSMA(mainChartData, 7);

  // SVG Chart renderers
  const renderSparkline = (data: number[], isPositive: boolean, height: number = 32) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 120;
    const padding = 2;

    const points = data
      .map((value, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = padding + (height - padding * 2) - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

    const color = isPositive ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))';

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-grad-${isPositive}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
          fill={`url(#spark-grad-${isPositive})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderAreaChart = (data: typeof mainChartData, width: number, height: number) => {
    const closes = data.map(d => d.close);
    const max = Math.max(...closes) * 1.02;
    const min = Math.min(...closes) * 0.98;
    const range = max - min;
    const lastClose = closes[closes.length - 1] ?? 0;
    const firstClose = closes[0] ?? 0;
    const isPositive = lastClose >= firstClose;
    const color = isPositive ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))';

    const points = closes
      .map((value, i) => {
        const x = (i / (closes.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`area-grad-${themeName}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={height * ratio}
            x2={width}
            y2={height * ratio}
            stroke="hsl(var(--demo-border))"
            strokeOpacity="0.5"
            strokeDasharray="4,4"
          />
        ))}
        {/* Area */}
        <path
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          fill={`url(#area-grad-${themeName})`}
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* SMA overlay */}
        {showSMA && (
          <polyline
            points={sma7
              .map((value, i) => {
                if (value === null) return null;
                const x = (i / (sma7.length - 1)) * width;
                const y = height - ((value - min) / range) * height;
                return `${x},${y}`;
              })
              .filter(Boolean)
              .join(' ')}
            fill="none"
            stroke="hsl(var(--demo-accent))"
            strokeWidth="1.5"
            strokeDasharray="6,3"
            strokeOpacity="0.8"
          />
        )}
        {/* Current price dot */}
        <circle
          cx={width}
          cy={height - ((lastClose - min) / range) * height}
          r="4"
          fill={color}
        />
      </svg>
    );
  };

  const renderCandlestickChart = (data: typeof mainChartData, width: number, height: number) => {
    const allPrices = data.flatMap(d => [d.high, d.low]);
    const max = Math.max(...allPrices) * 1.01;
    const min = Math.min(...allPrices) * 0.99;
    const range = max - min;
    const candleWidth = (width / data.length) * 0.7;
    const gap = (width / data.length) * 0.3;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={height * ratio}
            x2={width}
            y2={height * ratio}
            stroke="hsl(var(--demo-border))"
            strokeOpacity="0.5"
            strokeDasharray="4,4"
          />
        ))}
        {data.map((candle, i) => {
          const x = i * (width / data.length) + gap / 2;
          const isGreen = candle.close >= candle.open;
          const color = isGreen ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))';

          const highY = height - ((candle.high - min) / range) * height;
          const lowY = height - ((candle.low - min) / range) * height;
          const openY = height - ((candle.open - min) / range) * height;
          const closeY = height - ((candle.close - min) / range) * height;

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

          return (
            <g key={i}>
              <line
                x1={x + candleWidth / 2}
                y1={highY}
                x2={x + candleWidth / 2}
                y2={lowY}
                stroke={color}
                strokeWidth="1"
              />
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                rx="1"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderVolumeChart = (data: typeof mainChartData, width: number, height: number) => {
    const maxVolume = Math.max(...data.map(d => d.volume));
    const barWidth = (width / data.length) * 0.7;
    const gap = (width / data.length) * 0.3;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {data.map((candle, i) => {
          const x = i * (width / data.length) + gap / 2;
          const barHeight = (candle.volume / maxVolume) * height;
          const isGreen = candle.close >= candle.open;

          return (
            <rect
              key={i}
              x={x}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              fill={isGreen ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))'}
              fillOpacity="0.4"
              rx="1"
            />
          );
        })}
      </svg>
    );
  };

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1H', '1D'];
  const chartTypes: { id: ChartType; label: string }[] = [
    { id: 'area', label: 'Area' },
    { id: 'candle', label: 'Candle' },
    { id: 'line', label: 'Line' },
  ];

  return (
    <div className="space-y-6">
      {/* Sparkline Tickers */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Ticker Sparklines
        </h4>
        <div className="grid gap-2">
          {[
            { symbol: 'AAPL', name: 'Apple Inc.', price: 178.32, change: 2.45, pct: 1.39, data: sparklineData.up },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.15, change: -5.80, pct: -2.34, data: sparklineData.down },
            { symbol: 'MSFT', name: 'Microsoft', price: 378.91, change: 0.42, pct: 0.11, data: sparklineData.flat },
          ].map((ticker) => (
            <div
              key={ticker.symbol}
              className="demo-card flex items-center gap-4 p-3"
              style={{ borderRadius }}
            >
              {/* Symbol info */}
              <div className="w-24">
                <div className="font-mono font-bold">{ticker.symbol}</div>
                <div className="text-[10px]" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                  {ticker.name}
                </div>
              </div>
              {/* Sparkline */}
              <div className="flex-1">
                {renderSparkline(ticker.data, ticker.change >= 0)}
              </div>
              {/* Price */}
              <div className="text-right w-28">
                <div className="font-mono font-bold">${ticker.price.toFixed(2)}</div>
                <div
                  className="text-xs font-medium"
                  style={{
                    color: ticker.change >= 0 ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))',
                  }}
                >
                  {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)} ({ticker.pct >= 0 ? '+' : ''}{ticker.pct.toFixed(2)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Interactive Chart
        </h4>
        <div
          className="demo-card overflow-hidden"
          style={{ borderRadius }}
        >
          {/* Chart Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid hsl(var(--demo-border))' }}
          >
            <div className="flex items-center gap-4">
              <div>
                <span className="font-mono font-bold text-lg">AAPL</span>
                <span className="ml-2 text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                  Apple Inc.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">$178.32</span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    backgroundColor: 'hsl(var(--demo-bullish) / 0.15)',
                    color: 'hsl(var(--demo-bullish))',
                  }}
                >
                  +1.39%
                </span>
              </div>
            </div>
            {/* Chart Type */}
            <div
              className="flex items-center gap-0.5 p-1 rounded-lg"
              style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
            >
              {chartTypes.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setChartType(id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                  style={{
                    backgroundColor: chartType === id ? 'hsl(var(--demo-background))' : 'transparent',
                    color: chartType === id ? 'hsl(var(--demo-foreground))' : 'hsl(var(--demo-muted-foreground))',
                    boxShadow: chartType === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe bar */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ backgroundColor: 'hsl(var(--demo-muted) / 0.3)' }}
          >
            <div className="flex items-center gap-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className="px-3 py-1 text-xs font-medium rounded transition-all"
                  style={{
                    backgroundColor: timeframe === tf ? 'hsl(var(--demo-primary))' : 'transparent',
                    color: timeframe === tf ? 'hsl(var(--demo-primary-foreground))' : 'hsl(var(--demo-muted-foreground))',
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setShowSMA(!showSMA)}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-all"
                style={{
                  backgroundColor: showSMA ? 'hsl(var(--demo-accent) / 0.15)' : 'transparent',
                  color: showSMA ? 'hsl(var(--demo-accent))' : 'hsl(var(--demo-muted-foreground))',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: showSMA ? 'hsl(var(--demo-accent))' : 'hsl(var(--demo-muted))' }}
                />
                SMA 7
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-all"
                style={{
                  backgroundColor: showVolume ? 'hsl(var(--demo-primary) / 0.15)' : 'transparent',
                  color: showVolume ? 'hsl(var(--demo-primary))' : 'hsl(var(--demo-muted-foreground))',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: showVolume ? 'hsl(var(--demo-primary))' : 'hsl(var(--demo-muted))' }}
                />
                Volume
              </button>
            </div>
          </div>

          {/* Chart Area */}
          <div className="p-4">
            <div className="h-40">
              {chartType === 'candle'
                ? renderCandlestickChart(mainChartData, 400, 160)
                : renderAreaChart(mainChartData, 400, 160)}
            </div>
            {showVolume && (
              <div className="h-12 mt-2">
                {renderVolumeChart(mainChartData, 400, 48)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Charts Grid */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Mini Charts
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { symbol: 'NVDA', trend: 'up' as const, change: 4.2 },
            { symbol: 'GOOGL', trend: 'down' as const, change: -1.8 },
            { symbol: 'AMZN', trend: 'up' as const, change: 2.1 },
            { symbol: 'META', trend: 'volatile' as const, change: 0.5 },
          ].map((item) => {
            const data = generateOHLCData(item.trend, 20);
            return (
              <div
                key={item.symbol}
                className="demo-card p-3"
                style={{ borderRadius }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm">{item.symbol}</span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: item.change >= 0 ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))',
                    }}
                  >
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
                <div className="h-16">
                  {renderCandlestickChart(data, 180, 64)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume Profile */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Intraday Volume
        </h4>
        <div
          className="demo-card p-4"
          style={{ borderRadius }}
        >
          <div className="flex items-end gap-1 h-16">
            {mainChartData.slice(-16).map((candle, i) => {
              const maxVol = Math.max(...mainChartData.slice(-16).map(d => d.volume));
              const heightPct = (candle.volume / maxVol) * 100;
              const isGreen = candle.close >= candle.open;
              const isLast = i === 15;

              return (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isLast
                      ? 'hsl(var(--demo-primary))'
                      : isGreen
                      ? 'hsl(var(--demo-bullish) / 0.4)'
                      : 'hsl(var(--demo-bearish) / 0.4)',
                  }}
                />
              );
            })}
          </div>
          <div
            className="flex justify-between mt-3 text-[10px] font-mono"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            <span>9:30 AM</span>
            <span>12:00 PM</span>
            <span>4:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
