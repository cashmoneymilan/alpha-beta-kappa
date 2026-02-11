'use client';

import { AlertTriangle, CheckCircle2, XCircle, Info, Bell, TrendingUp, Zap } from 'lucide-react';
import { themes } from '../themes';

interface AlertsShowcaseProps {
  themeName: string;
}

export function AlertsShowcase({ themeName }: AlertsShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* System Alerts */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          System Alerts
        </h4>
        <div className="space-y-3">
          {/* Success Alert */}
          <div
            className="demo-alert demo-alert-success"
            style={{ borderRadius }}
          >
            <CheckCircle2
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'hsl(var(--demo-bullish))' }}
            />
            <div>
              <div className="font-medium text-sm">Order Executed</div>
              <div
                className="text-sm mt-0.5"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                Bought 100 shares of AAPL at $175.25
              </div>
            </div>
          </div>

          {/* Error Alert */}
          <div
            className="demo-alert demo-alert-error"
            style={{ borderRadius }}
          >
            <XCircle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'hsl(var(--demo-bearish))' }}
            />
            <div>
              <div className="font-medium text-sm">Order Rejected</div>
              <div
                className="text-sm mt-0.5"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                Insufficient buying power for this order
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <div
            className="demo-alert demo-alert-warning"
            style={{ borderRadius }}
          >
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'hsl(var(--demo-accent))' }}
            />
            <div>
              <div className="font-medium text-sm">Market Closing Soon</div>
              <div
                className="text-sm mt-0.5"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                Regular trading hours end in 15 minutes
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div
            className="demo-alert"
            style={{
              borderRadius,
              backgroundColor: 'hsl(var(--demo-primary) / 0.1)',
              borderColor: 'hsl(var(--demo-primary) / 0.3)',
            }}
          >
            <Info
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'hsl(var(--demo-primary))' }}
            />
            <div>
              <div className="font-medium text-sm">Paper Trading Mode</div>
              <div
                className="text-sm mt-0.5"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                You are currently using paper trading. Switch to live mode in settings.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Notifications */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Trading Notifications
        </h4>
        <div className="space-y-3">
          {/* Price Alert Triggered */}
          <div
            className="demo-card p-3 flex items-center gap-3"
            style={{ borderRadius }}
          >
            <div
              className="p-2 rounded-full animate-pulse"
              style={{
                backgroundColor: 'hsl(var(--demo-bullish) / 0.2)',
                color: 'hsl(var(--demo-bullish))',
              }}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Price Alert Triggered</span>
                <span
                  className="text-xs"
                  style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                >
                  Just now
                </span>
              </div>
              <div
                className="text-sm"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                <span className="font-mono font-bold">NVDA</span> crossed above{' '}
                <span className="font-mono">$480.00</span>
              </div>
            </div>
            <TrendingUp
              className="w-5 h-5"
              style={{ color: 'hsl(var(--demo-bullish))' }}
            />
          </div>

          {/* Smart Money Alert */}
          <div
            className="demo-card p-3 flex items-center gap-3"
            style={{ borderRadius }}
          >
            <div
              className="p-2 rounded-full"
              style={{
                backgroundColor: 'hsl(var(--demo-accent) / 0.2)',
                color: 'hsl(var(--demo-accent))',
              }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Smart Money Flow</span>
                <span
                  className="text-xs"
                  style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                >
                  2m ago
                </span>
              </div>
              <div
                className="text-sm"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              >
                Large institutional buying detected in{' '}
                <span className="font-mono font-bold">MSFT</span>
              </div>
            </div>
            <span
              className="px-2 py-0.5 text-xs font-bold rounded"
              style={{
                backgroundColor: 'hsl(var(--demo-bullish) / 0.2)',
                color: 'hsl(var(--demo-bullish))',
                borderRadius: '4px',
              }}
            >
              +$2.4M
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Toast Notifications
        </h4>
        <div className="space-y-2">
          <div
            className="demo-card p-3 flex items-center gap-3"
            style={{
              borderRadius,
              borderLeft: '4px solid hsl(var(--demo-bullish))',
            }}
          >
            <CheckCircle2
              className="w-4 h-4"
              style={{ color: 'hsl(var(--demo-bullish))' }}
            />
            <span className="text-sm">Position opened successfully</span>
          </div>

          <div
            className="demo-card p-3 flex items-center gap-3"
            style={{
              borderRadius,
              borderLeft: '4px solid hsl(var(--demo-bearish))',
            }}
          >
            <XCircle
              className="w-4 h-4"
              style={{ color: 'hsl(var(--demo-bearish))' }}
            />
            <span className="text-sm">Connection lost. Reconnecting...</span>
          </div>

          <div
            className="demo-card p-3 flex items-center gap-3"
            style={{
              borderRadius,
              borderLeft: '4px solid hsl(var(--demo-accent))',
            }}
          >
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: 'hsl(var(--demo-accent))' }}
            />
            <span className="text-sm">Your stop loss is very close to current price</span>
          </div>
        </div>
      </div>
    </div>
  );
}
