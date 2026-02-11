"use client";

import * as React from "react";
import { Search, X, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchTickers, getTickerInfo, type TickerInfo } from "./ticker-data";

interface TickerInputProps {
  selectedTickers: string[];
  onToggleTicker: (ticker: string) => void;
  suggestedTickers?: string[];
}

export function TickerInput({
  selectedTickers,
  onToggleTicker,
  suggestedTickers = [],
}: TickerInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<TickerInfo[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Debounced search with API + fallback
  React.useEffect(() => {
    if (!inputValue.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tickers/search?q=${encodeURIComponent(inputValue)}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          // Fallback to static search if API returns no results
          setSearchResults(searchTickers(inputValue, 8));
        }
      } catch {
        // Fallback to static search on error
        setSearchResults(searchTickers(inputValue, 8));
      }
      setShowDropdown(true); // Always show dropdown for "Add anyway" option
      setHighlightedIndex(-1);
      setIsSearching(false);
    }, 300); // 300ms debounce for API

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTicker = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      onToggleTicker(ticker);
    }
    setInputValue("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        addTicker(searchResults[highlightedIndex].symbol);
      } else if (inputValue.trim()) {
        // Allow adding custom ticker even if not in database
        addTicker(inputValue.toUpperCase().trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Get exchange badge color
  const getExchangeColor = (exchange: string) => {
    switch (exchange) {
      case "NASDAQ":
        return "text-blue-400";
      case "NYSE":
        return "text-emerald-400";
      case "CRYPTO":
        return "text-amber-400";
      case "CBOE":
        return "text-purple-400";
      default:
        return "text-zinc-400";
    }
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "etf":
        return <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300">ETF</span>;
      case "crypto":
        return <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300">CRYPTO</span>;
      case "index":
        return <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300">INDEX</span>;
      default:
        return null;
    }
  };

  // Filter suggested tickers to only show ones not already selected and get their info
  const suggestedWithInfo = suggestedTickers
    .filter((t) => !selectedTickers.includes(t))
    .slice(0, 8)
    .map((symbol) => getTickerInfo(symbol))
    .filter((t): t is TickerInfo => t !== undefined);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search by ticker or company name..."
            className="pl-10 pr-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 animate-spin" />
          )}
        </div>

        {/* Search results dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 max-h-[300px] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl"
          >
            {searchResults.map((ticker, index) => (
              <button
                key={ticker.symbol}
                onClick={() => addTicker(ticker.symbol)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors",
                  highlightedIndex === index
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800/50",
                  selectedTickers.includes(ticker.symbol) && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100">
                        {ticker.symbol}
                      </span>
                      {getTypeBadge(ticker.type)}
                    </div>
                    <span className="text-xs text-zinc-400 truncate max-w-[250px]">
                      {ticker.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("text-xs font-medium", getExchangeColor(ticker.exchange))}>
                    {ticker.exchange}
                  </span>
                  {selectedTickers.includes(ticker.symbol) ? (
                    <span className="text-xs text-zinc-500">Added</span>
                  ) : (
                    <Plus className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              </button>
            ))}
            {searchResults.length === 0 && inputValue && !isSearching && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-zinc-400">
                  No results for "{inputValue}"
                </p>
                <button
                  onClick={() => addTicker(inputValue.toUpperCase())}
                  className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Add "{inputValue.toUpperCase()}" anyway
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestions section */}
      {suggestedWithInfo.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            Suggested for You
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestedWithInfo.map((ticker) => (
              <button
                key={ticker.symbol}
                onClick={() => addTicker(ticker.symbol)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                  "bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20"
                )}
              >
                <span className="font-medium text-indigo-300">{ticker.symbol}</span>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-400 hidden sm:inline">
                  {ticker.name.length > 20 ? ticker.name.slice(0, 20) + "..." : ticker.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected tickers (watchlist) */}
      <div className="pt-3 border-t border-zinc-800">
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
          Your Watchlist ({selectedTickers.length})
        </h4>
        {selectedTickers.length === 0 ? (
          <p className="text-sm text-zinc-500 py-2">
            Search above to add tickers to your watchlist.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto">
            {selectedTickers.map((symbol) => {
              const info = getTickerInfo(symbol);
              return (
                <Badge
                  key={symbol}
                  variant="secondary"
                  className="pl-2.5 pr-1.5 py-1.5 gap-2 cursor-pointer hover:bg-zinc-700 group"
                  onClick={() => onToggleTicker(symbol)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{symbol}</span>
                    {info && (
                      <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                        {info.name.length > 15 ? info.name.slice(0, 15) + "..." : info.name}
                      </span>
                    )}
                  </div>
                  <X className="h-3.5 w-3.5 text-zinc-400 hover:text-red-400 flex-shrink-0" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
