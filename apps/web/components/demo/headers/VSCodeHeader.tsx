'use client';

import { Lock, LockOpen, Plus, Settings, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeaderDemoProps } from './BloombergHeader';

export function VSCodeHeader({
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
        'flex items-center justify-between h-11',
        'bg-transparent border-b border-zinc-800'
      )}
    >
      {/* Left: Workspace Tabs */}
      <div className="flex items-center h-full">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => onWorkspaceChange(ws.id)}
            className={cn(
              'px-4 h-full text-sm font-medium transition-all relative',
              'hover:text-zinc-100',
              activeWorkspaceId === ws.id
                ? 'text-zinc-100'
                : 'text-zinc-400'
            )}
          >
            {ws.name}
            {/* Active underline indicator */}
            {activeWorkspaceId === ws.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
        <button
          onClick={onAddWorkspace}
          className={cn(
            'px-3 h-full text-zinc-500',
            'hover:text-zinc-100 hover:bg-zinc-800/50',
            'transition-all'
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 pr-2">
        {/* Lock Toggle */}
        <button
          onClick={onLockToggle}
          className={cn(
            'p-2 rounded-md transition-all',
            'hover:bg-zinc-800',
            isLocked ? 'text-blue-400' : 'text-zinc-500'
          )}
          title={isLocked ? 'Layout Locked' : 'Layout Unlocked'}
        >
          {isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <LockOpen className="w-4 h-4" />
          )}
        </button>

        {/* Command Bar */}
        <button
          onClick={onOpenCommandBar}
          className={cn(
            'p-2 rounded-md text-zinc-500',
            'hover:bg-zinc-800 hover:text-zinc-100',
            'transition-all'
          )}
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={cn(
            'p-2 rounded-md text-zinc-500',
            'hover:bg-zinc-800 hover:text-zinc-100',
            'transition-all'
          )}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
