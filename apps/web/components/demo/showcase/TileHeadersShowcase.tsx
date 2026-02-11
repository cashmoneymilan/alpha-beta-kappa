'use client';

import {
  TrendingUp,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  Filter,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { themes } from '../themes';

interface TileHeadersShowcaseProps {
  themeName: string;
}

export function TileHeadersShowcase({ themeName }: TileHeadersShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Standard Tile Header */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Standard Header
        </h4>
        <div className="demo-card" style={{ borderRadius }}>
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: 'hsl(var(--demo-border))' }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
              <span className="text-sm font-semibold">Positions</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-white/5">
                <RefreshCw className="w-3.5 h-3.5" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
              </button>
              <button className="p-1.5 rounded hover:bg-white/5">
                <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
              </button>
            </div>
          </div>
          <div className="p-4 text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
            Tile content area
          </div>
        </div>
      </div>

      {/* Header with Badge */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          With Count Badge
        </h4>
        <div className="demo-card" style={{ borderRadius }}>
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: 'hsl(var(--demo-border))' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Open Orders</span>
              <span
                className="px-1.5 py-0.5 text-xs font-bold rounded"
                style={{
                  backgroundColor: 'hsl(var(--demo-primary) / 0.2)',
                  color: 'hsl(var(--demo-primary))',
                }}
              >
                4
              </span>
            </div>
            <button className="p-1.5 rounded hover:bg-white/5">
              <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
            </button>
          </div>
          <div className="p-4 text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
            Tile content area
          </div>
        </div>
      </div>

      {/* Header with Tabs */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          With Tabs
        </h4>
        <div className="demo-card" style={{ borderRadius }}>
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: 'hsl(var(--demo-border))' }}
          >
            <div className="flex items-center gap-1">
              {['All', 'Open', 'Filled'].map((tab, i) => (
                <button
                  key={tab}
                  className="px-2.5 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: i === 0 ? 'hsl(var(--demo-primary) / 0.1)' : 'transparent',
                    color: i === 0 ? 'hsl(var(--demo-primary))' : 'hsl(var(--demo-muted-foreground))',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="p-1.5 rounded hover:bg-white/5">
              <Filter className="w-3.5 h-3.5" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
            </button>
          </div>
          <div className="p-4 text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
            Tile content area
          </div>
        </div>
      </div>

      {/* Collapsible Header */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Collapsible
        </h4>
        <div className="demo-card" style={{ borderRadius }}>
          <button
            className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
              <span className="text-sm font-semibold">Advanced Settings</span>
            </div>
            <span
              className="text-xs"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Click to expand
            </span>
          </button>
        </div>
      </div>

      {/* Floating/Detached Header */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Floating Window
        </h4>
        <div className="demo-card" style={{ borderRadius }}>
          <div
            className="flex items-center justify-between px-3 py-2 border-b cursor-move"
            style={{
              backgroundColor: 'hsl(var(--demo-muted) / 0.5)',
              borderColor: 'hsl(var(--demo-border))',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Order Book - AAPL</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="p-1.5 rounded hover:bg-white/10">
                <Minimize2 className="w-3 h-3" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
              </button>
              <button className="p-1.5 rounded hover:bg-white/10">
                <Maximize2 className="w-3 h-3" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
              </button>
              <button className="p-1.5 rounded hover:bg-red-500/20">
                <X className="w-3 h-3" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
              </button>
            </div>
          </div>
          <div className="p-4 text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
            Tile content area
          </div>
        </div>
      </div>

      {/* Accent Header */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Accent/Alert Header
        </h4>
        <div className="demo-card overflow-hidden" style={{ borderRadius }}>
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{
              backgroundColor: 'hsl(var(--demo-bullish) / 0.15)',
              borderBottom: '1px solid hsl(var(--demo-bullish) / 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'hsl(var(--demo-bullish))' }}
              />
              <span className="text-sm font-semibold">Live Trading</span>
            </div>
            <span
              className="text-xs font-mono"
              style={{ color: 'hsl(var(--demo-bullish))' }}
            >
              Connected
            </span>
          </div>
          <div className="p-4 text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
            Tile content area
          </div>
        </div>
      </div>
    </div>
  );
}
