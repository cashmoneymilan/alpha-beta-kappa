'use client';

import type { ReactNode } from 'react';
import { usePriceAlertMonitor } from '@/lib/hooks/usePriceAlertMonitor';
import { useGlobalHotkeys } from '@/lib/hooks/useGlobalHotkeys';

interface AlertsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that monitors price alerts and global hotkeys.
 * This should be placed high in the component tree to ensure
 * alerts and hotkeys work even when specific tiles are not visible.
 */
export function AlertsProvider({ children }: AlertsProviderProps) {
  // Monitor price alerts and trigger notifications
  usePriceAlertMonitor();

  // Global hotkeys for quick tile access (B, C, P, O)
  useGlobalHotkeys();

  return <>{children}</>;
}
