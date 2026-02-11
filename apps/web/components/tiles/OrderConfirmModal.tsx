'use client';

import { cn } from '@/lib/utils';
import type { Account } from '@/types/trading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export interface OrderPreview {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  qty: number;
  limitPrice?: number;
  estimatedPrice: number;
  estimatedCost: number;
  percentOfEquity: number;
  buyingPowerRemaining: number;
  buyingPowerUsed: number;
  hasInsufficientFunds: boolean;
  existingPosition?: {
    qty: number;
    side: 'long' | 'short';
    avgEntryPrice: number;
    unrealizedPl: number;
  };
}

interface OrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderPreview: OrderPreview | null;
  account: Account | null;
  isSubmitting: boolean;
}

export function OrderConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  orderPreview,
  account,
  isSubmitting,
}: OrderConfirmModalProps) {
  if (!orderPreview) return null;

  const isBuy = orderPreview.side === 'buy';
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0">
        {/* Header */}
        <DialogHeader
          className={cn(
            'px-4 py-3 border-b border-border',
            isBuy ? 'bg-green-500/10' : 'bg-red-500/10'
          )}
        >
          <DialogTitle className="flex items-center gap-2">
            <span className={isBuy ? 'text-green-400' : 'text-red-400'}>
              {isBuy ? '↑' : '↓'}
            </span>
            Confirm {orderPreview.side.toUpperCase()} Order
          </DialogTitle>
          <DialogDescription>
            Review your order before submitting
          </DialogDescription>
        </DialogHeader>

        {/* Order details */}
        <div className="p-4 space-y-4">
          {/* Main order info */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">{orderPreview.symbol}</span>
              <span className="ml-2 text-sm text-muted-foreground capitalize">
                {orderPreview.type} order
              </span>
            </div>
            <div className={cn('text-xl font-semibold', isBuy ? 'text-green-400' : 'text-red-400')}>
              {orderPreview.qty} shares
            </div>
          </div>

          {/* Price info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded p-2">
              <div className="text-muted-foreground text-xs uppercase">
                {orderPreview.type === 'limit' ? 'Limit Price' : 'Est. Price'}
              </div>
              <div className="font-medium">
                {formatCurrency(orderPreview.limitPrice || orderPreview.estimatedPrice)}
              </div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-muted-foreground text-xs uppercase">Est. Cost</div>
              <div className="font-medium">{formatCurrency(orderPreview.estimatedCost)}</div>
            </div>
          </div>

          {/* Risk metrics */}
          <div className="border border-border rounded-lg p-3 space-y-2">
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Position Risk</h3>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">% of Portfolio</span>
              <span
                className={cn(
                  'font-medium',
                  orderPreview.percentOfEquity > 25
                    ? 'text-yellow-400'
                    : orderPreview.percentOfEquity > 50
                      ? 'text-red-400'
                      : 'text-foreground'
                )}
              >
                {formatPercent(orderPreview.percentOfEquity)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buying Power Used</span>
              <span className="font-medium">{formatCurrency(orderPreview.buyingPowerUsed)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">BP Remaining</span>
              <span
                className={cn(
                  'font-medium',
                  orderPreview.buyingPowerRemaining < 0 ? 'text-red-400' : 'text-foreground'
                )}
              >
                {formatCurrency(orderPreview.buyingPowerRemaining)}
              </span>
            </div>

            {/* Progress bar showing portfolio allocation */}
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    orderPreview.percentOfEquity > 50
                      ? 'bg-red-500'
                      : orderPreview.percentOfEquity > 25
                        ? 'bg-yellow-500'
                        : isBuy
                          ? 'bg-green-500'
                          : 'bg-red-500'
                  )}
                  style={{ width: `${Math.min(100, orderPreview.percentOfEquity)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Existing position warning */}
          {orderPreview.existingPosition && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <h3 className="text-xs font-medium uppercase text-blue-400 mb-2">
                Existing Position
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current</span>
                  <span>
                    {orderPreview.existingPosition.qty}{' '}
                    {orderPreview.existingPosition.side === 'long' ? 'long' : 'short'} @{' '}
                    {formatCurrency(orderPreview.existingPosition.avgEntryPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unrealized P&L</span>
                  <span
                    className={
                      orderPreview.existingPosition.unrealizedPl >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {formatCurrency(orderPreview.existingPosition.unrealizedPl)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Insufficient funds warning */}
          {orderPreview.hasInsufficientFunds && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-lg">⚠</span>
                <div>
                  <div className="font-medium">Insufficient Buying Power</div>
                  <div className="text-xs text-red-400/80">
                    You need {formatCurrency(orderPreview.estimatedCost)} but only have{' '}
                    {formatCurrency(account?.buyingPower || 0)} available.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Large position warning */}
          {orderPreview.percentOfEquity > 25 && !orderPreview.hasInsufficientFunds && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-lg">⚠</span>
                <div>
                  <div className="font-medium">Large Position Warning</div>
                  <div className="text-xs text-yellow-400/80">
                    This order represents {formatPercent(orderPreview.percentOfEquity)} of your
                    portfolio.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <DialogFooter className="px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/30 flex gap-3 sm:flex-row">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-zinc-700"
          >
            Cancel
          </Button>
          <Button
            variant={isBuy ? 'buy' : 'sell'}
            onClick={onConfirm}
            disabled={isSubmitting || orderPreview.hasInsufficientFunds}
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              `Confirm ${orderPreview.side.toUpperCase()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
