'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  BloombergHeader,
  VSCodeHeader,
  TradingHeader,
  MinimalHeader,
  type HeaderDemoProps,
} from '@/components/demo/headers';
import { MockTileGrid } from '@/components/demo/MockTileGrid';

type DesignVariant = 'A' | 'B' | 'C' | 'D';

interface DesignInfo {
  id: DesignVariant;
  name: string;
  description: string;
  characteristics: string[];
  component: React.ComponentType<HeaderDemoProps>;
}

const designs: DesignInfo[] = [
  {
    id: 'A',
    name: 'Bloomberg Terminal',
    description: 'Dense, monospace terminal aesthetic with amber accents',
    characteristics: [
      'Monospace font with tight letter spacing',
      'Uppercase text throughout',
      'Amber/yellow accent colors (Bloomberg signature)',
      'Time/date display prominently shown',
      'Bordered pill tabs with numbered shortcuts',
      'Status indicators with colored squares',
    ],
    component: BloombergHeader,
  },
  {
    id: 'B',
    name: 'VS Code / Modern IDE',
    description: 'Clean, flat design with colored underline indicators',
    characteristics: [
      'System font with generous whitespace',
      'Active tab indicated by colored underline only',
      'Icon-only actions on right side',
      'Subtle hover states',
      'Minimal borders - just bottom line',
      'Modern, polished aesthetic',
    ],
    component: VSCodeHeader,
  },
  {
    id: 'C',
    name: 'Trading Platform (TWS)',
    description: 'Bordered buttons with grouped actions and cyan accents',
    characteristics: [
      'Raised/bordered button tabs',
      'Grouped action buttons with visible boundaries',
      'Text + icon combinations',
      'Taller header height for easier clicking',
      'Clear visual separation between sections',
      'Blue/cyan accents (trading terminal style)',
    ],
    component: TradingHeader,
  },
  {
    id: 'D',
    name: 'Minimal + Bloomberg Tabs',
    description: 'Clean minimal aesthetic with Bloomberg-style numbered tabs',
    characteristics: [
      'System font (not monospace) for readability',
      'Bloomberg-style [1] numbered bracket tabs',
      'Subtle bordered buttons with rounded corners',
      'Thin header height, minimal visual weight',
      'Icon-only actions on right side',
      'Monochrome palette with subtle hover states',
    ],
    component: MinimalHeader,
  },
];

const mockWorkspaces = [
  { id: 'main', name: 'Main' },
  { id: 'charts', name: 'Charts' },
  { id: 'analysis', name: 'Analysis' },
];

export default function TopBarDemoPage() {
  const [selectedDesign, setSelectedDesign] = useState<DesignVariant>('D');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('main');
  const [isLocked, setIsLocked] = useState(true);

  const currentDesign = designs.find((d) => d.id === selectedDesign)!;
  const HeaderComponent = currentDesign.component;

  const headerProps: HeaderDemoProps = {
    workspaces: mockWorkspaces,
    activeWorkspaceId,
    isLocked,
    onWorkspaceChange: setActiveWorkspaceId,
    onLockToggle: () => setIsLocked((prev) => !prev),
    onAddWorkspace: () => {
      // Demo: just show visual feedback
    },
    onOpenCommandBar: () => {
      // Demo: visual feedback only
    },
    onOpenSettings: () => {
      // Demo: visual feedback only
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Page Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/demo"
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Top Bar Design Variants</h1>
                <p className="text-xs text-zinc-500">
                  Compare and choose your preferred header style
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Design Selector */}
        <div className="mb-8">
          <label className="text-sm font-medium text-zinc-400 mb-3 block">
            Select Design
          </label>
          <ToggleGroup
            type="single"
            value={selectedDesign}
            onValueChange={(value) => value && setSelectedDesign(value as DesignVariant)}
            className="justify-start"
          >
            {designs.map((design) => (
              <ToggleGroupItem
                key={design.id}
                value={design.id}
                className={cn(
                  'px-4 py-2 text-sm',
                  selectedDesign === design.id
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    : 'text-zinc-400'
                )}
              >
                {design.id}: {design.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Live Preview */}
        <div className="mb-8">
          <label className="text-sm font-medium text-zinc-400 mb-3 block">
            Live Preview
          </label>
          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
            {/* Selected Header */}
            <HeaderComponent {...headerProps} />

            {/* Mock Tile Grid */}
            <MockTileGrid />
          </div>
        </div>

        {/* Design Notes */}
        <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/30">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Info className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-200 mb-1">
                {currentDesign.name}
              </h3>
              <p className="text-sm text-zinc-500">{currentDesign.description}</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 mt-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
              Key Characteristics
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentDesign.characteristics.map((char, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-zinc-400"
                >
                  <span className="text-indigo-400 mt-1">•</span>
                  {char}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive State Controls */}
        <div className="mt-8 border border-zinc-800 rounded-lg p-6 bg-zinc-900/30">
          <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
            Interactive Controls
          </h4>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsLocked((prev) => !prev)}
              className={cn(
                'px-4 py-2 rounded text-sm transition-all',
                isLocked
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              )}
            >
              {isLocked ? 'Locked' : 'Unlocked'} - Click to toggle
            </button>
            <div className="flex gap-2">
              {mockWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspaceId(ws.id)}
                  className={cn(
                    'px-3 py-2 rounded text-sm transition-all',
                    activeWorkspaceId === ws.id
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  )}
                >
                  {ws.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
