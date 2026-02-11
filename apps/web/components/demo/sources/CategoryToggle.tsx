'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOURCE_CATEGORIES, DEFAULT_ENABLED_CATEGORIES } from './data';

interface CategoryToggleProps {
  className?: string;
}

export function CategoryToggle({ className }: CategoryToggleProps) {
  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(
    new Set(DEFAULT_ENABLED_CATEGORIES)
  );

  const toggleCategory = (categoryKey: string) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-zinc-100">
        What sources do you want to follow?
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SOURCE_CATEGORIES).map(([key, category]) => {
          const isEnabled = enabledCategories.has(key);

          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                'hover:bg-zinc-800',
                isEnabled
                  ? 'bg-indigo-500/20 border-indigo-500'
                  : 'bg-zinc-900/95 border-zinc-700'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mt-0.5',
                  isEnabled
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-transparent border-zinc-600'
                )}
              >
                {isEnabled && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-100">
                  {category.label}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {category.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          {enabledCategories.size} of {Object.keys(SOURCE_CATEGORIES).length} categories enabled
        </p>
      </div>
    </div>
  );
}
