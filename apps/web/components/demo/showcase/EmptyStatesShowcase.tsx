'use client';

import { Inbox, Search, AlertCircle, WifiOff, FileX, Plus, RefreshCw } from 'lucide-react';
import { themes } from '../themes';

interface EmptyStatesShowcaseProps {
  themeName: string;
}

export function EmptyStatesShowcase({ themeName }: EmptyStatesShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* No Data */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          No Data
        </h4>
        <div
          className="demo-card p-8 text-center"
          style={{ borderRadius }}
        >
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
          >
            <Inbox className="w-6 h-6" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
          </div>
          <h3 className="font-semibold mb-1">No positions yet</h3>
          <p
            className="text-sm mb-4"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            Your open positions will appear here
          </p>
          <button
            className="demo-btn demo-btn-primary demo-btn-sm"
            style={{ borderRadius }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Open a Position
          </button>
        </div>
      </div>

      {/* No Search Results */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          No Search Results
        </h4>
        <div
          className="demo-card p-6 text-center"
          style={{ borderRadius }}
        >
          <Search
            className="w-8 h-8 mx-auto mb-3"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          />
          <h3 className="font-semibold mb-1">No results for &quot;XYZ123&quot;</h3>
          <p
            className="text-sm"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            Try a different search term or check the spelling
          </p>
        </div>
      </div>

      {/* Error State */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Error State
        </h4>
        <div
          className="demo-card p-6 text-center"
          style={{
            borderRadius,
            borderColor: 'hsl(var(--demo-destructive) / 0.3)',
          }}
        >
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--demo-destructive) / 0.1)' }}
          >
            <AlertCircle
              className="w-6 h-6"
              style={{ color: 'hsl(var(--demo-destructive))' }}
            />
          </div>
          <h3 className="font-semibold mb-1">Failed to load data</h3>
          <p
            className="text-sm mb-4"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            There was an error connecting to the server
          </p>
          <button
            className="demo-btn demo-btn-secondary demo-btn-sm"
            style={{ borderRadius }}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Try Again
          </button>
        </div>
      </div>

      {/* Offline State */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Offline
        </h4>
        <div
          className="demo-card p-4 flex items-center gap-3"
          style={{
            borderRadius,
            backgroundColor: 'hsl(var(--demo-accent) / 0.1)',
            borderColor: 'hsl(var(--demo-accent) / 0.3)',
          }}
        >
          <WifiOff className="w-5 h-5" style={{ color: 'hsl(var(--demo-accent))' }} />
          <div className="flex-1">
            <p className="text-sm font-medium">You&apos;re offline</p>
            <p
              className="text-xs"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Showing cached data. Some features may be unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* Empty File/List */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Empty List Compact
        </h4>
        <div
          className="demo-card p-4 flex items-center justify-center gap-2"
          style={{ borderRadius }}
        >
          <FileX className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
          <span
            className="text-sm"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            No alerts configured
          </span>
        </div>
      </div>
    </div>
  );
}
