'use client';

import { useState } from 'react';
import { Info, HelpCircle, AlertTriangle } from 'lucide-react';
import { themes } from '../themes';

interface TooltipsShowcaseProps {
  themeName: string;
}

export function TooltipsShowcase({ themeName }: TooltipsShowcaseProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Simple Tooltips */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Tooltips
        </h4>
        <div className="flex gap-6">
          {/* Top */}
          <div className="relative">
            <button
              className="demo-btn demo-btn-secondary demo-btn-sm"
              style={{ borderRadius }}
              onMouseEnter={() => setActiveTooltip('top')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              Hover (Top)
            </button>
            {activeTooltip === 'top' && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs whitespace-nowrap"
                style={{
                  backgroundColor: 'hsl(var(--demo-foreground))',
                  color: 'hsl(var(--demo-background))',
                  borderRadius: '4px',
                }}
              >
                Tooltip on top
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid hsl(var(--demo-foreground))',
                  }}
                />
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="relative">
            <button
              className="demo-btn demo-btn-secondary demo-btn-sm"
              style={{ borderRadius }}
              onMouseEnter={() => setActiveTooltip('bottom')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              Hover (Bottom)
            </button>
            {activeTooltip === 'bottom' && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs whitespace-nowrap"
                style={{
                  backgroundColor: 'hsl(var(--demo-foreground))',
                  color: 'hsl(var(--demo-background))',
                  borderRadius: '4px',
                }}
              >
                Tooltip on bottom
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid hsl(var(--demo-foreground))',
                  }}
                />
              </div>
            )}
          </div>

          {/* Icon tooltip */}
          <div className="relative flex items-center gap-2">
            <span className="text-sm">Alpha Score</span>
            <button
              onMouseEnter={() => setActiveTooltip('icon')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <HelpCircle
                className="w-4 h-4"
                style={{ color: 'hsl(var(--demo-muted-foreground))' }}
              />
            </button>
            {activeTooltip === 'icon' && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 text-xs w-48"
                style={{
                  backgroundColor: 'hsl(var(--demo-card))',
                  border: '1px solid hsl(var(--demo-border))',
                  borderRadius,
                }}
              >
                Measures predictive accuracy based on historical performance (0-100)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Popovers */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Info Popovers
        </h4>
        <div className="flex gap-4">
          {/* Click popover */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm"
              style={{
                backgroundColor: 'hsl(var(--demo-muted))',
                borderRadius,
              }}
              onClick={() => setActivePopover(activePopover === 'info' ? null : 'info')}
            >
              <Info className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
              Position Details
            </button>
            {activePopover === 'info' && (
              <div
                className="absolute top-full left-0 mt-2 w-64 p-4 demo-card shadow-lg z-10"
                style={{ borderRadius }}
              >
                <h4 className="font-semibold mb-2">AAPL Position</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Shares</span>
                    <span className="font-mono">100</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Avg Cost</span>
                    <span className="font-mono">$168.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Market Value</span>
                    <span className="font-mono">$17,525.00</span>
                  </div>
                  <div
                    className="flex justify-between pt-2 border-t"
                    style={{ borderColor: 'hsl(var(--demo-border))' }}
                  >
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Total P&L</span>
                    <span className="font-mono" style={{ color: 'hsl(var(--demo-bullish))' }}>+$675.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Warning popover */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm"
              style={{
                backgroundColor: 'hsl(var(--demo-accent) / 0.1)',
                color: 'hsl(var(--demo-accent))',
                borderRadius,
              }}
              onClick={() => setActivePopover(activePopover === 'warning' ? null : 'warning')}
            >
              <AlertTriangle className="w-4 h-4" />
              Risk Warning
            </button>
            {activePopover === 'warning' && (
              <div
                className="absolute top-full left-0 mt-2 w-64 p-4 demo-card shadow-lg z-10"
                style={{
                  borderRadius,
                  borderColor: 'hsl(var(--demo-accent) / 0.3)',
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: 'hsl(var(--demo-accent))' }} />
                  <h4 className="font-semibold">High Volatility</h4>
                </div>
                <p
                  className="text-sm"
                  style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                >
                  This stock has shown 45% higher volatility than its sector average over the past 30 days.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Cards */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Hover Card
        </h4>
        <div className="relative inline-block">
          <button
            className="font-mono font-bold px-2 py-1 rounded hover:bg-white/5"
            style={{ color: 'hsl(var(--demo-primary))' }}
            onMouseEnter={() => setActiveTooltip('card')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            @elonmusk
          </button>
          {activeTooltip === 'card' && (
            <div
              className="absolute top-full left-0 mt-2 w-72 p-4 demo-card shadow-lg z-10"
              style={{ borderRadius }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
                >
                  E
                </div>
                <div>
                  <h4 className="font-semibold">Elon Musk</h4>
                  <p
                    className="text-sm"
                    style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                  >
                    @elonmusk
                  </p>
                </div>
              </div>
              <div
                className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-center text-sm"
                style={{ borderColor: 'hsl(var(--demo-border))' }}
              >
                <div>
                  <div className="font-bold">87</div>
                  <div style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Alpha</div>
                </div>
                <div>
                  <div className="font-bold">72%</div>
                  <div style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Hit Rate</div>
                </div>
                <div>
                  <div className="font-bold" style={{ color: 'hsl(var(--demo-bullish))' }}>+4.2%</div>
                  <div style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Avg Return</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
