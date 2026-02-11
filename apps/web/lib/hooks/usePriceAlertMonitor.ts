'use client';

import { useEffect, useRef } from 'react';
import { useMarketDataStore, selectLatestPrice } from '@/stores/marketDataStore';
import { useAlertsStore } from '@/stores/alertsStore';

/**
 * Hook that monitors market data and triggers price alerts
 * when price conditions are met.
 *
 * This should be used in a component that is always mounted
 * (e.g., the main layout or a global provider).
 */
export function usePriceAlertMonitor() {
  const priceAlerts = useAlertsStore((s) => s.priceAlerts);
  const triggerPriceAlert = useAlertsStore((s) => s.triggerPriceAlert);

  // Track last known prices to detect crossings
  const lastPricesRef = useRef<Record<string, number>>({});

  // Get unique symbols from active (untriggered) price alerts
  const activeAlerts = priceAlerts.filter((a) => !a.triggered);
  const symbols = [...new Set(activeAlerts.map((a) => a.symbol))];

  useEffect(() => {
    if (symbols.length === 0) return;

    // Subscribe to market data updates
    const unsubscribe = useMarketDataStore.subscribe(
      (state) => {
        // Check each active alert
        for (const alert of activeAlerts) {
          const currentPrice = selectLatestPrice(alert.symbol)(state);

          if (currentPrice === null) continue;

          const lastPrice = lastPricesRef.current[alert.symbol];

          // Update last known price
          lastPricesRef.current[alert.symbol] = currentPrice;

          // Skip if we don't have a previous price to compare
          if (lastPrice === undefined) continue;

          // Check if price crossed the target
          if (alert.type === 'price_above') {
            // Was below or at target, now above
            if (lastPrice <= alert.targetPrice && currentPrice > alert.targetPrice) {
              triggerPriceAlert(alert.id);
            }
          } else if (alert.type === 'price_below') {
            // Was above or at target, now below
            if (lastPrice >= alert.targetPrice && currentPrice < alert.targetPrice) {
              triggerPriceAlert(alert.id);
            }
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [symbols.join(','), activeAlerts.length, triggerPriceAlert]);
}
