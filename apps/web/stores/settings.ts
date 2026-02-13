import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "terminal" | "modern";
export type TimeWindow = "15m" | "1h" | "6h" | "24h" | "7d";
export type NoiseLevel = "low" | "medium" | "high";
export type AssetFocus = "all" | "equities" | "macro" | "metals";
export type FeedFilterMode = "all" | "positions-only" | "positions-boosted";

interface SettingsState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Global filters
  timeWindow: TimeWindow;
  noiseLevel: NoiseLevel;
  assetFocus: AssetFocus;
  sourceSet: "all" | "my-lists" | "custom";
  feedFilterMode: FeedFilterMode;
  positionBoostAmount: number;

  setTimeWindow: (window: TimeWindow) => void;
  setNoiseLevel: (level: NoiseLevel) => void;
  setAssetFocus: (focus: AssetFocus) => void;
  setSourceSet: (set: "all" | "my-lists" | "custom") => void;
  setFeedFilterMode: (mode: FeedFilterMode) => void;
  setPositionBoostAmount: (amount: number) => void;

  // User interests (from Interest Portal)
  userSectors: string[];
  userTickers: string[];
  enabledSources: Record<string, string[]>; // category -> enabled source handles
  hasCompletedOnboarding: boolean;

  setUserSectors: (sectors: string[]) => void;
  setUserTickers: (tickers: string[]) => void;
  setEnabledSources: (sources: Record<string, string[]>) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;

  // AI settings
  aiEnabled: boolean;
  aiMode: "off" | "manual" | "scheduled";
  maxItemsForAI: number;

  setAIEnabled: (enabled: boolean) => void;
  setAIMode: (mode: "off" | "manual" | "scheduled") => void;
  setMaxItemsForAI: (max: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Hydration state (not persisted)
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      // Theme defaults
      theme: "terminal",
      setTheme: (theme) => {
        document.documentElement.setAttribute(
          "data-theme",
          theme === "modern" ? "modern" : ""
        );
        set({ theme });
      },

      // Filter defaults
      timeWindow: "24h",
      noiseLevel: "medium",
      assetFocus: "all",
      sourceSet: "all",
      feedFilterMode: "all",
      positionBoostAmount: 20,

      setTimeWindow: (timeWindow) => set({ timeWindow }),
      setNoiseLevel: (noiseLevel) => set({ noiseLevel }),
      setAssetFocus: (assetFocus) => set({ assetFocus }),
      setSourceSet: (sourceSet) => set({ sourceSet }),
      setFeedFilterMode: (feedFilterMode) => set({ feedFilterMode }),
      setPositionBoostAmount: (positionBoostAmount) => set({ positionBoostAmount }),

      // User interests defaults
      userSectors: [],
      userTickers: [],
      enabledSources: {},
      hasCompletedOnboarding: false,

      setUserSectors: (userSectors) => set({ userSectors }),
      setUserTickers: (userTickers) => set({ userTickers }),
      setEnabledSources: (enabledSources) => set({ enabledSources }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),

      // AI defaults
      aiEnabled: true,
      aiMode: "manual",
      maxItemsForAI: 50,

      setAIEnabled: (aiEnabled) => set({ aiEnabled }),
      setAIMode: (aiMode) => set({ aiMode }),
      setMaxItemsForAI: (maxItemsForAI) => set({ maxItemsForAI }),
    }),
    {
      name: "narrative-terminal-settings",
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme === "modern") {
          document.documentElement.setAttribute("data-theme", "modern");
        }
        // Mark hydration as complete
        state?.setHasHydrated(true);
      },
      partialize: (state) => {
        // Exclude hydration state from persistence
        const { _hasHydrated, setHasHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);
