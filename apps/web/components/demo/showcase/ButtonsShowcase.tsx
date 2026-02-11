'use client';

import { useState } from 'react';
import { themes } from '../themes';

interface ButtonsShowcaseProps {
  themeName: string;
}

export function ButtonsShowcase({ themeName }: ButtonsShowcaseProps) {
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  const handleLoadingClick = (btn: string) => {
    setLoadingBtn(btn);
    setTimeout(() => setLoadingBtn(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Primary Buttons - Buy Action */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Primary (Buy)
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            className="demo-btn demo-btn-primary demo-btn-sm"
            style={{ borderRadius }}
          >
            Buy
          </button>
          <button
            className="demo-btn demo-btn-primary demo-btn-md"
            style={{ borderRadius }}
          >
            Buy AAPL
          </button>
          <button
            className="demo-btn demo-btn-primary demo-btn-lg"
            style={{ borderRadius }}
          >
            Execute Order
          </button>
        </div>
      </div>

      {/* Destructive Buttons - Sell Action */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Destructive (Sell)
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            className="demo-btn demo-btn-destructive demo-btn-sm"
            style={{ borderRadius }}
          >
            Sell
          </button>
          <button
            className="demo-btn demo-btn-destructive demo-btn-md"
            style={{ borderRadius }}
          >
            Sell AAPL
          </button>
          <button
            className="demo-btn demo-btn-destructive demo-btn-lg"
            style={{ borderRadius }}
          >
            Close Position
          </button>
        </div>
      </div>

      {/* Secondary Buttons */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Secondary
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            className="demo-btn demo-btn-secondary demo-btn-sm"
            style={{ borderRadius }}
          >
            Cancel
          </button>
          <button
            className="demo-btn demo-btn-secondary demo-btn-md"
            style={{ borderRadius }}
          >
            Modify Order
          </button>
          <button
            className="demo-btn demo-btn-secondary demo-btn-lg"
            style={{ borderRadius }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Ghost Buttons */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Ghost
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            className="demo-btn demo-btn-ghost demo-btn-sm"
            style={{ borderRadius }}
          >
            More
          </button>
          <button
            className="demo-btn demo-btn-ghost demo-btn-md"
            style={{ borderRadius }}
          >
            Show Chart
          </button>
          <button
            className="demo-btn demo-btn-ghost demo-btn-lg"
            style={{ borderRadius }}
          >
            Advanced Options
          </button>
        </div>
      </div>

      {/* States */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          States
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            className="demo-btn demo-btn-primary demo-btn-md"
            style={{ borderRadius }}
            disabled
          >
            Disabled
          </button>
          <button
            className="demo-btn demo-btn-primary demo-btn-md"
            style={{ borderRadius }}
            onClick={() => handleLoadingClick('submit')}
          >
            {loadingBtn === 'submit' ? (
              <>
                <span className="demo-spinner" />
                Processing...
              </>
            ) : (
              'Click to Load'
            )}
          </button>
          <button
            className="demo-btn demo-btn-destructive demo-btn-md"
            style={{ borderRadius }}
            onClick={() => handleLoadingClick('cancel')}
          >
            {loadingBtn === 'cancel' ? (
              <>
                <span className="demo-spinner" />
                Cancelling...
              </>
            ) : (
              'Cancel Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
