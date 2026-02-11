'use client';

import { Lock, LockOpen, Plus, Settings, Command, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeaderDemoProps } from './BloombergHeader';

export function TradingHeader({
  workspaces,
  activeWorkspaceId,
  isLocked,
  onWorkspaceChange,
  onLockToggle,
  onAddWorkspace,
  onOpenCommandBar,
  onOpenSettings,
}: HeaderDemoProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between h-12 px-2',
        'bg-zinc-900/80 border border-zinc-700'
      )}
    >
      {/* Left: Workspace Tabs */}
      <div className="flex items-center gap-1">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => onWorkspaceChange(ws.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border rounded transition-all',
              activeWorkspaceId === ws.id
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500'
            )}
          >
            {ws.name}
          </button>
        ))}
        <button
          onClick={onAddWorkspace}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm',
            'bg-zinc-800 border border-zinc-600 rounded',
            'text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/50',
            'transition-all'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Right: Action Group */}
      <div className="flex items-center">
        <div className="flex items-center border border-zinc-600 rounded overflow-hidden">
          {/* Lock Toggle */}
          <button
            onClick={onLockToggle}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm border-r border-zinc-600',
              'transition-all',
              isLocked
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {isLocked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <LockOpen className="w-3.5 h-3.5" />
            )}
            Lock
          </button>

          {/* Reset Layout */}
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm border-r border-zinc-600',
              'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
              'transition-all'
            )}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={cn(
              'px-3 py-2 border-r border-zinc-600',
              'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
              'transition-all'
            )}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Command Bar */}
          <button
            onClick={onOpenCommandBar}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm',
              'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
              'transition-all'
            )}
          >
            <Command className="w-3.5 h-3.5" />
            Search
          </button>
        </div>
      </div>
    </header>
  );
}
