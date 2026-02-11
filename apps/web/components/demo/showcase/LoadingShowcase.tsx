'use client';

import { themes } from '../themes';

interface LoadingShowcaseProps {
  themeName: string;
}

export function LoadingShowcase({ themeName }: LoadingShowcaseProps) {
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Spinners */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Spinners
        </h4>
        <div className="flex items-center gap-6">
          {/* Simple Spinner */}
          <div className="text-center">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
              style={{
                borderColor: 'hsl(var(--demo-muted))',
                borderTopColor: 'hsl(var(--demo-primary))',
              }}
            />
            <span
              className="text-xs mt-2 block"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Default
            </span>
          </div>

          {/* Dots */}
          <div className="text-center">
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'hsl(var(--demo-primary))',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span
              className="text-xs mt-2 block"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Dots
            </span>
          </div>

          {/* Bar */}
          <div className="text-center">
            <div
              className="w-24 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
            >
              <div
                className="h-full rounded-full animate-loading-bar"
                style={{ backgroundColor: 'hsl(var(--demo-primary))' }}
              />
            </div>
            <span
              className="text-xs mt-2 block"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Bar
            </span>
          </div>
        </div>
      </div>

      {/* Skeleton Loaders */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Skeleton Loaders
        </h4>

        {/* Card Skeleton */}
        <div className="demo-card p-4 space-y-3" style={{ borderRadius }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full animate-pulse"
              style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-4 rounded animate-pulse"
                style={{ backgroundColor: 'hsl(var(--demo-muted))', width: '40%' }}
              />
              <div
                className="h-3 rounded animate-pulse"
                style={{ backgroundColor: 'hsl(var(--demo-muted))', width: '60%' }}
              />
            </div>
          </div>
          <div
            className="h-3 rounded animate-pulse"
            style={{ backgroundColor: 'hsl(var(--demo-muted))', width: '100%' }}
          />
          <div
            className="h-3 rounded animate-pulse"
            style={{ backgroundColor: 'hsl(var(--demo-muted))', width: '80%' }}
          />
        </div>

        {/* Table Skeleton */}
        <div className="demo-card overflow-hidden mt-3" style={{ borderRadius }}>
          <div
            className="h-10 animate-pulse"
            style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
          />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-t"
              style={{ borderColor: 'hsl(var(--demo-border))' }}
            >
              <div
                className="h-4 rounded animate-pulse"
                style={{ backgroundColor: 'hsl(var(--demo-muted))', width: '60px' }}
              />
              <div
                className="h-4 rounded animate-pulse flex-1"
                style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
              />
              <div
                className="h-4 rounded animate-pulse"
                style={{ backgroundColor: 'hsl(var(--demo-muted))', width: '80px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Button Loading States */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Button Loading
        </h4>
        <div className="flex gap-3">
          <button
            className="demo-btn demo-btn-primary demo-btn-md"
            style={{ borderRadius }}
            disabled
          >
            <span className="demo-spinner mr-2" />
            Processing...
          </button>
          <button
            className="demo-btn demo-btn-secondary demo-btn-md"
            style={{ borderRadius }}
            disabled
          >
            <span className="demo-spinner mr-2" />
            Loading...
          </button>
        </div>
      </div>

      {/* Inline Loading */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Inline Loading
        </h4>
        <div
          className="demo-card p-4 flex items-center justify-between"
          style={{ borderRadius }}
        >
          <span>Fetching latest data...</span>
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'hsl(var(--demo-muted))',
              borderTopColor: 'hsl(var(--demo-primary))',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
