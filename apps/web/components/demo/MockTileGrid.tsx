'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, Briefcase, Activity, StickyNote } from 'lucide-react';

interface MockTile {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}

const mockTiles: MockTile[] = [
  {
    id: 'chart',
    label: 'Chart',
    icon: <TrendingUp className="w-5 h-5" />,
    accentColor: 'text-blue-400',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: <Briefcase className="w-5 h-5" />,
    accentColor: 'text-emerald-400',
  },
  {
    id: 'market-pulse',
    label: 'Market Pulse',
    icon: <Activity className="w-5 h-5" />,
    accentColor: 'text-amber-400',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: <StickyNote className="w-5 h-5" />,
    accentColor: 'text-purple-400',
  },
];

export function MockTileGrid() {
  return (
    <div className="relative flex-1 min-h-[300px] bg-zinc-950">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--grid-line)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--grid-line)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Mock Tiles */}
      <div className="relative grid grid-cols-2 gap-3 p-4 h-full">
        {mockTiles.map((tile) => (
          <div
            key={tile.id}
            className={cn(
              'flex flex-col rounded border border-zinc-800',
              'bg-zinc-900/80 backdrop-blur-sm',
              'p-4'
            )}
          >
            {/* Tile Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
              <span className={tile.accentColor}>{tile.icon}</span>
              <span className="text-sm font-medium text-zinc-300">
                {tile.label}
              </span>
            </div>

            {/* Tile Content Placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-xs text-zinc-600 text-center">
                <div className="w-full h-16 bg-zinc-800/50 rounded mb-2 flex items-center justify-center">
                  <span className="text-zinc-500">[Content Area]</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
