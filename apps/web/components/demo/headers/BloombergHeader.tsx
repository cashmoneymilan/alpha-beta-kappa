'use client';

import { Lock, LockOpen, Plus, Settings, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderDemoProps {
  workspaces: { id: string; name: string }[];
  activeWorkspaceId: string;
  isLocked: boolean;
  onWorkspaceChange: (id: string) => void;
  onLockToggle: () => void;
  onAddWorkspace: () => void;
  onOpenCommandBar: () => void;
  onOpenSettings: () => void;
}

export function BloombergHeader({
  workspaces,
  activeWorkspaceId,
  isLocked,
  onWorkspaceChange,
  onLockToggle,
  onAddWorkspace,
  onOpenCommandBar,
  onOpenSettings,
}: HeaderDemoProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <header
      className={cn(
        'flex items-center justify-between h-10 px-3',
        'bg-amber-500/5 border border-amber-500/30',
        'font-mono text-xs uppercase tracking-widest'
      )}
    >
      {/* Left: Workspace Tabs */}
      <div className="flex items-center gap-1">
        {workspaces.map((ws, index) => (
          <button
            key={ws.id}
            onClick={() => onWorkspaceChange(ws.id)}
            className={cn(
              'px-3 py-1.5 border transition-all',
              'hover:bg-amber-500/10',
              activeWorkspaceId === ws.id
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-zinc-700 text-zinc-400 hover:border-amber-500/50'
            )}
          >
            <span className="text-amber-500 mr-1.5">[{index + 1}]</span>
            {ws.name}
          </button>
        ))}
        <button
          onClick={onAddWorkspace}
          className={cn(
            'px-2 py-1.5 border border-zinc-700 text-zinc-500',
            'hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10',
            'transition-all'
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Right: Status + Actions + Time */}
      <div className="flex items-center gap-3">
        {/* Lock Status */}
        <button
          onClick={onLockToggle}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 border transition-all',
            isLocked
              ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
              : 'border-zinc-700 text-zinc-500 hover:border-amber-500/30'
          )}
        >
          <span
            className={cn(
              'w-2 h-2',
              isLocked ? 'bg-amber-500' : 'bg-zinc-600'
            )}
          />
          {isLocked ? 'LOCKED' : 'UNLOCKED'}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-700" />

        {/* Command Bar */}
        <button
          onClick={onOpenCommandBar}
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-zinc-500',
            'hover:text-amber-400 transition-colors'
          )}
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={cn(
            'p-1 text-zinc-500 hover:text-amber-400 transition-colors'
          )}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-700" />

        {/* Time */}
        <div className="text-amber-500 tabular-nums tracking-wider">
          {currentTime} <span className="text-zinc-500">EST</span>
        </div>
      </div>
    </header>
  );
}
