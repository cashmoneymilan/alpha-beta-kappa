import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TimeWindow, AssetFocus } from "@/stores/settings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert time window to milliseconds for filtering
export function timeWindowToMs(window: TimeWindow): number {
  const mapping: Record<TimeWindow, number> = {
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };
  return mapping[window];
}

// Asset class categorization for tickers
const assetCategories: Record<string, AssetFocus> = {
  // Equities
  NVDA: "equities", AMD: "equities", AVGO: "equities", AAPL: "equities",
  SPY: "equities", QQQ: "equities", MP: "equities", CCJ: "equities",
  UEC: "equities", UUUU: "equities", NEM: "equities",
  // Crypto
  BTC: "crypto", ETH: "crypto", SOL: "crypto",
  // Macro
  TLT: "macro",
  // Metals
  GLD: "metals", GOLD: "metals", REE: "metals",
};

export function getAssetFocus(ticker: string): AssetFocus {
  return assetCategories[ticker.toUpperCase()] || "equities";
}

export function matchesAssetFocus(tickers: string[], focus: AssetFocus): boolean {
  if (focus === "all") return true;
  return tickers.some((t) => getAssetFocus(t) === focus);
}

export function isWithinTimeWindow(date: Date, window: TimeWindow): boolean {
  const now = Date.now();
  const cutoff = now - timeWindowToMs(window);
  return date.getTime() >= cutoff;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s`;
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString();
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
