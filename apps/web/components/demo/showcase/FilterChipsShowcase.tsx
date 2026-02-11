'use client';

import { useState } from 'react';
import { X, ChevronDown, Filter, Check } from 'lucide-react';
import { getThemeStyles } from '../themes';

interface FilterChipsShowcaseProps {
  themeName: string;
}

export function FilterChipsShowcase({ themeName }: FilterChipsShowcaseProps) {
  const theme = getThemeStyles(themeName);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Technology', 'Healthcare']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Filled']);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>('Bullish');

  const baseChipStyle = {
    background: `hsl(${theme.colors['--demo-muted']})`,
    border: `1px solid hsl(${theme.colors['--demo-border']})`,
    color: `hsl(${theme.colors['--demo-foreground']})`,
    fontSize: '11px',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: '500',
    borderRadius: '6px',
    padding: '4px 10px',
  };

  const activeChipStyle = {
    ...baseChipStyle,
    background: `hsl(${theme.colors['--demo-primary']} / 0.15)`,
    borderColor: `hsl(${theme.colors['--demo-primary']})`,
    color: `hsl(${theme.colors['--demo-primary']})`,
  };

  const sectionLabelStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'];
  const statuses = ['Open', 'Filled', 'Cancelled', 'Pending'];

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="space-y-6">
      {/* Multi-Select Chips */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Sectors (Multi-Select)</span>
        <div className="flex flex-wrap gap-2">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => toggleSector(sector)}
              className="flex items-center gap-1.5 transition-colors"
              style={selectedSectors.includes(sector) ? activeChipStyle : baseChipStyle}
            >
              {selectedSectors.includes(sector) && <Check className="w-3 h-3" />}
              {sector}
              {selectedSectors.includes(sector) && (
                <X className="w-3 h-3 ml-1 hover:opacity-70" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order Status Chips */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Order Status</span>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const isActive = selectedStatuses.includes(status);
            let statusColor = theme.colors['--demo-muted-foreground'];
            if (status === 'Filled') statusColor = theme.colors['--demo-bullish'];
            if (status === 'Cancelled') statusColor = theme.colors['--demo-bearish'];
            if (status === 'Pending') statusColor = theme.colors['--demo-accent'];
            if (status === 'Open') statusColor = theme.colors['--demo-primary'];

            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className="flex items-center gap-1.5 transition-colors"
                style={{
                  ...baseChipStyle,
                  ...(isActive && {
                    background: `hsl(${statusColor} / 0.15)`,
                    borderColor: `hsl(${statusColor})`,
                    color: `hsl(${statusColor})`,
                  }),
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: `hsl(${statusColor})` }}
                />
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sentiment Chips (Single Select) */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Sentiment Filter (Single)</span>
        <div className="flex gap-2">
          {['Bullish', 'Neutral', 'Bearish'].map((sentiment) => {
            const isActive = selectedSentiment === sentiment;
            let sentimentColor = theme.colors['--demo-muted-foreground'];
            if (sentiment === 'Bullish') sentimentColor = theme.colors['--demo-bullish'];
            if (sentiment === 'Bearish') sentimentColor = theme.colors['--demo-bearish'];

            return (
              <button
                key={sentiment}
                onClick={() => setSelectedSentiment(isActive ? null : sentiment)}
                className="flex items-center gap-1.5 transition-colors"
                style={{
                  ...baseChipStyle,
                  ...(isActive && {
                    background: `hsl(${sentimentColor} / 0.15)`,
                    borderColor: `hsl(${sentimentColor})`,
                    color: `hsl(${sentimentColor})`,
                  }),
                }}
              >
                {sentiment === 'Bullish' && '↑'}
                {sentiment === 'Neutral' && '→'}
                {sentiment === 'Bearish' && '↓'}
                {sentiment}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdown Chip */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>With Dropdown</span>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5"
            style={activeChipStyle}
          >
            <Filter className="w-3 h-3" />
            Price: $100-$500
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            className="flex items-center gap-1.5"
            style={activeChipStyle}
          >
            Volume: High
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            className="flex items-center gap-1.5"
            style={baseChipStyle}
          >
            + Add Filter
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Active Filters</span>
        <div
          className="p-3 flex items-center justify-between"
          style={{
            background: `hsl(${theme.colors['--demo-muted']})`,
            border: `1px solid hsl(${theme.colors['--demo-border']})`,
            borderRadius: '4px',
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {selectedSectors.map((sector) => (
              <span
                key={sector}
                className="flex items-center gap-1"
                style={activeChipStyle}
              >
                {sector}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() => toggleSector(sector)}
                />
              </span>
            ))}
            {selectedStatuses.map((status) => (
              <span
                key={status}
                className="flex items-center gap-1"
                style={activeChipStyle}
              >
                {status}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() => toggleStatus(status)}
                />
              </span>
            ))}
            {selectedSentiment && (
              <span
                className="flex items-center gap-1"
                style={activeChipStyle}
              >
                {selectedSentiment}
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-70"
                  onClick={() => setSelectedSentiment(null)}
                />
              </span>
            )}
          </div>
          <button
            className="text-xs"
            style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }}
            onClick={() => {
              setSelectedSectors([]);
              setSelectedStatuses([]);
              setSelectedSentiment(null);
            }}
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
