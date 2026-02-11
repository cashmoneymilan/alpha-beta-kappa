"use client";

import * as React from "react";
import { Rnd } from "react-rnd";
import { X, Maximize2, Minimize2 } from "lucide-react";
import {
  useWorkspaceStore,
  useActiveWorkspace,
  linkGroupColors,
  GRID_SIZE,
} from "@/stores/workspace";
import type { Tile } from "@/stores/workspace";
import { cn } from "@/lib/utils";

// Tile components
import { TradeTile } from "@/components/tiles/TradeTile";
import { PortfolioTile } from "@/components/tiles/PortfolioTile";
import { MarketPulse } from "@/components/tiles/MarketPulse";
import { TickerTile } from "@/components/tiles/TickerTile";
import { AlertsTile } from "@/components/tiles/AlertsTile";
import { NotesTile } from "@/components/tiles/NotesTile";
import { LeaderboardTile } from "@/components/tiles/LeaderboardTile";
import { MoltbotTile } from "@/components/tiles/MoltbotTile";

// Map tile types to components
const tileComponents: Record<string, React.ComponentType<{ tile: Tile }>> = {
  TRADE: TradeTile,
  PORTFOLIO: PortfolioTile,
  MARKETPULSE: MarketPulse,
  CHART: TickerTile,   // Renamed from ChartTile to TickerTile
  TICKER: TickerTile,  // Alias for CHART
  LEADERBOARD: LeaderboardTile,
  ALERTS: AlertsTile,
  NOTES: NotesTile,
  MOLTBOT: MoltbotTile,
};

// ============================================
// Grid Background Component
// ============================================

function GridBackground({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--foreground) / 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--foreground) / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    />
  );
}

// ============================================
// Tile Panel Component
// ============================================

interface TilePanelProps {
  tile: Tile;
  isFocused: boolean;
  isLocked: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMaximize: () => void;
  onCycleLinkGroup: () => void;
}

function TilePanel({
  tile,
  isFocused,
  isLocked,
  onFocus,
  onClose,
  onMaximize,
  onCycleLinkGroup,
}: TilePanelProps) {
  const TileComponent = tileComponents[tile.type];
  const linkColor = linkGroupColors[tile.linkGroup || "none"];

  if (!TileComponent) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-card rounded">
        Unknown tile type: {tile.type}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col rounded border-2",
        // TWS-style: GREEN border = unlocked (editing mode), subtle = locked
        // Using consistent border-2 to prevent layout shift on lock/unlock
        isLocked
          ? "border-border/50"
          : "border-green-500/70",
        isFocused && "ring-2 ring-primary/50"
      )}
      style={{
        // Solid opaque background - grid won't show through
        backgroundColor: "hsl(var(--card))",
      }}
      onClick={onFocus}
    >
      {/* Draggable Header - solid background */}
      <div className="tile-header flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted cursor-move select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium text-foreground">
            {tile.type}
          </span>
          {tile.props?.ticker ? (
            <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
              {String(tile.props.ticker)}
            </span>
          ) : null}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-0.5">
          {/* Link group - cycles through link colors to sync tiles */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCycleLinkGroup();
            }}
            className="p-1 rounded hover:bg-muted transition-colors"
            title={`Sync group: ${tile.linkGroup || "none"} - Click to cycle colors and link tiles together`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full border-2"
              style={{
                borderColor: `hsl(${linkColor})`,
                backgroundColor:
                  tile.linkGroup && tile.linkGroup !== "none"
                    ? `hsl(${linkColor})`
                    : "transparent",
              }}
            />
          </button>

          {/* Maximize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Maximize"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* Close */}
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tile content - solid background */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: "hsl(var(--card))" }}>
        <TileComponent tile={tile} />
      </div>
    </div>
  );
}

// ============================================
// Maximized Tile View
// ============================================

function MaximizedTileView({ tile }: { tile: Tile }) {
  const isLocked = useWorkspaceStore((s) => s.isLocked);
  const setFocusedTile = useWorkspaceStore((s) => s.setFocusedTile);
  const setMaximizedTile = useWorkspaceStore((s) => s.setMaximizedTile);
  const removeTile = useWorkspaceStore((s) => s.removeTile);
  const cycleTileLinkGroup = useWorkspaceStore((s) => s.cycleTileLinkGroup);
  const workspace = useActiveWorkspace();

  const TileComponent = tileComponents[tile.type];
  const linkColor = linkGroupColors[tile.linkGroup || "none"];

  if (!TileComponent || !workspace) return null;

  return (
    <div className="h-full p-2">
      <div
        className={cn(
          "h-full flex flex-col rounded overflow-hidden",
          "bg-card border border-border"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {tile.type}
            </span>
            {tile.props?.ticker ? (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {String(tile.props.ticker)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            {/* Link group - cycles through link colors to sync tiles */}
            <button
              onClick={() => cycleTileLinkGroup(workspace.id, tile.id)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={`Sync group: ${tile.linkGroup || "none"} - Click to cycle colors and link tiles together`}
            >
              <div
                className="w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: `hsl(${linkColor})`,
                  backgroundColor:
                    tile.linkGroup && tile.linkGroup !== "none"
                      ? `hsl(${linkColor})`
                      : "transparent",
                }}
              />
            </button>

            {/* Restore */}
            <button
              onClick={() => setMaximizedTile(null)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Restore"
            >
              <Minimize2 className="h-4 w-4" />
            </button>

            {/* Close */}
            {!isLocked && (
              <button
                onClick={() => {
                  removeTile(workspace.id, tile.id);
                  setMaximizedTile(null);
                }}
                className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <TileComponent tile={tile} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main TileGrid Component
// ============================================

export function TileGrid() {
  const workspace = useActiveWorkspace();
  const focusedTileId = useWorkspaceStore((s) => s.focusedTileId);
  const maximizedTileId = useWorkspaceStore((s) => s.maximizedTileId);
  const isLocked = useWorkspaceStore((s) => s.isLocked);
  const setFocusedTile = useWorkspaceStore((s) => s.setFocusedTile);
  const setMaximizedTile = useWorkspaceStore((s) => s.setMaximizedTile);
  const removeTile = useWorkspaceStore((s) => s.removeTile);
  const cycleTileLinkGroup = useWorkspaceStore((s) => s.cycleTileLinkGroup);
  const updateTilePosition = useWorkspaceStore((s) => s.updateTilePosition);
  const updateTileSize = useWorkspaceStore((s) => s.updateTileSize);
  const bringToFront = useWorkspaceStore((s) => s.bringToFront);

  // Ref and state for dynamic bounds calculation
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerBounds, setContainerBounds] = React.useState({ width: 0, height: 0 });

  // Only enable Rnd constraints when we have valid bounds
  const hasBounds = containerBounds.width > 0 && containerBounds.height > 0;

  // Delay bounds enablement to let react-rnd initialize properly
  const [boundsEnabled, setBoundsEnabled] = React.useState(false);

  React.useEffect(() => {
    if (!hasBounds) {
      setBoundsEnabled(false);
      return;
    }
    // Delay bounds enablement to prevent position resets during initialization
    const timer = setTimeout(() => {
      setBoundsEnabled(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [hasBounds]);

  // Calculate bounds using ResizeObserver for accurate, responsive sizing
  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerBounds({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // No workspace
  if (!workspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="text-center p-6 rounded-lg"
          style={{ backgroundColor: "hsl(var(--card) / 0.9)" }}
        >
          <p className="text-lg mb-2 text-foreground font-medium">No workspace selected</p>
          <p className="text-sm text-muted-foreground">Press ⌘K to open command bar</p>
        </div>
      </div>
    );
  }

  // Empty workspace
  if (workspace.tiles.length === 0) {
    return (
      <div className="h-full relative">
        <GridBackground visible={true} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-center p-6 rounded-lg"
            style={{ backgroundColor: "hsl(var(--card) / 0.9)" }}
          >
            <p className="text-lg mb-2 text-foreground font-medium">Empty workspace</p>
            <p className="text-sm text-muted-foreground">Click + to add a tile, or press ⌘K</p>
          </div>
        </div>
      </div>
    );
  }

  // If a tile is maximized, only show that tile
  if (maximizedTileId) {
    const tile = workspace.tiles.find((t) => t.id === maximizedTileId);
    if (tile) {
      return <MaximizedTileView tile={tile} />;
    }
  }

  return (
    <div ref={containerRef} className="h-full relative overflow-hidden">
      {/* Dotted grid background - only visible when editing (unlocked) */}
      <GridBackground visible={true} />

      {/* Tiles */}
      {workspace.tiles.map((tile) => (
        <Rnd
          key={tile.id}
          // Use default for uncontrolled mode - react-rnd manages its own state
          // This prevents position jumps on re-render
          default={{
            x: Math.max(50, tile.x),
            y: Math.max(50, tile.y),
            width: tile.width,
            height: tile.height,
          }}
          style={{ zIndex: tile.zIndex }}
          // Live grid snapping during drag/resize
          dragGrid={[GRID_SIZE, GRID_SIZE]}
          resizeGrid={[GRID_SIZE, GRID_SIZE]}
          // Constraints - keep tiles within parent container
          minWidth={150}
          minHeight={100}
          bounds="parent"
          // Drag by header only
          dragHandleClassName="tile-header"
          // Disable when locked
          disableDragging={isLocked}
          enableResizing={!isLocked}
          // Events - only bringToFront on drag start, not on every click
          onDragStart={() => bringToFront(workspace.id, tile.id)}
          onDragStop={(e, d) => {
            // Clamp position to ensure tile stays visible (at least 50px from each edge)
            const clampedX = Math.max(0, Math.min(d.x, containerBounds.width - 100));
            const clampedY = Math.max(0, Math.min(d.y, containerBounds.height - 50));
            updateTilePosition(workspace.id, tile.id, clampedX, clampedY);
          }}
          onResizeStart={() => bringToFront(workspace.id, tile.id)}
          onResizeStop={(e, direction, ref, delta, position) => {
            // Snap to grid on release
            updateTileSize(
              workspace.id,
              tile.id,
              parseInt(ref.style.width),
              parseInt(ref.style.height)
            );
            updateTilePosition(workspace.id, tile.id, position.x, position.y);
          }}
          // Resize handle styles - need explicit size to be grabbable
          resizeHandleStyles={{
            top: { cursor: "ns-resize", height: "8px", top: "-4px", left: "0", right: "0" },
            bottom: { cursor: "ns-resize", height: "8px", bottom: "-4px", left: "0", right: "0" },
            left: { cursor: "ew-resize", width: "8px", left: "-4px", top: "0", bottom: "0" },
            right: { cursor: "ew-resize", width: "8px", right: "-4px", top: "0", bottom: "0" },
            topLeft: { cursor: "nwse-resize", width: "12px", height: "12px", top: "-6px", left: "-6px" },
            topRight: { cursor: "nesw-resize", width: "12px", height: "12px", top: "-6px", right: "-6px" },
            bottomLeft: { cursor: "nesw-resize", width: "12px", height: "12px", bottom: "-6px", left: "-6px" },
            bottomRight: { cursor: "nwse-resize", width: "12px", height: "12px", bottom: "-6px", right: "-6px" },
          }}
        >
          <TilePanel
            tile={tile}
            isFocused={focusedTileId === tile.id}
            isLocked={isLocked}
            onFocus={() => setFocusedTile(tile.id)}
            onClose={() => removeTile(workspace.id, tile.id)}
            onMaximize={() => setMaximizedTile(tile.id)}
            onCycleLinkGroup={() => cycleTileLinkGroup(workspace.id, tile.id)}
          />
        </Rnd>
      ))}
    </div>
  );
}
