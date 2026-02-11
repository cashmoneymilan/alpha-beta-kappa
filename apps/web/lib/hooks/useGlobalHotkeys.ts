'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import type { TileType } from '@/stores/workspace';

interface HotkeyConfig {
  key: string;
  tileType: TileType;
  title: string;
  requiresSymbol?: boolean;
}

const HOTKEYS: HotkeyConfig[] = [
  { key: 'b', tileType: 'TRADE', title: 'Trade' },
  { key: 'c', tileType: 'CHART', title: 'Chart', requiresSymbol: true },
  { key: 'p', tileType: 'PORTFOLIO', title: 'Portfolio' },
  { key: 'o', tileType: 'ALERTS', title: 'Alerts' },
];

/**
 * Global hotkeys for quick tile access
 * - B: Open Trading tile
 * - C: Open Chart tile (prompts via CommandBar)
 * - P: Open Positions tile
 * - O: Open Orders tile
 */
export function useGlobalHotkeys() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const addTile = useWorkspaceStore((s) => s.addTile);
  const setCommandBarOpen = useWorkspaceStore((s) => s.setCommandBarOpen);
  const commandBarOpen = useWorkspaceStore((s) => s.commandBarOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        commandBarOpen
      ) {
        return;
      }

      // Don't trigger with modifier keys (except shift for uppercase)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      const hotkey = HOTKEYS.find((h) => h.key === key);

      if (hotkey && activeWorkspaceId) {
        e.preventDefault();

        if (hotkey.requiresSymbol) {
          // For tiles that need symbol input, open command bar
          setCommandBarOpen(true);
        } else {
          // Directly add the tile
          const tileId = `${hotkey.tileType.toLowerCase()}-${Date.now()}`;
          addTile(activeWorkspaceId, {
            id: tileId,
            type: hotkey.tileType,
            title: hotkey.title,
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeWorkspaceId, addTile, setCommandBarOpen, commandBarOpen]);
}
