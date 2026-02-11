'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { PriceLevel } from '@/types/trading';

interface OrderBook2DProps {
  bids: PriceLevel[];
  asks: PriceLevel[];
  spread: number;
  spreadPercent: number;
}

export function OrderBook2D({ bids, asks, spread, spreadPercent }: OrderBook2DProps) {
  // Calculate max size for depth bars
  const maxSize = useMemo(() => {
    const allSizes = [...bids, ...asks].map((l) => l.size);
    return Math.max(...allSizes, 1);
  }, [bids, asks]);

  // Take top 10 levels each side
  const displayBids = bids.slice(0, 10);
  const displayAsks = asks.slice(0, 10);

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Header */}
      <div className="grid grid-cols-3 gap-1 px-2 py-1.5 border-b border-border text-muted-foreground font-medium">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (sells) - reversed so lowest ask is at bottom */}
      <div className="flex-1 overflow-hidden flex flex-col-reverse">
        {displayAsks.map((level, i) => {
          const depthPercent = (level.size / maxSize) * 100;
          return (
            <div
              key={`ask-${level.price}`}
              className="relative grid grid-cols-3 gap-1 px-2 py-0.5 hover:bg-muted/30"
            >
              {/* Depth bar */}
              <div
                className="absolute inset-y-0 right-0 bg-red-500/10"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative text-red-400">${level.price.toFixed(2)}</span>
              <span className="relative text-right text-foreground">{level.size.toLocaleString()}</span>
              <span className="relative text-right text-muted-foreground">{level.total?.toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      <div className="px-2 py-1.5 border-y border-border bg-muted/20 flex items-center justify-between">
        <span className="text-muted-foreground">Spread</span>
        <span className="font-medium">
          ${spread.toFixed(2)} <span className="text-muted-foreground">({spreadPercent.toFixed(2)}%)</span>
        </span>
      </div>

      {/* Bids (buys) */}
      <div className="flex-1 overflow-hidden">
        {displayBids.map((level, i) => {
          const depthPercent = (level.size / maxSize) * 100;
          return (
            <div
              key={`bid-${level.price}`}
              className="relative grid grid-cols-3 gap-1 px-2 py-0.5 hover:bg-muted/30"
            >
              {/* Depth bar */}
              <div
                className="absolute inset-y-0 right-0 bg-green-500/10"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative text-green-400">${level.price.toFixed(2)}</span>
              <span className="relative text-right text-foreground">{level.size.toLocaleString()}</span>
              <span className="relative text-right text-muted-foreground">{level.total?.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
