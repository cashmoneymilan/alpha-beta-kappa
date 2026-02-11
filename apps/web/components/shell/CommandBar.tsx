"use client";

import * as React from "react";
import { Command } from "cmdk";
import {
  Activity,
  AlertCircle,
  TrendingUp,
  X,
  StickyNote,
  CandlestickChart,
  ShoppingCart,
  Briefcase,
  Trophy,
  Bot,
} from "lucide-react";
import { useWorkspaceStore, tileColors } from "@/stores/workspace";
import type { TileType } from "@/stores/workspace";
import { cn } from "@/lib/utils";

const commands: {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  action: TileType | "command";
  description: string;
}[] = [
  // Market Data
  {
    id: "marketpulse",
    label: "MARKET PULSE",
    shortcut: "M",
    icon: Activity,
    action: "MARKETPULSE",
    description: "Treemap + feed view of market activity",
  },
  {
    id: "chart",
    label: "CHART",
    shortcut: "C",
    icon: CandlestickChart,
    action: "CHART",
    description: "Chart with ticker info + order book",
  },
  // Trading
  {
    id: "trade",
    label: "TRADE",
    shortcut: "T",
    icon: ShoppingCart,
    action: "TRADE",
    description: "Trading hub: buy/sell, options, orders",
  },
  {
    id: "portfolio",
    label: "PORTFOLIO",
    shortcut: "P",
    icon: Briefcase,
    action: "PORTFOLIO",
    description: "Positions + performance tracking",
  },
  // Analytics & Tools
  {
    id: "leaderboard",
    label: "LEADERBOARD",
    shortcut: "L",
    icon: Trophy,
    action: "LEADERBOARD",
    description: "Source alpha rankings",
  },
  {
    id: "alerts",
    label: "ALERTS",
    shortcut: "A",
    icon: AlertCircle,
    action: "ALERTS",
    description: "Price alerts",
  },
  {
    id: "notes",
    label: "NOTES",
    shortcut: "N",
    icon: StickyNote,
    action: "NOTES",
    description: "Trading notes",
  },
  // AI Agent
  {
    id: "moltbot",
    label: "MOLTBOT",
    shortcut: "B",
    icon: Bot,
    action: "MOLTBOT",
    description: "AI agent — chat, trade, analyze",
  },
];

export function CommandBar() {
  const open = useWorkspaceStore((s) => s.commandBarOpen);
  const setOpen = useWorkspaceStore((s) => s.setCommandBarOpen);
  const addTile = useWorkspaceStore((s) => s.addTile);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [search, setSearch] = React.useState("");
  const [chartInput, setChartInput] = React.useState<string | null>(null);
  const [tradeInput, setTradeInput] = React.useState<string | null>(null);

  // Handle keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setChartInput(null);
        setTradeInput(null);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const handleSelect = (command: (typeof commands)[0]) => {
    if (!activeWorkspaceId) return;

    // Chart and Trade tiles prompt for ticker
    if (command.action === "CHART") {
      setChartInput("");
      return;
    }

    if (command.action === "TRADE") {
      setTradeInput("");
      return;
    }

    const tileId = `${command.action.toLowerCase()}-${Date.now()}`;
    addTile(activeWorkspaceId, {
      id: tileId,
      type: command.action as TileType,
      title: command.label,
    });
    setOpen(false);
    setSearch("");
  };

  const handleChartSubmit = (ticker: string) => {
    if (!activeWorkspaceId || !ticker.trim()) return;
    const tileId = `chart-${ticker.toUpperCase()}-${Date.now()}`;
    addTile(activeWorkspaceId, {
      id: tileId,
      type: "CHART",
      title: `${ticker.toUpperCase()} Chart`,
      props: { ticker: ticker.toUpperCase() },
    });
    setOpen(false);
    setSearch("");
    setChartInput(null);
  };

  const handleTradeSubmit = (ticker: string) => {
    if (!activeWorkspaceId || !ticker.trim()) return;
    const tileId = `trade-${ticker.toUpperCase()}-${Date.now()}`;
    addTile(activeWorkspaceId, {
      id: tileId,
      type: "TRADE",
      title: `Trade ${ticker.toUpperCase()}`,
      props: { ticker: ticker.toUpperCase() },
    });
    setOpen(false);
    setSearch("");
    setTradeInput(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop - transparent, no color, just captures clicks */}
      <div
        className="absolute inset-0"
        onClick={() => {
          setOpen(false);
          setChartInput(null);
          setTradeInput(null);
        }}
      />

      {/* Command dialog */}
      <div className="relative w-full max-w-xl mx-4">
        <Command
          className="rounded-lg border border-border shadow-2xl overflow-hidden"
          style={{ backgroundColor: "hsl(var(--card))" }}
          loop
        >
          <div
            className="flex items-center border-b border-border px-3"
            style={{ backgroundColor: "hsl(var(--muted))" }}
          >
            <span className="text-primary font-bold mr-2">{">"}</span>
            {chartInput !== null ? (
              <input
                autoFocus
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Enter ticker symbol for chart (e.g., AAPL, TSLA)"
                value={chartInput}
                onChange={(e) => setChartInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChartSubmit(chartInput);
                  }
                  if (e.key === "Escape") {
                    setChartInput(null);
                  }
                }}
              />
            ) : tradeInput !== null ? (
              <input
                autoFocus
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Enter ticker symbol to trade (e.g., AAPL, TSLA)"
                value={tradeInput}
                onChange={(e) => setTradeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTradeSubmit(tradeInput);
                  }
                  if (e.key === "Escape") {
                    setTradeInput(null);
                  }
                }}
              />
            ) : (
              <Command.Input
                autoFocus
                className="flex-1 bg-transparent py-3 text-sm outline-none border-none ring-0 focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
              />
            )}
            <button
              onClick={() => {
                setOpen(false);
                setChartInput(null);
                setTradeInput(null);
              }}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {chartInput === null && tradeInput === null && (
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No commands found.
              </Command.Empty>

              <Command.Group heading="Views" className="text-xs text-muted-foreground px-2 py-1.5">
                {commands.map((command) => {
                  const tileColorVar = command.action !== "command" ? tileColors[command.action as TileType] : undefined;
                  const cssVar = tileColorVar?.replace('var(', '').replace(')', '');

                  return (
                    <Command.Item
                      key={command.id}
                      value={command.label}
                      onSelect={() => handleSelect(command)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded cursor-pointer",
                        "hover:bg-muted aria-selected:bg-muted"
                      )}
                    >
                      {(() => {
                        const Icon = command.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
                        return <Icon className="h-4 w-4 shrink-0" style={{ color: cssVar ? `hsl(var(${cssVar}))` : 'hsl(var(--primary))' }} />;
                      })()}
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {command.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {command.description}
                        </div>
                      </div>
                      {command.shortcut && (
                        <kbd
                          className="px-1.5 py-0.5 text-xs font-mono rounded border"
                          style={{
                            backgroundColor: cssVar ? `hsl(var(${cssVar}) / 0.1)` : 'hsl(var(--muted))',
                            borderColor: cssVar ? `hsl(var(${cssVar}) / 0.3)` : 'hsl(var(--border))',
                            color: cssVar ? `hsl(var(${cssVar}))` : 'inherit',
                          }}
                        >
                          {command.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>

              <Command.Group
                heading="Quick Actions"
                className="text-xs text-muted-foreground px-2 py-1.5 mt-2"
              >
                <Command.Item
                  value="cluster"
                  onSelect={() => {
                    // Trigger AI clustering - for now just close
                    console.log("Triggering AI narrative clustering...");
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded cursor-pointer",
                    "hover:bg-muted aria-selected:bg-muted"
                  )}
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">CLUSTER</div>
                    <div className="text-xs text-muted-foreground">
                      Trigger AI narrative clustering
                    </div>
                  </div>
                </Command.Item>
              </Command.Group>
            </Command.List>
          )}

          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground" style={{ backgroundColor: "hsl(var(--muted))" }}>
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1 bg-muted rounded">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="px-1 bg-muted rounded">↵</kbd> Select
              </span>
              <span>
                <kbd className="px-1 bg-muted rounded">esc</kbd> Close
              </span>
            </div>
            <span className="text-primary">⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
