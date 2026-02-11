'use client';

import { useState } from 'react';
import { getThemeStyles } from '../themes';

interface SlidersShowcaseProps {
  themeName: string;
}

export function SlidersShowcase({ themeName }: SlidersShowcaseProps) {
  const theme = getThemeStyles(themeName);
  const [riskLevel, setRiskLevel] = useState(30);
  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(15);
  const [positionSize, setPositionSize] = useState(50);

  const sliderTrackStyle = {
    background: `hsl(${theme.colors['--demo-muted']})`,
  };

  const getSliderFillStyle = (value: number, max: number, color?: string) => ({
    background: color || `hsl(${theme.colors['--demo-primary']})`,
    width: `${(value / max) * 100}%`,
  });

  const labelStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const valueStyle = {
    color: `hsl(${theme.colors['--demo-foreground']})`,
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const thumbStyle = {
    background: `hsl(${theme.colors['--demo-foreground']})`,
    border: `2px solid hsl(${theme.colors['--demo-border']})`,
  };

  return (
    <div className="space-y-6">
      {/* Risk Level Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span style={labelStyle}>Risk Level</span>
          <span style={valueStyle}>{riskLevel}%</span>
        </div>
        <div className="relative h-2 rounded-none" style={sliderTrackStyle}>
          <div
            className="absolute h-full rounded-none transition-all"
            style={getSliderFillStyle(riskLevel, 100,
              riskLevel > 70 ? `hsl(${theme.colors['--demo-bearish']})` :
              riskLevel > 40 ? `hsl(${theme.colors['--demo-accent']})` :
              `hsl(${theme.colors['--demo-bullish']})`
            )}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={riskLevel}
            onChange={(e) => setRiskLevel(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm cursor-pointer"
            style={{ ...thumbStyle, left: `calc(${riskLevel}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }}>
          <span>Conservative</span>
          <span>Aggressive</span>
        </div>
      </div>

      {/* Stop Loss / Take Profit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={labelStyle}>Stop Loss</span>
            <span style={{ ...valueStyle, color: `hsl(${theme.colors['--demo-bearish']})` }}>-{stopLoss}%</span>
          </div>
          <div className="relative h-2 rounded-none" style={sliderTrackStyle}>
            <div
              className="absolute h-full rounded-none"
              style={getSliderFillStyle(stopLoss, 25, `hsl(${theme.colors['--demo-bearish']})`)}
            />
            <input
              type="range"
              min="1"
              max="25"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-sm"
              style={{ ...thumbStyle, left: `calc(${(stopLoss / 25) * 100}% - 6px)` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={labelStyle}>Take Profit</span>
            <span style={{ ...valueStyle, color: `hsl(${theme.colors['--demo-bullish']})` }}>+{takeProfit}%</span>
          </div>
          <div className="relative h-2 rounded-none" style={sliderTrackStyle}>
            <div
              className="absolute h-full rounded-none"
              style={getSliderFillStyle(takeProfit, 50, `hsl(${theme.colors['--demo-bullish']})`)}
            />
            <input
              type="range"
              min="1"
              max="50"
              value={takeProfit}
              onChange={(e) => setTakeProfit(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-sm"
              style={{ ...thumbStyle, left: `calc(${(takeProfit / 50) * 100}% - 6px)` }}
            />
          </div>
        </div>
      </div>

      {/* Position Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span style={labelStyle}>Position Size</span>
          <span style={valueStyle}>${(positionSize * 100).toLocaleString()}</span>
        </div>
        <div className="relative h-2 rounded-none" style={sliderTrackStyle}>
          <div
            className="absolute h-full rounded-none"
            style={getSliderFillStyle(positionSize, 100)}
          />
          <input
            type="range"
            min="1"
            max="100"
            value={positionSize}
            onChange={(e) => setPositionSize(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm"
            style={{ ...thumbStyle, left: `calc(${positionSize}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between">
          {[0, 25, 50, 75, 100].map((mark) => (
            <button
              key={mark}
              onClick={() => setPositionSize(mark || 1)}
              className="text-xs px-2 py-1 rounded-none transition-colors"
              style={{
                background: positionSize === mark ? `hsl(${theme.colors['--demo-primary']})` : 'transparent',
                color: positionSize === mark ? `hsl(${theme.colors['--demo-primary-foreground']})` : `hsl(${theme.colors['--demo-muted-foreground']})`,
              }}
            >
              {mark}%
            </button>
          ))}
        </div>
      </div>

      {/* Discrete Slider */}
      <div className="space-y-2">
        <span style={labelStyle}>Leverage</span>
        <div className="flex gap-1">
          {[1, 2, 3, 5, 10, 20].map((lev) => (
            <button
              key={lev}
              className="flex-1 py-2 text-center text-sm font-mono transition-colors"
              style={{
                background: `hsl(${theme.colors['--demo-muted']})`,
                color: `hsl(${theme.colors['--demo-foreground']})`,
                border: `1px solid hsl(${theme.colors['--demo-border']})`,
              }}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
