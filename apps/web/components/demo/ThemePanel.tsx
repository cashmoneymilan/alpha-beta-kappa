'use client';

import { useMemo, type ReactNode } from 'react';
import { themes, type Theme } from './themes';

interface ThemePanelProps {
  themeName: string;
  children: ReactNode;
  className?: string;
  showLabel?: boolean;
}

export function ThemePanel({
  themeName,
  children,
  className = '',
  showLabel = true,
}: ThemePanelProps) {
  const theme = themes[themeName];

  const cssVariables = useMemo(() => {
    if (!theme) return {};
    return Object.entries(theme.colors).reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [theme]);

  const borderRadius = theme?.effects.borderRadius || '8px';

  if (!theme) {
    return (
      <div className={`p-4 border border-red-500 ${className}`}>
        Theme &quot;{themeName}&quot; not found
      </div>
    );
  }

  return (
    <div
      data-demo-theme={themeName}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...cssVariables,
        borderRadius,
        fontFamily: theme.effects.fontFamily,
      }}
    >
      {showLabel && (
        <div
          className="px-3 py-2 text-xs font-medium uppercase tracking-wider border-b"
          style={{
            backgroundColor: 'hsl(var(--demo-muted))',
            color: 'hsl(var(--demo-muted-foreground))',
            borderColor: 'hsl(var(--demo-border))',
          }}
        >
          {theme.label}
        </div>
      )}
      <div
        className="p-4"
        style={{
          backgroundColor: 'hsl(var(--demo-background))',
          color: 'hsl(var(--demo-foreground))',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ThemePanelCompact({
  themeName,
  children,
  className = '',
}: Omit<ThemePanelProps, 'showLabel'>) {
  const theme = themes[themeName];

  const cssVariables = useMemo(() => {
    if (!theme) return {};
    return Object.entries(theme.colors).reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [theme]);

  const borderRadius = theme?.effects.borderRadius || '8px';

  if (!theme) return null;

  return (
    <div
      data-demo-theme={themeName}
      className={`overflow-hidden ${className}`}
      style={{
        ...cssVariables,
        borderRadius,
        fontFamily: theme.effects.fontFamily,
        backgroundColor: 'hsl(var(--demo-background))',
        color: 'hsl(var(--demo-foreground))',
      }}
    >
      {children}
    </div>
  );
}
