import { useMemo } from 'react';
import { useTradingStore } from '@/stores/tradingStore';

/**
 * Hook that returns a Set of ticker symbols from current positions.
 * Used for position-based feed filtering.
 */
export function usePositionSymbols(): Set<string> {
  const positions = useTradingStore((s) => s.positions);

  return useMemo(() => {
    return new Set(positions.map((p) => p.symbol.toUpperCase()));
  }, [positions]);
}

/**
 * Hook that returns an array of position symbols.
 * Useful for passing to APIs.
 */
export function usePositionSymbolsArray(): string[] {
  const positions = useTradingStore((s) => s.positions);

  return useMemo(() => {
    return positions.map((p) => p.symbol.toUpperCase());
  }, [positions]);
}
