export type SourceType = 'twitter' | 'rss' | 'news';

export interface Source {
  handle: string;
  name: string;
  type: SourceType;
}

export interface SourceCategory {
  label: string;
  description: string;
  sources: Source[];
}

export const SOURCE_CATEGORIES: Record<string, SourceCategory> = {
  flow: {
    label: "Flow",
    description: "Whale alerts, unusual options activity",
    sources: [
      { handle: "@unusual_whales", name: "Unusual Whales", type: "twitter" },
      { handle: "@FlowAlgo", name: "FlowAlgo", type: "twitter" },
      { handle: "@OptionsHawk", name: "Options Hawk", type: "twitter" },
    ]
  },
  breaking: {
    label: "Breaking",
    description: "Fast news bots, real-time updates",
    sources: [
      { handle: "@DeItaone", name: "Walter Bloomberg", type: "twitter" },
      { handle: "@FirstSquawk", name: "First Squawk", type: "twitter" },
    ]
  },
  research: {
    label: "Research",
    description: "Deep dives, fundamental analysis",
    sources: [
      { handle: "seekingalpha.com", name: "Seeking Alpha", type: "rss" },
      { handle: "@TechMike2020", name: "Tech Mike", type: "twitter" },
    ]
  },
  sector: {
    label: "Sector",
    description: "Domain specialists (semis, biotech, etc.)",
    sources: [
      { handle: "@SemiAnalysis", name: "SemiAnalysis", type: "twitter" },
      { handle: "@mcaborern", name: "Borenstein", type: "twitter" },
    ]
  },
  macro: {
    label: "Macro",
    description: "Fed, rates, liquidity analysis",
    sources: [
      { handle: "@MacroAlf", name: "MacroAlf", type: "twitter" },
      { handle: "@FedGuy12", name: "FedGuy", type: "twitter" },
    ]
  },
  filings: {
    label: "Filings",
    description: "13F, insider buying, SEC filings",
    sources: [
      { handle: "@unusual_whales", name: "13F Tracker", type: "twitter" },
    ]
  },
  quant: {
    label: "Quant",
    description: "Backtests, systematic signals",
    sources: [
      { handle: "@quantian1", name: "Quantian", type: "twitter" },
    ]
  },
  contrarian: {
    label: "Contrarian",
    description: "Fade signals, inverse indicators",
    sources: [
      { handle: "@jimcramer", name: "Jim Cramer", type: "twitter" },
    ]
  },
};

// Default enabled categories
export const DEFAULT_ENABLED_CATEGORIES = ['flow', 'breaking', 'research', 'sector'];

// Get all sources grouped by type
export function getSourcesByType() {
  const grouped: Record<SourceType, { source: Source; category: string }[]> = {
    twitter: [],
    rss: [],
    news: [],
  };

  Object.entries(SOURCE_CATEGORIES).forEach(([categoryKey, category]) => {
    category.sources.forEach((source) => {
      grouped[source.type].push({ source, category: categoryKey });
    });
  });

  return grouped;
}
