'use client';

import { useState } from 'react';
import { Grid3X3, List, BarChart3, Settings, Bell, Bookmark, TrendingUp } from 'lucide-react';
import { themes } from '../themes';

interface NavigationShowcaseProps {
  themeName: string;
}

export function NavigationShowcase({ themeName }: NavigationShowcaseProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [activeSide, setActiveSide] = useState<'buy' | 'sell'>('buy');
  const [activeView, setActiveView] = useState('grid');

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Tab Bar
        </h4>
        <div className="demo-tabs">
          {['Active', 'Price', 'Smart', 'Builder'].map((tab) => (
            <button
              key={tab}
              className={`demo-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Buy/Sell Segmented Control */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Buy/Sell Toggle
        </h4>
        <div
          className="inline-flex p-1"
          style={{
            backgroundColor: 'hsl(var(--demo-muted))',
            borderRadius,
          }}
        >
          <button
            className="px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              backgroundColor:
                activeSide === 'buy'
                  ? 'hsl(var(--demo-bullish))'
                  : 'transparent',
              color:
                activeSide === 'buy'
                  ? 'white'
                  : 'hsl(var(--demo-muted-foreground))',
              borderRadius,
            }}
            onClick={() => setActiveSide('buy')}
          >
            Buy
          </button>
          <button
            className="px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              backgroundColor:
                activeSide === 'sell'
                  ? 'hsl(var(--demo-bearish))'
                  : 'transparent',
              color:
                activeSide === 'sell'
                  ? 'white'
                  : 'hsl(var(--demo-muted-foreground))',
              borderRadius,
            }}
            onClick={() => setActiveSide('sell')}
          >
            Sell
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          View Mode
        </h4>
        <div
          className="inline-flex p-1 gap-1"
          style={{
            backgroundColor: 'hsl(var(--demo-muted))',
            borderRadius,
          }}
        >
          {[
            { id: 'grid', icon: Grid3X3 },
            { id: 'list', icon: List },
            { id: 'chart', icon: BarChart3 },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              className="p-2 transition-all"
              style={{
                backgroundColor:
                  activeView === id
                    ? 'hsl(var(--demo-background))'
                    : 'transparent',
                color:
                  activeView === id
                    ? 'hsl(var(--demo-foreground))'
                    : 'hsl(var(--demo-muted-foreground))',
                borderRadius,
              }}
              onClick={() => setActiveView(id)}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Pills */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Navigation Pills
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Dashboard', icon: Grid3X3, active: true },
            { label: 'Watchlist', icon: Bookmark, active: false },
            { label: 'Alerts', icon: Bell, active: false, badge: 3 },
            { label: 'Analytics', icon: TrendingUp, active: false },
            { label: 'Settings', icon: Settings, active: false },
          ].map(({ label, icon: Icon, active, badge }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: active
                  ? 'hsl(var(--demo-primary) / 0.1)'
                  : 'transparent',
                color: active
                  ? 'hsl(var(--demo-primary))'
                  : 'hsl(var(--demo-muted-foreground))',
                borderRadius,
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && (
                <span
                  className="px-1.5 py-0.5 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--demo-destructive))',
                    color: 'white',
                    fontSize: '10px',
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Breadcrumb
        </h4>
        <nav className="flex items-center gap-2 text-sm">
          <a
            href="#"
            style={{ color: 'hsl(var(--demo-primary))' }}
            className="hover:underline"
          >
            Portfolio
          </a>
          <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>/</span>
          <a
            href="#"
            style={{ color: 'hsl(var(--demo-primary))' }}
            className="hover:underline"
          >
            Positions
          </a>
          <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>/</span>
          <span style={{ color: 'hsl(var(--demo-foreground))' }}>AAPL</span>
        </nav>
      </div>

      {/* Pagination */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Pagination
        </h4>
        <div className="flex items-center gap-1">
          <button
            className="demo-btn demo-btn-ghost demo-btn-sm"
            style={{ borderRadius }}
            disabled
          >
            Prev
          </button>
          {[1, 2, 3, '...', 10].map((page, i) => (
            <button
              key={i}
              className="demo-btn demo-btn-sm px-3"
              style={{
                backgroundColor:
                  page === 1
                    ? 'hsl(var(--demo-primary))'
                    : 'transparent',
                color:
                  page === 1
                    ? 'hsl(var(--demo-primary-foreground))'
                    : 'hsl(var(--demo-foreground))',
                borderRadius,
              }}
            >
              {page}
            </button>
          ))}
          <button
            className="demo-btn demo-btn-ghost demo-btn-sm"
            style={{ borderRadius }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
