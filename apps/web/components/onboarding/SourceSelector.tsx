'use client';

import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_CATEGORIES } from '@/components/demo/sources/data';

interface SourceSelectorProps {
  enabledSources: Record<string, Set<string>>;
  onToggleCategory: (categoryKey: string) => void;
  onToggleSource: (categoryKey: string, handle: string) => void;
  expandedCategories: Set<string>;
  onToggleExpanded: (categoryKey: string) => void;
}

export function SourceSelector({
  enabledSources,
  onToggleCategory,
  onToggleSource,
  expandedCategories,
  onToggleExpanded,
}: SourceSelectorProps) {
  const totalCategories = Object.keys(SOURCE_CATEGORIES).length;
  const enabledCategoryCount = Object.values(enabledSources).filter(
    (sources) => sources.size > 0
  ).length;
  const totalSources = Object.values(SOURCE_CATEGORIES).flatMap((c) => c.sources).length;
  const enabledSourceCount = Object.values(enabledSources).reduce(
    (acc, sources) => acc + sources.size,
    0
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SOURCE_CATEGORIES).map(([key, category]) => {
          const sources = enabledSources[key] || new Set<string>();
          const isEnabled = sources.size > 0;
          const isPartial = sources.size > 0 && sources.size < category.sources.length;
          const isExpanded = expandedCategories.has(key);

          return (
            <div
              key={key}
              className={cn(
                'border rounded-lg overflow-hidden transition-all',
                isEnabled
                  ? 'border-indigo-500 bg-indigo-500/20'
                  : 'border-zinc-700 bg-zinc-800/50'
              )}
            >
              <button
                onClick={() => onToggleExpanded(key)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 text-left transition-colors',
                  'hover:bg-zinc-800/50'
                )}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCategory(key);
                  }}
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mt-0.5',
                    isEnabled
                      ? isPartial
                        ? 'bg-indigo-400 border-indigo-500'
                        : 'bg-indigo-500 border-indigo-500'
                      : 'bg-zinc-900 border-zinc-500 hover:border-zinc-400'
                  )}
                >
                  {isEnabled && (
                    <Check className={cn('w-3 h-3 text-white', isPartial && 'opacity-70')} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-zinc-100">
                      {category.label}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {category.description}
                  </div>
                  {!isExpanded && (
                    <div className="text-[10px] text-zinc-500 mt-1">
                      {sources.size}/{category.sources.length} sources
                    </div>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-700 bg-zinc-900/50 px-3 py-2 space-y-1">
                  {category.sources.map((source) => {
                    const isSourceEnabled = sources.has(source.handle);

                    return (
                      <button
                        key={source.handle}
                        onClick={() => onToggleSource(key, source.handle)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors',
                          'hover:bg-zinc-800',
                          isSourceEnabled && 'bg-zinc-800'
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center',
                            isSourceEnabled
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'bg-zinc-900 border-zinc-500'
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

      <div className="pt-2 border-t border-zinc-700">
        <p className="text-xs text-zinc-500">
          {enabledCategoryCount} of {totalCategories} categories · {enabledSourceCount} of {totalSources} sources enabled
        </p>
      </div>
    </div>
  );
}
