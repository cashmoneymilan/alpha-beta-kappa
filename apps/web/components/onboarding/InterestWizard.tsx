"use client";

import * as React from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useSettingsStore } from "@/stores/settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SourceSelector } from "./SourceSelector";
import { TickerInput } from "./TickerInput";
import { SOURCE_CATEGORIES, DEFAULT_ENABLED_CATEGORIES } from "@/components/demo/sources/data";

// Sector definitions with associated tickers
const SECTORS = {
  "tech-semis": {
    label: "Tech/Semiconductors",
    description: "Chip makers, hardware, tech giants",
    tickers: ["NVDA", "AMD", "AVGO", "INTC", "QCOM", "TSM", "MU", "MRVL"],
  },
  "ai-ml": {
    label: "AI/Machine Learning",
    description: "AI infrastructure and software",
    tickers: ["MSFT", "GOOGL", "META", "PLTR", "CRM", "NOW", "SNOW"],
  },
  crypto: {
    label: "Crypto/DeFi",
    description: "Cryptocurrencies and blockchain",
    tickers: ["BTC", "ETH", "SOL", "COIN", "MSTR", "RIOT", "MARA"],
  },
  energy: {
    label: "Energy/Oil",
    description: "Oil, gas, and traditional energy",
    tickers: ["XOM", "CVX", "COP", "SLB", "OXY", "DVN", "EOG"],
  },
  "rare-earth": {
    label: "Rare Earth/Materials",
    description: "Critical minerals and materials",
    tickers: ["MP", "UUUU", "LAC", "ALB", "LIT", "LTHM"],
  },
  nuclear: {
    label: "Nuclear/Uranium",
    description: "Uranium miners and nuclear energy",
    tickers: ["CCJ", "UEC", "DNN", "NXE", "LEU", "SMR"],
  },
  biotech: {
    label: "Healthcare/Biotech",
    description: "Pharmaceuticals and biotech",
    tickers: ["LLY", "NVO", "JNJ", "PFE", "MRNA", "ABBV", "AMGN"],
  },
  financials: {
    label: "Financials",
    description: "Banks, fintech, and insurance",
    tickers: ["JPM", "BAC", "GS", "MS", "V", "MA", "SQ"],
  },
  macro: {
    label: "Macro/Bonds",
    description: "ETFs for rates, bonds, and macro plays",
    tickers: ["TLT", "SPY", "QQQ", "IWM", "GLD", "SLV", "DIA"],
  },
  ev: {
    label: "EV/Clean Energy",
    description: "Electric vehicles and clean tech",
    tickers: ["TSLA", "RIVN", "LCID", "NIO", "XPEV", "ENPH", "SEDG"],
  },
} as const;

type SectorKey = keyof typeof SECTORS;

interface InterestWizardProps {
  open: boolean;
  onClose: () => void;
}

// Initialize default source state
function getDefaultSourceState(): Record<string, Set<string>> {
  const state: Record<string, Set<string>> = {};
  Object.entries(SOURCE_CATEGORIES).forEach(([key, category]) => {
    const isDefaultEnabled = DEFAULT_ENABLED_CATEGORIES.includes(key);
    state[key] = new Set(isDefaultEnabled ? category.sources.map((s) => s.handle) : []);
  });
  return state;
}

const TOTAL_STEPS = 3;

export function InterestWizard({ open, onClose }: InterestWizardProps) {
  const [step, setStep] = React.useState(1);
  const [selectedSectors, setSelectedSectors] = React.useState<SectorKey[]>([]);
  const [selectedTickers, setSelectedTickers] = React.useState<string[]>([]);
  const [enabledSources, setEnabledSourcesLocal] = React.useState<Record<string, Set<string>>>(
    getDefaultSourceState
  );
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  const setUserSectors = useSettingsStore((s) => s.setUserSectors);
  const setUserTickers = useSettingsStore((s) => s.setUserTickers);
  const setEnabledSources = useSettingsStore((s) => s.setEnabledSources);
  const setHasCompletedOnboarding = useSettingsStore((s) => s.setHasCompletedOnboarding);
  const existingSectors = useSettingsStore((s) => s.userSectors);
  const existingTickers = useSettingsStore((s) => s.userTickers);
  const existingSources = useSettingsStore((s) => s.enabledSources);

  // Initialize with existing preferences
  React.useEffect(() => {
    if (open) {
      setSelectedSectors(existingSectors as SectorKey[]);
      setSelectedTickers(existingTickers);
      // Initialize sources from store or use defaults
      if (existingSources && Object.keys(existingSources).length > 0) {
        const converted: Record<string, Set<string>> = {};
        Object.entries(existingSources).forEach(([key, handles]) => {
          converted[key] = new Set(handles);
        });
        setEnabledSourcesLocal(converted);
      } else {
        setEnabledSourcesLocal(getDefaultSourceState());
      }
    }
  }, [open, existingSectors, existingTickers, existingSources]);

  // Source toggle handlers
  const toggleSourceCategory = (categoryKey: string) => {
    const category = SOURCE_CATEGORIES[categoryKey as keyof typeof SOURCE_CATEGORIES];
    if (!category) return;
    setEnabledSourcesLocal((prev) => {
      const current = prev[categoryKey] || new Set<string>();
      const allEnabled = current.size === category.sources.length;
      return {
        ...prev,
        [categoryKey]: allEnabled
          ? new Set<string>()
          : new Set(category.sources.map((s) => s.handle)),
      };
    });
  };

  const toggleSource = (categoryKey: string, handle: string) => {
    setEnabledSourcesLocal((prev) => {
      const current = new Set(prev[categoryKey] || []);
      if (current.has(handle)) {
        current.delete(handle);
      } else {
        current.add(handle);
      }
      return { ...prev, [categoryKey]: current };
    });
  };

  const toggleExpanded = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  };

  // Get suggested tickers based on selected sectors
  const suggestedTickers = React.useMemo(() => {
    const tickers = new Set<string>();
    selectedSectors.forEach((sector) => {
      SECTORS[sector].tickers.forEach((t) => tickers.add(t));
    });
    return Array.from(tickers);
  }, [selectedSectors]);

  const toggleSector = (sector: SectorKey) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  const toggleTicker = (ticker: string) => {
    setSelectedTickers((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
  };

  const handleSave = () => {
    setUserSectors(selectedSectors);
    setUserTickers(selectedTickers);
    // Convert Sets to arrays for storage
    const sourcesForStorage: Record<string, string[]> = {};
    Object.entries(enabledSources).forEach(([key, handles]) => {
      sourcesForStorage[key] = Array.from(handles);
    });
    setEnabledSources(sourcesForStorage);
    setHasCompletedOnboarding(true);
    onClose();
  };

  // Skip onboarding - mark as complete without saving preferences
  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop - more transparent to show terminal behind */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal - dark theme */}
      <div className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Setup Your Interests</h2>
            <p className="text-sm text-zinc-400">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Skip setup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <Progress
            value={(step / TOTAL_STEPS) * 100}
            className="h-1.5 bg-zinc-800"
          />
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {/* Step 1: Sector Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-base font-medium mb-2 text-zinc-100">
                What sectors interest you?
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                Select the markets you want to track. We&apos;ll suggest relevant tickers.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(SECTORS) as [SectorKey, typeof SECTORS[SectorKey]][]).map(
                  ([key, sector]) => (
                    <button
                      key={key}
                      onClick={() => toggleSector(key)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                        selectedSectors.includes(key)
                          ? "border-indigo-500 bg-indigo-500/20"
                          : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                          selectedSectors.includes(key)
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-zinc-500"
                        )}
                      >
                        {selectedSectors.includes(key) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-zinc-100">{sector.label}</div>
                        <div className="text-xs text-zinc-400">
                          {sector.description}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 2: Ticker Selection with Search */}
          {step === 2 && (
            <div>
              <h3 className="text-base font-medium mb-2 text-zinc-100">
                Build your watchlist
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                Add any ticker symbol or pick from suggestions based on your interests.
              </p>

              <TickerInput
                selectedTickers={selectedTickers}
                onToggleTicker={toggleTicker}
                suggestedTickers={suggestedTickers}
              />
            </div>
          )}

          {/* Step 3: Source Selection */}
          {step === 3 && (
            <div>
              <h3 className="text-base font-medium mb-2 text-zinc-100">
                Choose your sources
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                Select which sources you want to follow. Click a category to expand and customize individual sources.
              </p>

              <div className="max-h-[340px] overflow-y-auto pr-1">
                <SourceSelector
                  enabledSources={enabledSources}
                  onToggleCategory={toggleSourceCategory}
                  onToggleSource={toggleSource}
                  expandedCategories={expandedCategories}
                  onToggleExpanded={toggleExpanded}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step === 1 && (
              <button
                onClick={handleSkip}
                className="text-sm text-zinc-500 hover:text-zinc-300 underline"
              >
                Skip setup
              </button>
            )}
          </div>

          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} variant="buy">
              <Check className="h-4 w-4" />
              Save Preferences
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
