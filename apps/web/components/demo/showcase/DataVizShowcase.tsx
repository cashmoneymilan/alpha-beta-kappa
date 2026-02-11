'use client';

import { themes } from '../themes';

interface DataVizShowcaseProps {
  themeName: string;
}

export function DataVizShowcase({ themeName }: DataVizShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  // Mock sparkline data
  const sparklineUp = [20, 25, 22, 30, 28, 35, 32, 40, 38, 45, 50, 48, 55];
  const sparklineDown = [50, 48, 52, 45, 42, 38, 40, 35, 38, 30, 28, 32, 25];
  const sparklineFlat = [30, 32, 28, 31, 29, 30, 32, 28, 30, 31, 29, 30, 31];

  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = data
      .map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sparklines */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Sparklines
        </h4>
        <div className="space-y-3">
          {[
            { symbol: 'AAPL', price: 175.25, change: 4.2, data: sparklineUp },
            { symbol: 'TSLA', price: 245.80, change: -2.8, data: sparklineDown },
            { symbol: 'MSFT', price: 395.50, change: 0.3, data: sparklineFlat },
          ].map((item) => (
            <div
              key={item.symbol}
              className="demo-card flex items-center justify-between p-3"
              style={{ borderRadius }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold w-12">{item.symbol}</span>
                <span className="font-mono">${item.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3">
                {renderSparkline(
                  item.data,
                  item.change >= 0
                    ? 'hsl(var(--demo-bullish))'
                    : 'hsl(var(--demo-bearish))'
                )}
                <span
                  className="font-mono text-sm w-16 text-right"
                  style={{
                    color:
                      item.change >= 0
                        ? 'hsl(var(--demo-bullish))'
                        : 'hsl(var(--demo-bearish))',
                  }}
                >
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bars */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Progress Indicators
        </h4>
        <div className="space-y-4">
          {/* Filled Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Order Fill</span>
              <span className="font-mono">75/100</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: '75%',
                  backgroundColor: 'hsl(var(--demo-primary))',
                }}
              />
            </div>
          </div>

          {/* Multi-segment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Portfolio Allocation</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden flex"
              style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
            >
              <div className="h-full" style={{ width: '40%', backgroundColor: 'hsl(var(--demo-primary))' }} />
              <div className="h-full" style={{ width: '25%', backgroundColor: 'hsl(var(--demo-bullish))' }} />
              <div className="h-full" style={{ width: '20%', backgroundColor: 'hsl(var(--demo-accent))' }} />
              <div className="h-full" style={{ width: '15%', backgroundColor: 'hsl(var(--demo-bearish))' }} />
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-primary))' }} />
                Tech 40%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-bullish))' }} />
                Finance 25%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-accent))' }} />
                Energy 20%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-bearish))' }} />
                Other 15%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Heat Indicators */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Heat Indicators
        </h4>
        <div className="flex gap-2">
          {[
            { symbol: 'AAPL', heat: 85 },
            { symbol: 'NVDA', heat: 92 },
            { symbol: 'TSLA', heat: 45 },
            { symbol: 'MSFT', heat: 68 },
            { symbol: 'META', heat: 30 },
          ].map((item) => {
            const getHeatColor = (heat: number) => {
              if (heat >= 80) return 'hsl(var(--demo-bearish))';
              if (heat >= 60) return 'hsl(var(--demo-accent))';
              if (heat >= 40) return 'hsl(var(--demo-primary))';
              return 'hsl(var(--demo-bullish))';
            };

            return (
              <div
                key={item.symbol}
                className="demo-card p-3 text-center"
                style={{
                  borderRadius,
                  borderLeft: `3px solid ${getHeatColor(item.heat)}`,
                }}
              >
                <div className="font-mono font-bold text-sm">{item.symbol}</div>
                <div
                  className="font-mono text-lg font-bold"
                  style={{ color: getHeatColor(item.heat) }}
                >
                  {item.heat}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Volume Bars
        </h4>
        <div className="demo-card p-3" style={{ borderRadius }}>
          <div className="flex items-end gap-1 h-16">
            {[30, 45, 25, 60, 40, 80, 55, 70, 35, 90, 65, 50].map((value, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${value}%`,
                  backgroundColor:
                    i === 9
                      ? 'hsl(var(--demo-primary))'
                      : 'hsl(var(--demo-muted-foreground) / 0.3)',
                }}
              />
            ))}
          </div>
          <div
            className="flex justify-between mt-2 text-xs"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            <span>9:30</span>
            <span>12:00</span>
            <span>16:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
