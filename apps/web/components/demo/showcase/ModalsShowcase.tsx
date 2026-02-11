'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { themes } from '../themes';

interface ModalsShowcaseProps {
  themeName: string;
}

export function ModalsShowcase({ themeName }: ModalsShowcaseProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Modal Triggers */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Modal Types
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveModal('confirm')}
            className="demo-btn demo-btn-primary demo-btn-sm"
            style={{ borderRadius }}
          >
            Order Confirm
          </button>
          <button
            onClick={() => setActiveModal('alert')}
            className="demo-btn demo-btn-destructive demo-btn-sm"
            style={{ borderRadius }}
          >
            Alert Dialog
          </button>
          <button
            onClick={() => setActiveModal('info')}
            className="demo-btn demo-btn-secondary demo-btn-sm"
            style={{ borderRadius }}
          >
            Info Modal
          </button>
        </div>
      </div>

      {/* Modal Preview Area */}
      <div
        className="relative min-h-[280px] overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--demo-background) / 0.5)',
          borderRadius,
          border: '1px dashed hsl(var(--demo-border))',
        }}
      >
        {/* Backdrop */}
        {activeModal && (
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            style={{ backgroundColor: 'hsl(0 0% 0% / 0.6)' }}
            onClick={() => setActiveModal(null)}
          >
            {/* Order Confirmation Modal */}
            {activeModal === 'confirm' && (
              <div
                className="demo-card w-full max-w-sm"
                style={{ borderRadius }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex items-center justify-between p-4 border-b"
                  style={{ borderColor: 'hsl(var(--demo-border))' }}
                >
                  <h3 className="font-semibold">Confirm Order</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Action</span>
                    <span
                      className="font-bold"
                      style={{ color: 'hsl(var(--demo-bullish))' }}
                    >
                      BUY
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Symbol</span>
                    <span className="font-mono font-bold">AAPL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Quantity</span>
                    <span className="font-mono">100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Price</span>
                    <span className="font-mono">$175.25</span>
                  </div>
                  <div
                    className="flex justify-between text-sm pt-2 border-t"
                    style={{ borderColor: 'hsl(var(--demo-border))' }}
                  >
                    <span style={{ color: 'hsl(var(--demo-muted-foreground))' }}>Total</span>
                    <span className="font-mono font-bold">$17,525.00</span>
                  </div>
                </div>
                <div
                  className="flex gap-2 p-4 border-t"
                  style={{ borderColor: 'hsl(var(--demo-border))' }}
                >
                  <button
                    onClick={() => setActiveModal(null)}
                    className="demo-btn demo-btn-secondary demo-btn-md flex-1"
                    style={{ borderRadius }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="demo-btn demo-btn-primary demo-btn-md flex-1"
                    style={{ borderRadius }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* Alert Dialog */}
            {activeModal === 'alert' && (
              <div
                className="demo-card w-full max-w-sm"
                style={{ borderRadius }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div
                    className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'hsl(var(--demo-destructive) / 0.1)' }}
                  >
                    <AlertTriangle
                      className="w-6 h-6"
                      style={{ color: 'hsl(var(--demo-destructive))' }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Close All Positions?</h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                  >
                    This will close all 4 open positions at market price. This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="demo-btn demo-btn-secondary demo-btn-md flex-1"
                      style={{ borderRadius }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="demo-btn demo-btn-destructive demo-btn-md flex-1"
                      style={{ borderRadius }}
                    >
                      Close All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info Modal */}
            {activeModal === 'info' && (
              <div
                className="demo-card w-full max-w-sm"
                style={{ borderRadius }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex items-center justify-between p-4 border-b"
                  style={{ borderColor: 'hsl(var(--demo-border))' }}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
                    <h3 className="font-semibold">Alpha Score</h3>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'hsl(var(--demo-muted-foreground))' }}
                  >
                    The Alpha Score measures a source&apos;s predictive accuracy based on historical performance.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-bullish))' }} />
                      <span>80-100: High accuracy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-accent))' }} />
                      <span>50-79: Moderate accuracy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--demo-bearish))' }} />
                      <span>0-49: Low accuracy</span>
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 border-t"
                  style={{ borderColor: 'hsl(var(--demo-border))' }}
                >
                  <button
                    onClick={() => setActiveModal(null)}
                    className="demo-btn demo-btn-primary demo-btn-md w-full"
                    style={{ borderRadius }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!activeModal && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-sm"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Click a button above to preview modal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
