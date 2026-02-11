'use client';

import { Check } from 'lucide-react';
import { themeList, type Theme } from './themes';
import { useDemoStore } from '@/stores/demoStore';

function ThemeCard({ theme, isSelected }: { theme: Theme; isSelected: boolean }) {
  const toggleTheme = useDemoStore((state) => state.toggleTheme);

  // Get preview colors
  const bg = theme.colors['--demo-background'];
  const card = theme.colors['--demo-card'];
  const primary = theme.colors['--demo-primary'];
  const foreground = theme.colors['--demo-foreground'];
  const border = theme.colors['--demo-border'];

  return (
    <button
      onClick={() => toggleTheme(theme.name)}
      className={`
        relative p-3 rounded-lg border-2 transition-all text-left
        ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-zinc-600'}
      `}
      style={{
        backgroundColor: `hsl(${bg})`,
      }}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Mini preview */}
      <div className="space-y-2">
        {/* Header preview */}
        <div
          className="h-3 rounded-sm"
          style={{ backgroundColor: `hsl(${primary})`, width: '60%' }}
        />

        {/* Card preview */}
        <div
          className="p-2 rounded-sm"
          style={{
            backgroundColor: `hsl(${card})`,
            border: `1px solid hsl(${border})`,
          }}
        >
          <div
            className="h-2 rounded-sm mb-1"
            style={{ backgroundColor: `hsl(${foreground} / 0.3)`, width: '80%' }}
          />
          <div
            className="h-2 rounded-sm"
            style={{ backgroundColor: `hsl(${foreground} / 0.2)`, width: '50%' }}
          />
        </div>

        {/* Buttons preview */}
        <div className="flex gap-1">
          <div
            className="h-4 rounded-sm flex-1"
            style={{ backgroundColor: `hsl(${primary})` }}
          />
          <div
            className="h-4 rounded-sm flex-1"
            style={{
              backgroundColor: `hsl(${card})`,
              border: `1px solid hsl(${border})`,
            }}
          />
        </div>
      </div>

      {/* Theme name */}
      <div className="mt-3">
        <p
          className="text-xs font-medium"
          style={{ color: `hsl(${foreground})` }}
        >
          {theme.label}
        </p>
        <p
          className="text-[10px] mt-0.5 line-clamp-1"
          style={{ color: `hsl(${foreground} / 0.6)` }}
        >
          {theme.description}
        </p>
      </div>
    </button>
  );
}

export function ThemeSelector() {
  const selectedThemes = useDemoStore((state) => state.selectedThemes);

  return (
    <div className="grid grid-cols-4 gap-3">
      {themeList.map((theme) => (
        <ThemeCard
          key={theme.name}
          theme={theme}
          isSelected={selectedThemes.includes(theme.name)}
        />
      ))}
    </div>
  );
}

export function ThemeSelectorCompact() {
  const selectedThemes = useDemoStore((state) => state.selectedThemes);
  const toggleTheme = useDemoStore((state) => state.toggleTheme);

  return (
    <div className="flex flex-wrap gap-2">
      {themeList.map((theme) => {
        const isSelected = selectedThemes.includes(theme.name);
        const primary = theme.colors['--demo-primary'];
        const bg = theme.colors['--demo-background'];

        return (
          <button
            key={theme.name}
            onClick={() => toggleTheme(theme.name)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${isSelected ? 'ring-2 ring-offset-2 ring-offset-zinc-900' : 'opacity-60 hover:opacity-100'}
            `}
            style={{
              backgroundColor: `hsl(${bg})`,
              color: `hsl(${primary})`,
              border: `1px solid hsl(${primary} / 0.5)`,
              outlineColor: isSelected ? `hsl(${primary})` : undefined,
            }}
          >
            {isSelected && <span className="mr-1">*</span>}
            {theme.label}
          </button>
        );
      })}
    </div>
  );
}
