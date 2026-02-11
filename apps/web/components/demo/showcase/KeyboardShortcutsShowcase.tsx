'use client';

import { Command, Search, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';
import { getThemeStyles } from '../themes';

interface KeyboardShortcutsShowcaseProps {
  themeName: string;
}

export function KeyboardShortcutsShowcase({ themeName }: KeyboardShortcutsShowcaseProps) {
  const theme = getThemeStyles(themeName);

  const sectionLabelStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const labelStyle = {
    color: `hsl(${theme.colors['--demo-foreground']})`,
    fontSize: '12px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  };

  const mutedStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '11px',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const kbdStyle = {
    background: `hsl(${theme.colors['--demo-muted']})`,
    border: `1px solid hsl(${theme.colors['--demo-border']})`,
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    color: `hsl(${theme.colors['--demo-foreground']})`,
    minWidth: '24px',
    textAlign: 'center' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const kbdIconStyle = {
    ...kbdStyle,
    padding: '4px',
  };

  const shortcuts = {
    navigation: [
      { keys: ['⌘', 'K'], action: 'Open command palette' },
      { keys: ['⌘', 'P'], action: 'Quick symbol search' },
      { keys: ['⌘', '/'], action: 'Toggle sidebar' },
      { keys: ['⌘', 'B'], action: 'Toggle orderbook' },
    ],
    trading: [
      { keys: ['B'], action: 'Quick buy order' },
      { keys: ['S'], action: 'Quick sell order' },
      { keys: ['⌘', 'Enter'], action: 'Submit order' },
      { keys: ['Esc'], action: 'Cancel order entry' },
    ],
    charts: [
      { keys: ['1'], action: '1 minute chart' },
      { keys: ['5'], action: '5 minute chart' },
      { keys: ['D'], action: 'Daily chart' },
      { keys: ['+', '-'], action: 'Zoom in/out' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Navigation Shortcuts */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Navigation</span>
        <div className="space-y-2">
          {shortcuts.navigation.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2"
              style={{
                background: `hsl(${theme.colors['--demo-muted']})`,
                border: `1px solid hsl(${theme.colors['--demo-border']})`,
                borderRadius: '0px',
              }}
            >
              <span style={labelStyle}>{shortcut.action}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    {key === '⌘' ? (
                      <span style={kbdIconStyle}>
                        <Command className="w-3 h-3" />
                      </span>
                    ) : (
                      <span style={kbdStyle}>{key}</span>
                    )}
                    {j < shortcut.keys.length - 1 && (
                      <span style={mutedStyle} className="mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Shortcuts */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Trading</span>
        <div className="space-y-2">
          {shortcuts.trading.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2"
              style={{
                background: `hsl(${theme.colors['--demo-muted']})`,
                border: `1px solid hsl(${theme.colors['--demo-border']})`,
                borderRadius: '0px',
              }}
            >
              <span style={labelStyle}>{shortcut.action}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    {key === '⌘' ? (
                      <span style={kbdIconStyle}>
                        <Command className="w-3 h-3" />
                      </span>
                    ) : key === 'Enter' ? (
                      <span style={kbdIconStyle}>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    ) : (
                      <span style={kbdStyle}>{key}</span>
                    )}
                    {j < shortcut.keys.length - 1 && (
                      <span style={mutedStyle} className="mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Shortcuts */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Charts</span>
        <div className="space-y-2">
          {shortcuts.charts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2"
              style={{
                background: `hsl(${theme.colors['--demo-muted']})`,
                border: `1px solid hsl(${theme.colors['--demo-border']})`,
                borderRadius: '0px',
              }}
            >
              <span style={labelStyle}>{shortcut.action}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j} style={kbdStyle}>{key}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow Keys */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Arrow Key Styles</span>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span style={kbdIconStyle}><ArrowUp className="w-3 h-3" /></span>
            <div className="flex gap-1">
              <span style={kbdIconStyle}><ArrowLeft className="w-3 h-3" /></span>
              <span style={kbdIconStyle}><ArrowDown className="w-3 h-3" /></span>
              <span style={kbdIconStyle}><ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>
          <div>
            <div style={labelStyle}>Navigate lists</div>
            <div style={mutedStyle}>Move between items</div>
          </div>
        </div>
      </div>

      {/* Inline Shortcut Hints */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Inline Hints</span>
        <div
          className="flex items-center gap-2 p-3"
          style={{
            background: `hsl(${theme.colors['--demo-muted']})`,
            border: `1px solid hsl(${theme.colors['--demo-border']})`,
            borderRadius: '4px',
          }}
        >
          <Search className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-muted-foreground']})` }} />
          <span style={mutedStyle}>Search symbols...</span>
          <div className="ml-auto flex items-center gap-1">
            <span style={kbdIconStyle}><Command className="w-3 h-3" /></span>
            <span style={kbdStyle}>K</span>
          </div>
        </div>
      </div>

      {/* Shortcut Legend */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Legend Style</span>
        <div
          className="grid grid-cols-2 gap-x-6 gap-y-2 p-3"
          style={{
            background: `hsl(${theme.colors['--demo-card']})`,
            border: `1px solid hsl(${theme.colors['--demo-border']})`,
            borderRadius: '4px',
          }}
        >
          {[
            { key: '⌘', label: 'Command (Mac)' },
            { key: 'Ctrl', label: 'Control (Windows)' },
            { key: '⇧', label: 'Shift' },
            { key: '⌥', label: 'Option/Alt' },
            { key: 'Tab', label: 'Tab key' },
            { key: 'Esc', label: 'Escape' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span style={kbdStyle}>{item.key}</span>
              <span style={mutedStyle}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Combo Examples */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Common Combos</span>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <span style={kbdIconStyle}><Command className="w-3 h-3" /></span>
            <span style={kbdStyle}>⇧</span>
            <span style={kbdStyle}>P</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={kbdStyle}>Ctrl</span>
            <span style={kbdStyle}>Alt</span>
            <span style={kbdStyle}>Del</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={kbdIconStyle}><Command className="w-3 h-3" /></span>
            <span style={kbdStyle}>⌥</span>
            <span style={kbdIconStyle}><ArrowLeft className="w-3 h-3" /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
