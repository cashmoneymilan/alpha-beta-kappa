import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// Types
// ============================================

export type TileType =
  | "TRADE"        // Trading hub: buy/sell, options, orders, history
  | "PORTFOLIO"    // Portfolio: positions + performance
  | "MARKETPULSE"  // Market data: treemap + feed view
  | "CHART"        // Ticker tile with chart, stats grid, order book (formerly ChartTile)
  | "TICKER"       // Alias for CHART - Perplexity Finance style ticker display
  | "LEADERBOARD"  // Source leaderboard
  | "ALERTS"       // Price alerts
  | "NOTES";       // Trading notes

export type LinkGroup = "red" | "green" | "blue" | "yellow" | "none";

// Grid-based tile with position and size
export interface Tile {
  id: string;
  type: TileType;
  title: string;
  // Grid position (in pixels, will snap to grid)
  x: number;
  y: number;
  width: number;
  height: number;
  // Z-index for stacking
  zIndex: number;
  // Optional properties
  props?: Record<string, unknown>;
  linkGroup?: LinkGroup;
}

// Workspace with grid-based tiles
export interface Workspace {
  id: string;
  name: string;
  tiles: Tile[];
}

// Alias for backwards compatibility with tile components
export type TileData = Tile;

// ============================================
// Constants
// ============================================

// Grid cell size in pixels
export const GRID_SIZE = 50;

// Default tile dimensions (in pixels)
const DEFAULT_TILE_WIDTH = 400;
const DEFAULT_TILE_HEIGHT = 300;

// Maximum z-index for tiles (modals should be 200+)
const MAX_TILE_Z_INDEX = 99;

// ============================================
// State Interface
// ============================================

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  focusedTileId: string | null;
  maximizedTileId: string | null;
  commandBarOpen: boolean;
  drawerOpen: boolean;
  drawerContent: { type: string; data?: unknown } | null;
  isLocked: boolean;
  linkedSymbol: string | null;

  // Workspace actions
  setActiveWorkspace: (id: string) => void;
  addWorkspace: (workspace: Omit<Workspace, "tiles">) => void;
  removeWorkspace: (id: string) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;

  // Tile actions
  addTile: (workspaceId: string, tile: Omit<Tile, "x" | "y" | "width" | "height" | "zIndex">) => void;
  removeTile: (workspaceId: string, tileId: string) => void;
  updateTile: (workspaceId: string, tileId: string, updates: Partial<Tile>) => void;
  updateTilePosition: (workspaceId: string, tileId: string, x: number, y: number) => void;
  updateTileSize: (workspaceId: string, tileId: string, width: number, height: number) => void;
  bringToFront: (workspaceId: string, tileId: string) => void;

  // UI state actions
  setFocusedTile: (id: string | null) => void;
  setMaximizedTile: (id: string | null) => void;
  setCommandBarOpen: (open: boolean) => void;
  setDrawer: (open: boolean, content?: { type: string; data?: unknown }) => void;
  setLocked: (locked: boolean) => void;
  setLinkedSymbol: (symbol: string | null) => void;
  cycleTileLinkGroup: (workspaceId: string, tileId: string) => void;
  resetWorkspace: (workspaceId: string) => void;
}

// ============================================
// Defaults
// ============================================

const defaultWorkspace: Workspace = {
  id: "main",
  name: "Main",
  tiles: [
    {
      id: "marketpulse-1",
      type: "MARKETPULSE",
      title: "Market Pulse",
      x: 50,
      y: 50,
      width: 500,
      height: 450,
      zIndex: 1,
      linkGroup: "none",
    },
  ],
};

const defaultWorkspaces: Workspace[] = [defaultWorkspace];

const linkGroupOrder: LinkGroup[] = ["none", "red", "green", "blue", "yellow"];

// ============================================
// Helper Functions
// ============================================

// Snap value to grid with minimum position enforcement
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  const snapped = Math.round(value / gridSize) * gridSize;
  // Ensure minimum position of one grid unit to prevent tiles at 0
  return Math.max(gridSize, snapped);
}

// Get next z-index for a workspace (capped at MAX_TILE_Z_INDEX)
function getNextZIndex(tiles: Tile[]): number {
  if (tiles.length === 0) return 1;
  const currentMax = Math.max(...tiles.map((t) => t.zIndex));
  // If we're at or above max, normalize all z-indexes
  if (currentMax >= MAX_TILE_Z_INDEX) {
    return MAX_TILE_Z_INDEX;
  }
  return Math.min(currentMax + 1, MAX_TILE_Z_INDEX);
}

// Normalize z-indexes when they get too high (to prevent exceeding modal z-index)
function normalizeZIndexes(tiles: Tile[]): Tile[] {
  const sortedTiles = [...tiles].sort((a, b) => a.zIndex - b.zIndex);
  return sortedTiles.map((tile, index) => ({
    ...tile,
    zIndex: index + 1,
  }));
}

// Find a good position for a new tile (cascade from top-left)
function findNewTilePosition(tiles: Tile[]): { x: number; y: number } {
  const offset = tiles.length * 30;
  return {
    x: snapToGrid(50 + offset),
    y: snapToGrid(50 + offset),
  };
}

// ============================================
// Store
// ============================================

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: defaultWorkspaces,
      activeWorkspaceId: "main",
      focusedTileId: null,
      maximizedTileId: null,
      commandBarOpen: false,
      drawerOpen: false,
      drawerContent: null,
      isLocked: false,
      linkedSymbol: null,

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [
            ...state.workspaces,
            {
              ...workspace,
              tiles: [],
            },
          ],
        })),

      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          activeWorkspaceId:
            state.activeWorkspaceId === id
              ? state.workspaces[0]?.id ?? null
              : state.activeWorkspaceId,
        })),

      updateWorkspace: (id, updates) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      addTile: (workspaceId, tileData) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (!workspace) return state;

          const position = findNewTilePosition(workspace.tiles);
          const newTile: Tile = {
            ...tileData,
            x: position.x,
            y: position.y,
            width: DEFAULT_TILE_WIDTH,
            height: DEFAULT_TILE_HEIGHT,
            zIndex: getNextZIndex(workspace.tiles),
          };

          return {
            workspaces: state.workspaces.map((w) =>
              w.id === workspaceId
                ? { ...w, tiles: [...w.tiles, newTile] }
                : w
            ),
            focusedTileId: newTile.id,
          };
        }),

      removeTile: (workspaceId, tileId) => {
        const state = get();
        if (state.isLocked) return;

        set({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? { ...w, tiles: w.tiles.filter((t) => t.id !== tileId) }
              : w
          ),
          maximizedTileId: state.maximizedTileId === tileId ? null : state.maximizedTileId,
          focusedTileId: state.focusedTileId === tileId ? null : state.focusedTileId,
        });
      },

      updateTile: (workspaceId, tileId, updates) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tiles: w.tiles.map((t) =>
                    t.id === tileId ? { ...t, ...updates } : t
                  ),
                }
              : w
          ),
        })),

      updateTilePosition: (workspaceId, tileId, x, y) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tiles: w.tiles.map((t) =>
                    t.id === tileId
                      ? {
                          ...t,
                          x: Math.max(GRID_SIZE, snapToGrid(x)),
                          y: Math.max(GRID_SIZE, snapToGrid(y))
                        }
                      : t
                  ),
                }
              : w
          ),
        })),

      updateTileSize: (workspaceId, tileId, width, height) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tiles: w.tiles.map((t) =>
                    t.id === tileId
                      ? { ...t, width: snapToGrid(width), height: snapToGrid(height) }
                      : t
                  ),
                }
              : w
          ),
        })),

      bringToFront: (workspaceId, tileId) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (!workspace) return state;

          const currentMaxZ = Math.max(...workspace.tiles.map((t) => t.zIndex));

          // If z-indexes are getting too high, normalize all of them
          let updatedTiles = workspace.tiles;
          if (currentMaxZ >= MAX_TILE_Z_INDEX - 1) {
            updatedTiles = normalizeZIndexes(workspace.tiles);
          }

          const maxZ = getNextZIndex(updatedTiles);

          return {
            workspaces: state.workspaces.map((w) =>
              w.id === workspaceId
                ? {
                    ...w,
                    tiles: updatedTiles.map((t) =>
                      t.id === tileId ? { ...t, zIndex: maxZ } : t
                    ),
                  }
                : w
            ),
            focusedTileId: tileId,
          };
        }),

      setFocusedTile: (id) => set({ focusedTileId: id }),

      setMaximizedTile: (id) => set({ maximizedTileId: id }),

      setCommandBarOpen: (open) => set({ commandBarOpen: open }),

      setDrawer: (open, content) =>
        set({
          drawerOpen: open,
          drawerContent: content ?? null,
        }),

      setLocked: (locked) => set({ isLocked: locked }),

      setLinkedSymbol: (symbol) => set({ linkedSymbol: symbol }),

      cycleTileLinkGroup: (workspaceId, tileId) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (!workspace) return state;

          const tile = workspace.tiles.find((t) => t.id === tileId);
          if (!tile) return state;

          const currentIndex = linkGroupOrder.indexOf(tile.linkGroup || "none");
          const nextIndex = (currentIndex + 1) % linkGroupOrder.length;

          return {
            workspaces: state.workspaces.map((w) =>
              w.id === workspaceId
                ? {
                    ...w,
                    tiles: w.tiles.map((t) =>
                      t.id === tileId
                        ? { ...t, linkGroup: linkGroupOrder[nextIndex] }
                        : t
                    ),
                  }
                : w
            ),
          };
        }),

      resetWorkspace: (workspaceId) => {
        const defaultWs = defaultWorkspaces.find((w) => w.id === workspaceId);
        if (!defaultWs) return;
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...defaultWs } : w
          ),
          maximizedTileId: null,
          focusedTileId: null,
        }));
      },
    }),
    {
      name: "narrative-terminal-workspace-v4", // New version for grid-based layout
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        isLocked: state.isLocked,
      }),
      // Validate and fix corrupted positions on hydration
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Fix any tiles with corrupted positions (x or y less than GRID_SIZE)
        state.workspaces = state.workspaces.map((workspace) => ({
          ...workspace,
          tiles: workspace.tiles.map((tile, index) => ({
            ...tile,
            // Ensure minimum position, cascade if at origin
            x: tile.x < GRID_SIZE ? GRID_SIZE + (index * 30) : tile.x,
            y: tile.y < GRID_SIZE ? GRID_SIZE + (index * 30) : tile.y,
          })),
        }));
      },
    }
  )
);

// ============================================
// Selectors
// ============================================

export const useActiveWorkspace = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return workspaces.find((w) => w.id === activeId) ?? null;
};

// Get tiles in a specific link group
export const useLinkedTiles = (linkGroup: LinkGroup) => {
  const workspace = useActiveWorkspace();
  if (!workspace || linkGroup === "none") return [];
  return workspace.tiles.filter((t) => t.linkGroup === linkGroup);
};

// ============================================
// Color Maps
// ============================================

export const tileColors: Record<TileType, string> = {
  TRADE: "var(--tile-flow)",
  PORTFOLIO: "var(--tile-heat)",
  MARKETPULSE: "var(--tile-theme)",
  CHART: "var(--tile-ticker)",
  TICKER: "var(--tile-ticker)",  // Alias for CHART
  LEADERBOARD: "var(--tile-alerts)",
  ALERTS: "var(--tile-alerts)",
  NOTES: "var(--tile-notes)",
};

export const linkGroupColors: Record<LinkGroup, string> = {
  red: "var(--link-red)",
  green: "var(--link-green)",
  blue: "var(--link-blue)",
  yellow: "var(--link-yellow)",
  none: "var(--link-none)",
};
