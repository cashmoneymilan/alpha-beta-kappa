'use client';

import { useState } from 'react';
import { ChevronDown, Check, Search, MoreHorizontal, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import { themes } from '../themes';

interface DropdownsShowcaseProps {
  themeName: string;
}

export function DropdownsShowcase({ themeName }: DropdownsShowcaseProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  const symbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'AMD'];
  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

  const filteredSymbols = symbols.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Select Dropdown */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Select Dropdown
        </h4>
        <div className="flex gap-3">
          {/* Symbol Select */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'symbol' ? null : 'symbol')}
              className="demo-input flex items-center justify-between gap-2 w-32"
              style={{ borderRadius }}
            >
              <span className="font-mono font-bold">{selectedSymbol}</span>
              <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
            </button>
            {openDropdown === 'symbol' && (
              <div
                className="absolute top-full left-0 mt-1 w-48 z-10 demo-card py-1 shadow-lg"
                style={{ borderRadius }}
              >
                <div className="px-2 pb-2">
                  <div className="relative">
                    <Search
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
                      style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="demo-input pl-7 text-xs h-8"
                      style={{ borderRadius }}
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => {
                        setSelectedSymbol(symbol);
                        setOpenDropdown(null);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-white/5"
                    >
                      <span className="font-mono">{symbol}</span>
                      {symbol === selectedSymbol && (
                        <Check className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Select */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'timeframe' ? null : 'timeframe')}
              className="demo-input flex items-center justify-between gap-2 w-24"
              style={{ borderRadius }}
            >
              <span>{selectedTimeframe}</span>
              <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
            </button>
            {openDropdown === 'timeframe' && (
              <div
                className="absolute top-full left-0 mt-1 w-24 z-10 demo-card py-1 shadow-lg"
                style={{ borderRadius }}
              >
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setSelectedTimeframe(tf);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm flex items-center justify-between hover:bg-white/5"
                  >
                    <span>{tf}</span>
                    {tf === selectedTimeframe && (
                      <Check className="w-3 h-3" style={{ color: 'hsl(var(--demo-primary))' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Context Menu
        </h4>
        <div className="relative inline-block">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'context' ? null : 'context')}
            className="demo-btn demo-btn-ghost demo-btn-sm"
            style={{ borderRadius }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {openDropdown === 'context' && (
            <div
              className="absolute top-full left-0 mt-1 w-48 z-10 demo-card py-1 shadow-lg"
              style={{ borderRadius }}
            >
              <button className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5">
                <Edit className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                Edit Alert
              </button>
              <button className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5">
                <Copy className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                Duplicate
              </button>
              <button className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5">
                <ExternalLink className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                Open in Chart
              </button>
              <div
                className="my-1 border-t"
                style={{ borderColor: 'hsl(var(--demo-border))' }}
              />
              <button
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5"
                style={{ color: 'hsl(var(--demo-destructive))' }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Select Tags */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Multi-Select Tags
        </h4>
        <div
          className="flex flex-wrap gap-2 p-3 demo-card"
          style={{ borderRadius }}
        >
          {['Tech', 'Earnings', 'FDA'].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded"
              style={{
                backgroundColor: 'hsl(var(--demo-primary) / 0.2)',
                color: 'hsl(var(--demo-primary))',
              }}
            >
              {tag}
              <button className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            className="px-2 py-1 text-xs rounded hover:bg-white/5"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            + Add tag
          </button>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
