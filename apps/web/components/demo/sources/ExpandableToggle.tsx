'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_CATEGORIES, DEFAULT_ENABLED_CATEGORIES } from './data';

interface ExpandableToggleProps {
  className?: string;
}

interface CategoryState {
  enabled: boolean;
  expanded: boolean;
  enabledSources: Set<string>;
}

function getInitialState(): Record<string, CategoryState> {
  const state: Record<string, CategoryState> = {};

  Object.entries(SOURCE_CATEGORIES).forEach(([key, category]) => {
    const isDefaultEnabled = DEFAULT_ENABLED_CATEGORIES.includes(key);
    state[key] = {
      enabled: isDefaultEnabled,
      expanded: false,
      enabledSources: new Set(
        isDefaultEnabled ? category.sources.map((s) => s.handle) : []
      ),
    };
  });

  return state;
}

export function ExpandableToggle({ className }: ExpandableToggleProps) {
  const [categoryStates, setCategoryStates] = useState<Record<string, CategoryState>>(
    getInitialState()
  );

  const toggleExpanded = (categoryKey: string) => {
    setCategoryStates((prev) => {
      const current = prev[categoryKey];
      if (!current) return prev;
      return {
        ...prev,
        [categoryKey]: {
          ...current,
          expanded: !current.expanded,
        },
      };
    });
  };

  const toggleCategory = (categoryKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const category = SOURCE_CATEGORIES[categoryKey];
    if (!category) return;

    setCategoryStates((prev) => {
      const currentState = prev[categoryKey];
      if (!currentState) return prev;
      const newEnabled = !currentState.enabled;

      return {
        ...prev,
        [categoryKey]: {
          ...currentState,
          enabled: newEnabled,
          enabledSources: new Set(
            newEnabled ? category.sources.map((s) => s.handle) : []
          ),
        },
      };
    });
  };

  const toggleSource = (categoryKey: string, handle: string) => {
    setCategoryStates((prev) => {
      const currentState = prev[categoryKey];
      if (!currentState) return prev;
      const newEnabledSources = new Set(currentState.enabledSources);

      if (newEnabledSources.has(handle)) {
        newEnabledSources.delete(handle);
      } else {
        newEnabledSources.add(handle);
      }

      const category = SOURCE_CATEGORIES[categoryKey];
      if (!category) return prev;
      const allEnabled = newEnabledSources.size === category.sources.length;
      const someEnabled = newEnabledSources.size > 0;

      return {
        ...prev,
        [categoryKey]: {
          ...currentState,
          enabled: allEnabled || someEnabled,
          enabledSources: newEnabledSources,
        },
      };
    });
  };

  const totalCategories = Object.keys(SOURCE_CATEGORIES).length;
  const enabledCategories = Object.values(categoryStates).filter((s) => s.enabled).length;
  const totalSources = Object.values(SOURCE_CATEGORIES).flatMap((c) => c.sources).length;
  const enabledSources = Object.values(categoryStates).reduce(
    (acc, s) => acc + s.enabledSources.size,
    0
  );

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-zinc-100">
        What sources do you want to follow?
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SOURCE_CATEGORIES).map(([key, category]) => {
          const state = categoryStates[key];
          if (!state) return null;
          const isPartial = state.enabledSources.size > 0 &&
            state.enabledSources.size < category.sources.length;

          return (
            <div
              key={key}
              className={cn(
                'border rounded-lg overflow-hidden transition-all',
                state.enabled
                  ? 'bg-indigo-500/20 border-indigo-500'
                  : 'bg-zinc-900/95 border-zinc-700'
              )}
            >
              <button
                onClick={() => toggleExpanded(key)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 text-left transition-colors',
                  'hover:bg-zinc-800/50'
                )}
              >
                <div
                  onClick={(e) => toggleCategory(key, e)}
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center cursor-pointer mt-0.5',
                    state.enabled
                      ? isPartial
                        ? 'bg-indigo-500/50 border-indigo-500'
                        : 'bg-indigo-500 border-indigo-500'
                      : 'bg-transparent border-zinc-600 hover:border-zinc-500'
                  )}
                >
                  {state.enabled && (
                    <Check className={cn('w-3 h-3 text-white', isPartial && 'opacity-70')} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-zinc-100">
                      {category.label}
                    </span>
                    {state.expanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {category.description}
                  </div>
                  {!state.expanded && (
                    <div className="text-[10px] text-zinc-500 mt-1">
                      {state.enabledSources.size}/{category.sources.length} sources
                    </div>
                  )}
                </div>
              </button>

              {state.expanded && (
                <div className="border-t border-zinc-800/50 bg-zinc-950/50 px-3 py-2 space-y-1">
                  {category.sources.map((source) => {
                    const isSourceEnabled = state.enabledSources.has(source.handle);

                    return (
                      <button
                        key={source.handle}
                        onClick={() => toggleSource(key, source.handle)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors',
                          'hover:bg-zinc-800',
                          isSourceEnabled && 'bg-zinc-800/50'
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
                            isSourceEnabled
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'bg-transparent border-zinc-600'
                          )}
                        >
                          {isSourceEnabled && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-xs text-zinc-300 truncate">
                          {source.handle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          {enabledCategories} of {totalCategories} categories · {enabledSources} of {totalSources} sources enabled
        </p>
      </div>
    </div>
  );
}
