'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { themes } from '../themes';

interface FormsShowcaseProps {
  themeName: string;
}

export function FormsShowcase({ themeName }: FormsShowcaseProps) {
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(175.5);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [paperMode, setPaperMode] = useState(true);

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-5">
      {/* Symbol Input with Badge */}
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Symbol
        </label>
        <div className="relative">
          <input
            type="text"
            className="demo-input pr-16"
            style={{ borderRadius }}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol..."
          />
          {symbol && (
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-bold rounded"
              style={{
                backgroundColor: 'hsl(var(--demo-primary) / 0.2)',
                color: 'hsl(var(--demo-primary))',
                borderRadius: '4px',
              }}
            >
              {symbol}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Input with Controls */}
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Quantity
        </label>
        <div className="flex gap-2">
          <button
            className="demo-btn demo-btn-secondary demo-btn-md px-3"
            style={{ borderRadius }}
            onClick={() => setQuantity(Math.max(1, quantity - 10))}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            className="demo-input flex-1 text-center font-mono"
            style={{ borderRadius }}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <button
            className="demo-btn demo-btn-secondary demo-btn-md px-3"
            style={{ borderRadius }}
            onClick={() => setQuantity(quantity + 10)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Input with Currency */}
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Limit Price
        </label>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            $
          </span>
          <input
            type="number"
            step="0.01"
            className="demo-input pl-7 font-mono"
            style={{ borderRadius }}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            disabled={orderType === 'market'}
          />
        </div>
      </div>

      {/* Order Type Toggle */}
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Order Type
        </label>
        <div
          className="demo-segmented"
          style={{ borderRadius }}
        >
          <button
            className={`demo-segmented-item ${orderType === 'market' ? 'active' : ''}`}
            style={{ borderRadius }}
            onClick={() => setOrderType('market')}
          >
            Market
          </button>
          <button
            className={`demo-segmented-item ${orderType === 'limit' ? 'active' : ''}`}
            style={{ borderRadius }}
            onClick={() => setOrderType('limit')}
          >
            Limit
          </button>
        </div>
      </div>

      {/* Paper/Live Toggle */}
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Trading Mode
        </label>
        <div className="flex items-center gap-3">
          <button
            className={`demo-toggle ${paperMode ? '' : 'active'}`}
            onClick={() => setPaperMode(!paperMode)}
            role="switch"
            aria-checked={!paperMode}
          />
          <span
            className="text-sm font-medium"
            style={{
              color: paperMode
                ? 'hsl(var(--demo-muted-foreground))'
                : 'hsl(var(--demo-destructive))',
            }}
          >
            {paperMode ? 'Paper Trading' : 'Live Trading'}
          </span>
        </div>
      </div>

      {/* Estimated Value */}
      <div
        className="p-3 rounded"
        style={{
          backgroundColor: 'hsl(var(--demo-muted))',
          borderRadius,
        }}
      >
        <div className="flex justify-between items-center">
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: 'hsl(var(--demo-muted-foreground))' }}
          >
            Estimated Value
          </span>
          <span
            className="font-mono font-bold"
            style={{ color: 'hsl(var(--demo-foreground))' }}
          >
            ${(quantity * price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
