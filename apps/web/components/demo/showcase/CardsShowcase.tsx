'use client';

import { TrendingUp, TrendingDown, AlertTriangle, Bell, Rss, Twitter } from 'lucide-react';
import { themes } from '../themes';

interface CardsShowcaseProps {
  themeName: string;
}

export function CardsShowcase({ themeName }: CardsShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Feed Item Cards */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Feed Items
        </h4>
        <div className="space-y-3">
          {/* Twitter Feed Item */}
          <div
            className="demo-card p-3"
            style={{ borderRadius }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: 'hsl(200 100% 50% / 0.1)',
                  color: 'hsl(200 100% 50%)',
                }}
              >
                <Twitter className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">@elonmusk</span>
                  <span
                    className="text-xs"
                    style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                  >
                    2m ago
                  </span>
                  <span className="demo-badge demo-badge-bullish ml-auto">
                    Bullish
                  </span>
                </div>
                <p className="text-sm line-clamp-2">
                  Tesla Cybertruck deliveries starting next week. Production
                  ramping faster than expected.
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'hsl(var(--demo-muted))',
                      borderRadius: '4px',
                    }}
                  >
                    $TSLA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RSS Feed Item */}
          <div
            className="demo-card p-3"
            style={{ borderRadius }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: 'hsl(25 100% 50% / 0.1)',
                  color: 'hsl(25 100% 50%)',
                }}
              >
                <Rss className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">Reuters</span>
                  <span
                    className="text-xs"
                    style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                  >
                    15m ago
                  </span>
                  <span className="demo-badge demo-badge-bearish ml-auto">
                    Bearish
                  </span>
                </div>
                <p className="text-sm line-clamp-2">
                  Fed signals potential rate hike in response to persistent
                  inflation data. Markets react negatively.
                </p>
                <div className="flex gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'hsl(var(--demo-muted))',
                      borderRadius: '4px',
                    }}
                  >
                    $SPY
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'hsl(var(--demo-muted))',
                      borderRadius: '4px',
                    }}
                  >
                    $QQQ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Stat Cards
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="demo-card p-4"
            style={{ borderRadius }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                Portfolio Value
              </span>
              <TrendingUp
                className="w-4 h-4"
                style={{ color: 'hsl(var(--demo-bullish))' }}
              />
            </div>
            <div className="font-mono text-2xl font-bold">$125,430</div>
            <div
              className="text-sm font-medium mt-1"
              style={{ color: 'hsl(var(--demo-bullish))' }}
            >
              +$3,245 (+2.65%)
            </div>
          </div>

          <div
            className="demo-card p-4"
            style={{ borderRadius }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                Daily P&L
              </span>
              <TrendingDown
                className="w-4 h-4"
                style={{ color: 'hsl(var(--demo-bearish))' }}
              />
            </div>
            <div className="font-mono text-2xl font-bold">-$892</div>
            <div
              className="text-sm font-medium mt-1"
              style={{ color: 'hsl(var(--demo-bearish))' }}
            >
              -0.71% today
            </div>
          </div>
        </div>
      </div>

      {/* Alert Card */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Alert Card
        </h4>
        <div
          className="demo-card p-4"
          style={{ borderRadius }}
        >
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-full"
              style={{
                backgroundColor: 'hsl(var(--demo-accent) / 0.1)',
                color: 'hsl(var(--demo-accent))',
              }}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Price Alert</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--demo-bullish) / 0.2)',
                    color: 'hsl(var(--demo-bullish))',
                  }}
                >
                  Active
                </span>
              </div>
              <p
                className="text-sm"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                AAPL crosses above $180.00
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-sm font-bold">$175.25</span>
                <span
                  className="text-xs"
                  style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                >
                  $4.75 away
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
