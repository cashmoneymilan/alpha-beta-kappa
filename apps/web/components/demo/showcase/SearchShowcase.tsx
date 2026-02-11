'use client';

import { useState } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Hash,
  Terminal,
  Clock,
  ArrowRight,
  Zap,
  BarChart2,
  Globe,
  Bookmark,
} from 'lucide-react';
import { themes } from '../themes';

interface SearchShowcaseProps {
  themeName: string;
}

export function SearchShowcase({ themeName }: SearchShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'symbols' | 'themes' | 'commands'>('symbols');
  const [query, setQuery] = useState('NVD');

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  const symbolResults = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 485.30, change: 5.1, volume: '42.3M' },
    { symbol: 'NVO', name: 'Novo Nordisk A/S', price: 125.40, change: 1.8, volume: '8.2M' },
    { symbol: 'NVS', name: 'Novartis AG', price: 98.75, change: -0.5, volume: '3.1M' },
  ];

  const recentSearches = [
    { query: 'NVDA', type: 'symbol' },
    { query: 'Fed meeting', type: 'news' },
    { query: 'AI stocks', type: 'theme' },
  ];

  const quickActions = [
    { icon: BarChart2, label: 'Add to watchlist', shortcut: 'W' },
    { icon: Zap, label: 'Set alert', shortcut: 'A' },
    { icon: Globe, label: 'Open in new tile', shortcut: 'T' },
  ];

  return (
    <div className="space-y-5">
      {/* Integrated Search Bar - Always visible, no overlay */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Integrated Search
        </h4>

        {/* Main Search Container - Inline, not overlay */}
        <div
          className="demo-card overflow-hidden"
          style={{ borderRadius }}
        >
          {/* Search Input Row */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid hsl(var(--demo-border))' }}
          >
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--demo-primary))' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbols, themes, commands..."
              className="flex-1 bg-transparent text-sm outline-none font-medium"
              style={{ color: 'hsl(var(--demo-foreground))' }}
            />
            <div className="flex items-center gap-2">
              <kbd
                className="px-2 py-1 text-[10px] font-mono rounded"
                style={{
                  backgroundColor: 'hsl(var(--demo-muted))',
                  color: 'hsl(var(--demo-muted-foreground))',
                  border: '1px solid hsl(var(--demo-border))',
                }}
              >
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex items-center px-2 py-1.5 gap-1"
            style={{ backgroundColor: 'hsl(var(--demo-muted) / 0.3)' }}
          >
            {[
              { id: 'symbols', label: 'Symbols', icon: TrendingUp },
              { id: 'themes', label: 'Themes', icon: Hash },
              { id: 'commands', label: 'Commands', icon: Terminal },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeTab === id ? 'hsl(var(--demo-primary))' : 'transparent',
                  color: activeTab === id
                    ? 'hsl(var(--demo-primary-foreground))'
                    : 'hsl(var(--demo-muted-foreground))',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Results Area - Inline */}
          <div className="p-2">
            {activeTab === 'symbols' && (
              <div className="space-y-1">
                {symbolResults.map((result, i) => (
                  <div
                    key={result.symbol}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                    style={{
                      backgroundColor: i === 0 ? 'hsl(var(--demo-primary) / 0.1)' : 'transparent',
                      border: i === 0 ? '1px solid hsl(var(--demo-primary) / 0.2)' : '1px solid transparent',
                    }}
                  >
                    {/* Symbol Badge */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                      style={{
                        backgroundColor: 'hsl(var(--demo-muted))',
                        color: 'hsl(var(--demo-foreground))',
                      }}
                    >
                      {result.symbol.slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{result.symbol}</span>
                        <span
                          className="text-xs truncate"
                          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                        >
                          {result.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                          Vol: {result.volume}
                        </span>
                      </div>
                    </div>

                    {/* Price & Change */}
                    <div className="text-right">
                      <div className="font-mono font-medium">${result.price.toFixed(2)}</div>
                      <div
                        className="flex items-center justify-end gap-1 text-xs font-medium"
                        style={{
                          color: result.change >= 0
                            ? 'hsl(var(--demo-bullish))'
                            : 'hsl(var(--demo-bearish))',
                        }}
                      >
                        {result.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {result.change >= 0 ? '+' : ''}{result.change}%
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 opacity-30" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-1">
                {[
                  { name: 'AI Infrastructure', count: 24, momentum: 'up' },
                  { name: 'Rate Cut Plays', count: 18, momentum: 'up' },
                  { name: 'China Tech', count: 12, momentum: 'down' },
                ].map((theme, i) => (
                  <div
                    key={theme.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                    style={{
                      backgroundColor: i === 0 ? 'hsl(var(--demo-accent) / 0.1)' : 'transparent',
                    }}
                  >
                    <Hash className="w-5 h-5" style={{ color: 'hsl(var(--demo-accent))' }} />
                    <span className="flex-1 font-medium">{theme.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'hsl(var(--demo-muted))',
                        color: 'hsl(var(--demo-muted-foreground))',
                      }}
                    >
                      {theme.count} stocks
                    </span>
                    {theme.momentum === 'up' ? (
                      <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--demo-bullish))' }} />
                    ) : (
                      <TrendingDown className="w-4 h-4" style={{ color: 'hsl(var(--demo-bearish))' }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'commands' && (
              <div className="space-y-1">
                {[
                  { cmd: 'goto', desc: 'Navigate to symbol', shortcut: 'G S' },
                  { cmd: 'alert', desc: 'Create price alert', shortcut: 'C A' },
                  { cmd: 'layout', desc: 'Toggle layout mode', shortcut: 'L' },
                  { cmd: 'theme', desc: 'Switch theme', shortcut: 'T' },
                ].map((item, i) => (
                  <div
                    key={item.cmd}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer hover:bg-white/5"
                  >
                    <Terminal className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                    <span className="font-mono text-sm">{item.cmd}</span>
                    <span className="flex-1 text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                      {item.desc}
                    </span>
                    <kbd
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded"
                      style={{
                        backgroundColor: 'hsl(var(--demo-muted))',
                        color: 'hsl(var(--demo-muted-foreground))',
                      }}
                    >
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              borderTop: '1px solid hsl(var(--demo-border))',
              backgroundColor: 'hsl(var(--demo-muted) / 0.2)',
            }}
          >
            <div className="flex items-center gap-4 text-[10px]" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ backgroundColor: 'hsl(var(--demo-muted))' }}>↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ backgroundColor: 'hsl(var(--demo-muted))' }}>↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ backgroundColor: 'hsl(var(--demo-muted))' }}>Tab</kbd>
                Switch
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Inline Search */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Compact Inline
        </h4>
        <div className="flex gap-3">
          {/* Mini search */}
          <div
            className="flex items-center gap-2 px-3 py-2 flex-1"
            style={{
              backgroundColor: 'hsl(var(--demo-muted))',
              borderRadius,
              border: '1px solid hsl(var(--demo-border))',
            }}
          >
            <Search className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
            <span className="text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
              Quick search...
            </span>
            <kbd
              className="ml-auto px-1.5 py-0.5 text-[10px] rounded"
              style={{
                backgroundColor: 'hsl(var(--demo-background))',
                color: 'hsl(var(--demo-muted-foreground))',
              }}
            >
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Recent & Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Recent Searches */}
        <div
          className="demo-card p-3"
          style={{ borderRadius }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
            <span className="text-xs font-medium" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
              Recent
            </span>
          </div>
          <div className="space-y-1.5">
            {recentSearches.map((item) => (
              <div
                key={item.query}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-all hover:bg-white/5"
              >
                {item.type === 'symbol' && <TrendingUp className="w-3 h-3" style={{ color: 'hsl(var(--demo-primary))' }} />}
                {item.type === 'news' && <Globe className="w-3 h-3" style={{ color: 'hsl(var(--demo-accent))' }} />}
                {item.type === 'theme' && <Hash className="w-3 h-3" style={{ color: 'hsl(var(--demo-bullish))' }} />}
                <span>{item.query}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="demo-card p-3"
          style={{ borderRadius }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
            <span className="text-xs font-medium" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
              Quick Actions
            </span>
          </div>
          <div className="space-y-1.5">
            {quickActions.map((action) => (
              <div
                key={action.label}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-all hover:bg-white/5"
              >
                <action.icon className="w-3 h-3" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                <span className="flex-1">{action.label}</span>
                <kbd
                  className="px-1 py-0.5 text-[9px] rounded"
                  style={{
                    backgroundColor: 'hsl(var(--demo-muted))',
                    color: 'hsl(var(--demo-muted-foreground))',
                  }}
                >
                  {action.shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Symbol Preview Card */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Symbol Preview
        </h4>
        <div
          className="demo-card p-4"
          style={{ borderRadius }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg"
              style={{
                backgroundColor: 'hsl(var(--demo-primary) / 0.15)',
                color: 'hsl(var(--demo-primary))',
              }}
            >
              NV
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-lg">NVDA</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: 'hsl(var(--demo-bullish) / 0.15)',
                    color: 'hsl(var(--demo-bullish))',
                  }}
                >
                  +5.1%
                </span>
              </div>
              <div className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                NVIDIA Corporation · NASDAQ
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <div className="text-xl font-bold">$485.30</div>
                  <div className="text-[10px]" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                    Vol: 42.3M
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    className="p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: 'hsl(var(--demo-muted))',
                      color: 'hsl(var(--demo-muted-foreground))',
                    }}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: 'hsl(var(--demo-primary))',
                      color: 'hsl(var(--demo-primary-foreground))',
                    }}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
