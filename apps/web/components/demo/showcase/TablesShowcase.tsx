'use client';

import { useState } from 'react';
import { themes } from '../themes';

interface TablesShowcaseProps {
  themeName: string;
}

const mockPositions = [
  { symbol: 'AAPL', qty: 100, avgPrice: 168.50, currentPrice: 175.25, pl: 675.00, plPercent: 4.01 },
  { symbol: 'NVDA', qty: 50, avgPrice: 450.00, currentPrice: 485.30, pl: 1765.00, plPercent: 7.84 },
  { symbol: 'TSLA', qty: 25, avgPrice: 265.00, currentPrice: 245.80, pl: -480.00, plPercent: -7.25 },
  { symbol: 'MSFT', qty: 30, avgPrice: 378.20, currentPrice: 395.50, pl: 519.00, plPercent: 4.57 },
];

const mockOrders = [
  { id: '001', symbol: 'GOOGL', side: 'buy', qty: 10, price: 140.50, status: 'filled', filled: 10 },
  { id: '002', symbol: 'META', side: 'sell', qty: 20, price: 505.00, status: 'partial', filled: 15 },
  { id: '003', symbol: 'AMZN', side: 'buy', qty: 15, price: 178.25, status: 'pending', filled: 0 },
  { id: '004', symbol: 'AMD', side: 'sell', qty: 50, price: 165.00, status: 'cancelled', filled: 0 },
];

export function TablesShowcase({ themeName }: TablesShowcaseProps) {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  return (
    <div className="space-y-6">
      {/* Positions Table */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Positions
        </h4>
        <div
          className="demo-card overflow-hidden"
          style={{ borderRadius }}
        >
          <table className="demo-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Avg Price</th>
                <th className="text-right">Current</th>
                <th className="text-right">P&L</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {mockPositions.map((pos) => (
                <tr
                  key={pos.symbol}
                  onClick={() => setSelectedRow(pos.symbol)}
                  className="cursor-pointer"
                  style={{
                    backgroundColor:
                      selectedRow === pos.symbol
                        ? 'hsl(var(--demo-primary) / 0.1)'
                        : undefined,
                  }}
                >
                  <td className="font-mono font-bold">{pos.symbol}</td>
                  <td className="text-right font-mono">{pos.qty}</td>
                  <td className="text-right font-mono">${pos.avgPrice.toFixed(2)}</td>
                  <td className="text-right font-mono">${pos.currentPrice.toFixed(2)}</td>
                  <td
                    className="text-right font-mono font-medium"
                    style={{
                      color:
                        pos.pl >= 0
                          ? 'hsl(var(--demo-bullish))'
                          : 'hsl(var(--demo-bearish))',
                    }}
                  >
                    {pos.pl >= 0 ? '+' : ''}${pos.pl.toFixed(2)}
                  </td>
                  <td
                    className="text-right font-mono font-medium"
                    style={{
                      color:
                        pos.plPercent >= 0
                          ? 'hsl(var(--demo-bullish))'
                          : 'hsl(var(--demo-bearish))',
                    }}
                  >
                    {pos.plPercent >= 0 ? '+' : ''}{pos.plPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Table */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          Orders
        </h4>
        <div
          className="demo-card overflow-hidden"
          style={{ borderRadius }}
        >
          <table className="demo-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th>Status</th>
                <th className="text-right">Filled</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono font-bold">{order.symbol}</td>
                  <td>
                    <span
                      className="px-2 py-0.5 text-xs font-bold uppercase rounded"
                      style={{
                        backgroundColor:
                          order.side === 'buy'
                            ? 'hsl(var(--demo-bullish) / 0.2)'
                            : 'hsl(var(--demo-bearish) / 0.2)',
                        color:
                          order.side === 'buy'
                            ? 'hsl(var(--demo-bullish))'
                            : 'hsl(var(--demo-bearish))',
                        borderRadius: '4px',
                      }}
                    >
                      {order.side}
                    </span>
                  </td>
                  <td className="text-right font-mono">{order.qty}</td>
                  <td className="text-right font-mono">${order.price.toFixed(2)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="text-right font-mono">
                    {order.filled}/{order.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'filled':
        return {
          bg: 'hsl(var(--demo-bullish) / 0.2)',
          color: 'hsl(var(--demo-bullish))',
        };
      case 'partial':
        return {
          bg: 'hsl(var(--demo-accent) / 0.2)',
          color: 'hsl(var(--demo-accent))',
        };
      case 'pending':
        return {
          bg: 'hsl(var(--demo-primary) / 0.2)',
          color: 'hsl(var(--demo-primary))',
        };
      case 'cancelled':
        return {
          bg: 'hsl(var(--demo-muted))',
          color: 'hsl(var(--demo-muted-foreground))',
        };
      default:
        return {
          bg: 'hsl(var(--demo-muted))',
          color: 'hsl(var(--demo-muted-foreground))',
        };
    }
  };

  const style = getStatusStyle();

  return (
    <span
      className="px-2 py-0.5 text-xs font-medium capitalize rounded"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        borderRadius: '4px',
      }}
    >
      {status}
    </span>
  );
}
