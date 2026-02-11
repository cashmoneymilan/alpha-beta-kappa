'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CategoryToggle } from '@/components/demo/sources/CategoryToggle';
import { IndividualToggle } from '@/components/demo/sources/IndividualToggle';
import { ExpandableToggle } from '@/components/demo/sources/ExpandableToggle';

type Approach = 'A' | 'B' | 'C';

const APPROACH_INFO: Record<Approach, { title: string; pros: string[]; cons: string[]; useCase: string }> = {
  A: {
    title: 'By Category',
    pros: ['Simple and clean interface', 'Not overwhelming for new users', 'Quick to configure'],
    cons: ['Less granular control', 'All-or-nothing for each category'],
    useCase: 'Best for users who want quick setup and trust curated category groupings.',
  },
  B: {
    title: 'By Individual Source',
    pros: ['Maximum control over each source', 'Can cherry-pick specific handles', 'Transparent about what you follow'],
    cons: ['Can be overwhelming with many sources', 'Takes longer to configure'],
    useCase: 'Best for power users who know exactly which accounts they want to follow.',
  },
  C: {
    title: 'Expandable Categories',
    pros: ['Best of both worlds', 'Simple default view', 'Granular control when needed'],
    cons: ['Slightly more complex UI', 'Requires additional clicks to expand'],
    useCase: 'Best for most users - simple by default with power-user options available.',
  },
};

export default function SourcesDemo() {
  const [selectedApproach, setSelectedApproach] = useState<Approach>('A');

  const renderApproach = () => {
    switch (selectedApproach) {
      case 'A':
        return <CategoryToggle />;
      case 'B':
        return <IndividualToggle />;
      case 'C':
        return <ExpandableToggle />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            SOURCE TOGGLE DESIGNS
          </h1>
          <p className="text-sm text-zinc-400">
            Compare 3 approaches for source toggling UI
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {(['A', 'B', 'C'] as const).map((approach) => (
            <button
              key={approach}
              onClick={() => setSelectedApproach(approach)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                selectedApproach === approach
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              )}
            >
              {approach}: {APPROACH_INFO[approach].title}
            </button>
          ))}
        </div>

        <div className="bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-xl p-6">
          {renderApproach()}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Approach {selectedApproach} Notes
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-green-400 uppercase tracking-wider">
                Pros
              </h3>
              <ul className="space-y-1">
                {APPROACH_INFO[selectedApproach].pros.map((pro, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider">
                Cons
              </h3>
              <ul className="space-y-1">
                {APPROACH_INFO[selectedApproach].cons.map((con, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              When to use
            </h3>
            <p className="text-sm text-zinc-400">
              {APPROACH_INFO[selectedApproach].useCase}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
