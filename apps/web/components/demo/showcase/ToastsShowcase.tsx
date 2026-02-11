'use client';

import { useState } from 'react';
import { Check, X, AlertTriangle, Info, TrendingUp, TrendingDown, Zap, Bell } from 'lucide-react';
import { getThemeStyles } from '../themes';

interface ToastsShowcaseProps {
  themeName: string;
}

export function ToastsShowcase({ themeName }: ToastsShowcaseProps) {
  const theme = getThemeStyles(themeName);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const baseToastStyle = {
    background: `hsl(${theme.colors['--demo-card']})`,
    border: `1px solid hsl(${theme.colors['--demo-border']})`,
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  };

  const titleStyle = {
    color: `hsl(${theme.colors['--demo-foreground']})`,
    fontSize: '13px',
    fontWeight: '600',
  };

  const descStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '12px',
  };

  const timeStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '10px',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const closeButtonStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
  };

  const toasts = [
    {
      id: 'success',
      icon: Check,
      iconBg: theme.colors['--demo-bullish'],
      title: 'Order Filled',
      description: 'AAPL - 100 shares @ $178.50',
      time: 'Just now',
      action: 'View Order',
    },
    {
      id: 'error',
      icon: X,
      iconBg: theme.colors['--demo-bearish'],
      title: 'Order Rejected',
      description: 'Insufficient buying power',
      time: '2m ago',
      action: 'Retry',
    },
    {
      id: 'warning',
      icon: AlertTriangle,
      iconBg: theme.colors['--demo-accent'],
      title: 'Margin Warning',
      description: 'Account approaching margin call threshold',
      time: '5m ago',
      action: 'Deposit',
    },
    {
      id: 'info',
      icon: Info,
      iconBg: theme.colors['--demo-primary'],
      title: 'Market Closing',
      description: 'US markets close in 15 minutes',
      time: '10m ago',
    },
  ];

  const tradingToasts = [
    {
      id: 'price-up',
      icon: TrendingUp,
      iconColor: theme.colors['--demo-bullish'],
      symbol: 'NVDA',
      message: 'broke above $500 resistance',
      price: '$502.34',
      change: '+2.4%',
      changeColor: theme.colors['--demo-bullish'],
    },
    {
      id: 'price-down',
      icon: TrendingDown,
      iconColor: theme.colors['--demo-bearish'],
      symbol: 'TSLA',
      message: 'hit stop loss at',
      price: '$245.00',
      change: '-3.1%',
      changeColor: theme.colors['--demo-bearish'],
    },
    {
      id: 'alert',
      icon: Zap,
      iconColor: theme.colors['--demo-accent'],
      symbol: 'AMZN',
      message: 'unusual options activity',
      price: '$178.92',
      change: '+0.8%',
      changeColor: theme.colors['--demo-bullish'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Standard Toasts */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }}>
          Standard Notifications
        </div>
        {toasts.filter(t => !dismissed.includes(t.id)).map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 p-3"
            style={baseToastStyle}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded flex-shrink-0"
              style={{ background: `hsl(${toast.iconBg} / 0.15)` }}
            >
              <toast.icon className="w-4 h-4" style={{ color: `hsl(${toast.iconBg})` }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span style={titleStyle}>{toast.title}</span>
                <span style={timeStyle}>{toast.time}</span>
              </div>
              <div style={descStyle} className="mt-0.5">{toast.description}</div>
              {toast.action && (
                <button
                  className="mt-2 text-xs font-medium"
                  style={{ color: `hsl(${theme.colors['--demo-primary']})` }}
                >
                  {toast.action}
                </button>
              )}
            </div>
            <button
              onClick={() => setDismissed([...dismissed, toast.id])}
              className="flex-shrink-0 p-1 hover:opacity-70"
              style={closeButtonStyle}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Trading-Specific Toasts */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }}>
          Trading Alerts
        </div>
        {tradingToasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 p-3"
            style={baseToastStyle}
          >
            <toast.icon className="w-5 h-5 flex-shrink-0" style={{ color: `hsl(${toast.iconColor})` }} />
            <div className="flex-1 min-w-0">
              <span
                className="font-bold mr-1"
                style={{ color: `hsl(${theme.colors['--demo-foreground']})`, fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '13px' }}
              >
                {toast.symbol}
              </span>
              <span style={descStyle}>{toast.message}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <div style={{ ...titleStyle, fontFamily: "'Consolas', 'Monaco', monospace" }}>{toast.price}</div>
              <div style={{ color: `hsl(${toast.changeColor})`, fontSize: '11px', fontFamily: "'Consolas', 'Monaco', monospace" }}>
                {toast.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Toast */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }}>
          Compact Style
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ ...baseToastStyle, borderLeft: `3px solid hsl(${theme.colors['--demo-bullish']})` }}
        >
          <Bell className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-bullish']})` }} />
          <span style={{ ...descStyle, color: `hsl(${theme.colors['--demo-foreground']})` }}>
            <span className="font-bold">GOOGL</span> limit order filled at $141.25
          </span>
          <span className="ml-auto" style={timeStyle}>now</span>
        </div>
      </div>

      {/* Toast with Progress */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }}>
          With Auto-Dismiss
        </div>
        <div
          className="relative overflow-hidden"
          style={baseToastStyle}
        >
          <div className="flex items-center gap-3 p-3">
            <Info className="w-5 h-5" style={{ color: `hsl(${theme.colors['--demo-primary']})` }} />
            <span style={descStyle}>Syncing portfolio data...</span>
          </div>
          <div
            className="absolute bottom-0 left-0 h-1 animate-pulse"
            style={{
              background: `hsl(${theme.colors['--demo-primary']})`,
              width: '60%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
