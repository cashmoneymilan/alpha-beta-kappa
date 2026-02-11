'use client';

import { Lock, LockOpen, Settings, Command, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeaderDemoProps } from './BloombergHeader';

export function MinimalHeader({
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
        'flex items-center justify-between h-10 px-3',
        'bg-transparent border-b border-zinc-800/50'
      )}
    >
      {/* Left: Bloomberg-style numbered tabs with system font */}
      <div className="flex items-center gap-1">
        {workspaces.map((ws, index) => (
          <button
            key={ws.id}
            onClick={() => onWorkspaceChange(ws.id)}
            className={cn(
              'px-3 py-1.5 text-sm border rounded transition-all',
              'hover:bg-zinc-800/50',
              activeWorkspaceId === ws.id
                ? 'border-zinc-600 bg-zinc-800/50 text-zinc-100'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            )}
          >
            <span className="text-zinc-500 mr-1.5">[{index + 1}]</span>
            {ws.name}
          </button>
        ))}
        <button
          onClick={onAddWorkspace}
          className={cn(
            'px-2 py-1.5 border border-zinc-800 rounded text-zinc-600',
            'hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-800/50',
            'transition-all'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Icon-only Actions */}
      <div className="flex items-center gap-1">
        {/* Lock Toggle */}
        <button
          onClick={onLockToggle}
          className={cn(
            'p-1.5 rounded transition-all',
            'hover:bg-zinc-800/50',
            isLocked
              ? 'text-zinc-300'
              : 'text-zinc-600 hover:text-zinc-400'
          )}
          title={isLocked ? 'Layout Locked' : 'Layout Unlocked'}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <LockOpen className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={cn(
            'p-1.5 rounded text-zinc-600 hover:text-zinc-400',
            'hover:bg-zinc-800/50 transition-all'
          )}
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Command Bar */}
        <button
          onClick={onOpenCommandBar}
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
