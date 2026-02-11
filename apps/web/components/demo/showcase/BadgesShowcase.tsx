'use client';

import { themes } from '../themes';

interface BadgesShowcaseProps {
  themeName: string;
}

export function BadgesShowcase({ themeName }: BadgesShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Sentiment Badges */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Sentiment
        </h4>
        <div className="flex flex-wrap gap-2">
          <span className="demo-badge demo-badge-bullish">
            Bullish
          </span>
          <span className="demo-badge demo-badge-bearish">
            Bearish
          </span>
          <span className="demo-badge demo-badge-neutral">
            Neutral
          </span>
        </div>
      </div>

      {/* Status Badges */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Status
        </h4>
        <div className="flex flex-wrap gap-2">
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(var(--demo-bullish) / 0.2)',
              color: 'hsl(var(--demo-bullish))',
            }}
          >
            Active
          </span>
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(var(--demo-accent) / 0.2)',
              color: 'hsl(var(--demo-accent))',
            }}
          >
            Pending
          </span>
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(var(--demo-primary) / 0.2)',
              color: 'hsl(var(--demo-primary))',
            }}
          >
            Filled
          </span>
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(var(--demo-muted))',
              color: 'hsl(var(--demo-muted-foreground))',
            }}
          >
            Cancelled
          </span>
        </div>
      </div>

      {/* Side Badges */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Order Side
        </h4>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'hsl(var(--demo-bullish))',
              color: 'hsl(var(--demo-background))',
              borderRadius: '4px',
            }}
          >
            Buy
          </span>
          <span
            className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'hsl(var(--demo-bearish))',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Sell
          </span>
          <span
            className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'hsl(var(--demo-secondary))',
              color: 'hsl(var(--demo-secondary-foreground))',
              borderRadius: '4px',
            }}
          >
            Hold
          </span>
        </div>
      </div>

      {/* Alpha Score Badges */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Alpha Score
        </h4>
        <div className="flex flex-wrap gap-2">
          {[95, 78, 62, 45, 23].map((score) => {
            const getScoreColor = () => {
              if (score >= 80) return 'hsl(var(--demo-bullish))';
              if (score >= 60) return 'hsl(var(--demo-accent))';
              if (score >= 40) return 'hsl(var(--demo-primary))';
              return 'hsl(var(--demo-bearish))';
            };

            return (
              <div
                key={score}
                className="flex items-center gap-2 px-3 py-1.5"
                style={{
                  backgroundColor: 'hsl(var(--demo-card))',
                  border: '1px solid hsl(var(--demo-border))',
                  borderRadius,
                }}
              >
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getScoreColor(),
                    }}
                  />
                </div>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: getScoreColor() }}
                >
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticker Badges */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Tickers
        </h4>
        <div className="flex flex-wrap gap-2">
          {['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL'].map((ticker) => (
            <span
              key={ticker}
              className="px-2 py-1 font-mono text-xs font-bold"
              style={{
                backgroundColor: 'hsl(var(--demo-muted))',
                color: 'hsl(var(--demo-foreground))',
                borderRadius: '4px',
              }}
            >
              ${ticker}
            </span>
          ))}
        </div>
      </div>

      {/* Source Type Badges */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Source Types
        </h4>
        <div className="flex flex-wrap gap-2">
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(200 100% 50% / 0.2)',
              color: 'hsl(200 100% 50%)',
            }}
          >
            Twitter
          </span>
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(25 100% 50% / 0.2)',
              color: 'hsl(25 100% 50%)',
            }}
          >
            RSS
          </span>
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(270 100% 60% / 0.2)',
              color: 'hsl(270 100% 60%)',
            }}
          >
            News
          </span>
          <span
            className="demo-badge"
            style={{
              backgroundColor: 'hsl(142 71% 45% / 0.2)',
              color: 'hsl(142 71% 45%)',
            }}
          >
            SEC Filing
          </span>
        </div>
      </div>
    </div>
  );
}
