'use client';

import { useState } from 'react';
import {
  Search,
  Command,
  TrendingUp,
  Bell,
  Settings,
  LayoutGrid,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react';
import { themes } from '../themes';

interface CommandPaletteShowcaseProps {
  themeName: string;
}

export function CommandPaletteShowcase({ themeName }: CommandPaletteShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  const recentSearches = ['NVDA', 'TSLA earnings', 'Fed meeting'];

  const commands = [
    { icon: TrendingUp, label: 'Go to Symbol', shortcut: 'G S', category: 'Navigation' },
    { icon: Bell, label: 'Create Alert', shortcut: 'C A', category: 'Actions' },
    { icon: LayoutGrid, label: 'Toggle Layout', shortcut: 'T L', category: 'View' },
    { icon: Settings, label: 'Open Settings', shortcut: ',', category: 'Navigation' },
  ];

  const symbols = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.25, change: 2.4 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.30, change: 5.1 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change: -1.8 },
  ];

  const filteredCommands = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const filteredSymbols = query
    ? symbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Trigger Button */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Command Palette
        </h4>
        <button
          onClick={() => setIsOpen(true)}
          className="demo-input flex items-center gap-2 w-64"
          style={{ borderRadius }}
        >
          <Search className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
          <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Search or type command...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: 'hsl(var(--demo-muted))',
                color: 'hsl(var(--demo-muted-foreground))',
              }}
            >
              <Command className="w-3 h-3 inline" />
            </kbd>
            <kbd
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: 'hsl(var(--demo-muted))',
                color: 'hsl(var(--demo-muted-foreground))',
              }}
            >
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Command Palette Preview */}
      <div
        className="relative min-h-[320px] overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--demo-background) / 0.5)',
          borderRadius,
          border: '1px dashed hsl(var(--demo-border))',
        }}
      >
        {isOpen && (
          <div
            className="absolute inset-0 flex items-start justify-center pt-8 px-4"
            style={{ backgroundColor: 'hsl(0 0% 0% / 0.6)' }}
            onClick={() => setIsOpen(false)}
          >
            <div
              className="demo-card w-full max-w-md overflow-hidden shadow-2xl"
              style={{ borderRadius }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: 'hsl(var(--demo-border))' }}
              >
                <Search className="w-5 h-5" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                <input
                  type="text"
                  placeholder="Search symbols, commands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'hsl(var(--demo-foreground))' }}
                  autoFocus
                />
                <kbd
                  className="px-1.5 py-0.5 text-xs rounded"
                  style={{
                    backgroundColor: 'hsl(var(--demo-muted))',
                    color: 'hsl(var(--demo-muted-foreground))',
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {/* Recent Searches (when no query) */}
                {!query && (
                  <div className="p-2">
                    <div
                      className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                    >
                      Recent
                    </div>
                    {recentSearches.map((search, i) => (
                      <button
                        key={search}
                        className="w-full px-2 py-2 flex items-center gap-3 rounded text-sm hover:bg-white/5"
                        style={{
                          backgroundColor: i === 0 ? 'hsl(var(--demo-primary) / 0.1)' : undefined,
                        }}
                      >
                        <Clock className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Symbols Results */}
                {filteredSymbols.length > 0 && (
                  <div className="p-2">
                    <div
                      className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                    >
                      Symbols
                    </div>
                    {filteredSymbols.map((s, i) => (
                      <button
                        key={s.symbol}
                        className="w-full px-2 py-2 flex items-center gap-3 rounded text-sm hover:bg-white/5"
                        style={{
                          backgroundColor: selectedIndex === i ? 'hsl(var(--demo-primary) / 0.1)' : undefined,
                        }}
                      >
                        <Star className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                        <div className="flex-1 text-left">
                          <span className="font-mono font-bold">{s.symbol}</span>
                          <span
                            className="ml-2 text-xs"
                            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                          >
                            {s.name}
                          </span>
                        </div>
                        <span
                          className="font-mono text-xs"
                          style={{
                            color: s.change >= 0 ? 'hsl(var(--demo-bullish))' : 'hsl(var(--demo-bearish))',
                          }}
                        >
                          {s.change >= 0 ? '+' : ''}{s.change}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Commands */}
                <div className="p-2">
                  <div
                    className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                  >
                    Commands
                  </div>
                  {filteredCommands.map((cmd, i) => (
                    <button
                      key={cmd.label}
                      className="w-full px-2 py-2 flex items-center gap-3 rounded text-sm hover:bg-white/5"
                    >
                      <cmd.icon className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                      <span className="flex-1 text-left">{cmd.label}</span>
                      <kbd
                        className="px-1.5 py-0.5 text-xs rounded"
                        style={{
                          backgroundColor: 'hsl(var(--demo-muted))',
                          color: 'hsl(var(--demo-muted-foreground))',
                        }}
                      >
                        {cmd.shortcut}
                      </kbd>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-4 py-2 border-t text-xs"
                style={{
                  borderColor: 'hsl(var(--demo-border))',
                  color: 'hsl(var(--demo-muted-foreground))',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--demo-muted))' }}>↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--demo-muted))' }}>↵</kbd>
                    Select
                  </span>
                </div>
                <span>Type to search</span>
              </div>
            </div>
          </div>
        )}

        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-sm"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Click the search button above to preview
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
