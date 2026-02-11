'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_CATEGORIES, DEFAULT_ENABLED_CATEGORIES, getSourcesByType, type SourceType } from './data';

interface IndividualToggleProps {
  className?: string;
}

// Get default enabled source handles based on default categories
function getDefaultEnabledSources(): Set<string> {
  const handles = new Set<string>();
  DEFAULT_ENABLED_CATEGORIES.forEach((categoryKey) => {
    const category = SOURCE_CATEGORIES[categoryKey];
    if (category) {
      category.sources.forEach((source) => {
        handles.add(source.handle);
      });
    }
  });
  return handles;
}

const TYPE_LABELS: Record<SourceType, string> = {
  twitter: 'TWITTER',
  rss: 'RSS FEEDS',
  news: 'NEWS',
};

export function IndividualToggle({ className }: IndividualToggleProps) {
  const [enabledSources, setEnabledSources] = useState<Set<string>>(
    getDefaultEnabledSources()
  );

  const toggleSource = (handle: string) => {
    setEnabledSources((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  };

  const sourcesByType = getSourcesByType();
  const totalSources = Object.values(sourcesByType).flat().length;

  return (
    <div className={cn('space-y-5', className)}>
      <h3 className="text-sm font-medium text-zinc-100">
        What sources do you want to follow?
      </h3>

      {Object.entries(sourcesByType).map(([type, sources]) => {
        if (sources.length === 0) return null;

        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                {TYPE_LABELS[type as SourceType]}
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sources.map(({ source }) => {
                const isEnabled = enabledSources.has(source.handle);

                return (
                  <button
                    key={source.handle}
                    onClick={() => toggleSource(source.handle)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded border text-left transition-all',
                      'hover:bg-zinc-800',
                      isEnabled
                        ? 'bg-indigo-500/20 border-indigo-500'
                        : 'bg-zinc-900/95 border-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
                        isEnabled
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'bg-transparent border-zinc-600'
                      )}
                    >
                      {isEnabled && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs text-zinc-200 truncate">
                      {source.handle.startsWith('@') ? source.handle : source.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          {enabledSources.size} of {totalSources} sources enabled
        </p>
      </div>
    </div>
  );
}
