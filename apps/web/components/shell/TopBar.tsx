'use client';

import * as React from 'react';
import {
  Plus,
  Lock,
  LockOpen,
  RotateCcw,
  ChevronDown,
  X,
  Settings,
  Command,
  Sparkles,
  Activity,
  Bell,
  StickyNote,
  CandlestickChart,
  ShoppingCart,
  Briefcase,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore, tileColors } from '@/stores/workspace';
import type { TileType } from '@/stores/workspace';
import { useSettingsStore } from '@/stores/settings';
import { SettingsSheet } from '@/components/SettingsSheet';

const tileOptions: { type: TileType; label: string; icon: LucideIcon }[] = [
  { type: 'MARKETPULSE', label: 'Market Pulse', icon: Activity },
  { type: 'CHART', label: 'Ticker', icon: CandlestickChart },  // Renamed from Chart to Ticker
  { type: 'TRADE', label: 'Trade', icon: ShoppingCart },
  { type: 'PORTFOLIO', label: 'Portfolio', icon: Briefcase },
  { type: 'LEADERBOARD', label: 'Leaderboard', icon: Trophy },
  { type: 'ALERTS', label: 'Alerts', icon: Bell },
  { type: 'NOTES', label: 'Notes', icon: StickyNote },
];

interface TopBarProps {
  onOpenWizard: () => void;
}

export function TopBar({ onOpenWizard }: TopBarProps) {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);
  const removeWorkspace = useWorkspaceStore((s) => s.removeWorkspace);
  const isLocked = useWorkspaceStore((s) => s.isLocked);
  const setLocked = useWorkspaceStore((s) => s.setLocked);
  const addTile = useWorkspaceStore((s) => s.addTile);
  const resetWorkspace = useWorkspaceStore((s) => s.resetWorkspace);
  const userTickers = useSettingsStore((s) => s.userTickers);

  const [isCreatingWorkspace, setIsCreatingWorkspace] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [isWindowMenuOpen, setIsWindowMenuOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Focus input when creating workspace
  React.useEffect(() => {
    if (isCreatingWorkspace && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingWorkspace]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsWindowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const id = newWorkspaceName.toLowerCase().replace(/\s+/g, '-');
      addWorkspace({ id, name: newWorkspaceName.trim() });
      setActiveWorkspace(id);
    }
    setIsCreatingWorkspace(false);
    setNewWorkspaceName('');
  };

  const handleAddTile = (type: TileType) => {
    if (!activeWorkspaceId) return;
    addTile(activeWorkspaceId, {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      title: type,
      linkGroup: 'none',
    });
    setIsWindowMenuOpen(false);
  };

  const handleReset = () => {
    if (!activeWorkspaceId) return;
    if (confirm('Reset workspace to default layout?')) {
      resetWorkspace(activeWorkspaceId);
    }
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between h-10 px-3',
        'bg-transparent border-b border-zinc-800/50'
      )}
    >
      {/* Left: Workspace Tabs */}
      <div className="flex items-center gap-1">
        {workspaces.map((ws, index) => (
          <button
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className={cn(
              'group flex items-center gap-1 px-3 py-1.5 text-sm border rounded transition-all',
              'hover:bg-zinc-800/50',
              activeWorkspaceId === ws.id
                ? 'border-zinc-600 bg-zinc-800/50 text-zinc-100'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            )}
          >
            <span className="text-zinc-500">[{index + 1}]</span>
            <span>{ws.name}</span>
            {workspaces.length > 1 && (
              <X
                className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWorkspace(ws.id);
                }}
              />
            )}
          </button>
        ))}

        {/* New Workspace Input/Button */}
        {isCreatingWorkspace ? (
          <input
            ref={inputRef}
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateWorkspace();
              if (e.key === 'Escape') {
                setIsCreatingWorkspace(false);
                setNewWorkspaceName('');
              }
            }}
            onBlur={handleCreateWorkspace}
            placeholder="Name..."
            className="w-24 px-2 py-1.5 text-sm bg-zinc-900 rounded border border-zinc-700 outline-none focus:border-zinc-500"
          />
        ) : (
          <button
            onClick={() => setIsCreatingWorkspace(true)}
            className={cn(
              'px-2 py-1.5 border border-zinc-800 rounded text-zinc-600',
              'hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-800/50',
              'transition-all'
            )}
            title="New workspace"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1" ref={dropdownRef}>
        {/* Add Window Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsWindowMenuOpen(!isWindowMenuOpen)}
            disabled={isLocked}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded transition-all',
              'hover:bg-zinc-800/50',
              isLocked
                ? 'text-zinc-700 cursor-not-allowed'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
            title="Add tile"
          >
            <Plus className="h-3.5 w-3.5" />
            <ChevronDown
              className={cn('h-3 w-3 transition-transform', isWindowMenuOpen && 'rotate-180')}
            />
          </button>

          {isWindowMenuOpen && !isLocked && (
            <>
              <div
                className="fixed inset-0 z-[140]"
                onClick={() => setIsWindowMenuOpen(false)}
              />
              <div
                className="absolute top-full right-0 mt-1 w-44 z-[150] rounded border border-zinc-700 shadow-xl overflow-hidden"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                {tileOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => handleAddTile(opt.type)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <opt.icon
                      className="h-3.5 w-3.5"
                      style={{ color: `hsl(${tileColors[opt.type]})` }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lock Toggle */}
        <button
          onClick={() => setLocked(!isLocked)}
          className={cn(
            'p-1.5 rounded transition-all',
            'hover:bg-zinc-800/50',
            isLocked ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400'
          )}
          title={isLocked ? 'Layout Locked' : 'Layout Unlocked'}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <LockOpen className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          disabled={isLocked}
          className={cn(
            'p-1.5 rounded transition-all',
            'hover:bg-zinc-800/50',
            isLocked
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-600 hover:text-zinc-400'
          )}
          title="Reset layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Settings */}
        <SettingsSheet
          trigger={
            <button
              className={cn(
                'p-1.5 rounded text-zinc-600 hover:text-zinc-400',
                'hover:bg-zinc-800/50 transition-all'
              )}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          }
        />

        {/* Interest Wizard */}
        <button
          onClick={onOpenWizard}
          className={cn(
            'flex items-center gap-1 p-1.5 rounded transition-all',
            'hover:bg-zinc-800/50',
            userTickers.length > 0
              ? 'text-zinc-600 hover:text-zinc-400'
              : 'text-amber-500 hover:text-amber-400'
          )}
          title="Setup Interests"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {userTickers.length > 0 && (
            <span className="text-xs text-zinc-500">{userTickers.length}</span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-800 mx-1" />

        {/* Command Bar Hint */}
        <button
          className={cn(
            'p-1.5 rounded text-zinc-600 hover:text-zinc-400',
            'hover:bg-zinc-800/50 transition-all'
          )}
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
