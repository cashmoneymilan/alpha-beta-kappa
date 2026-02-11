"use client";

import * as React from "react";
import { CommandBar, TileGrid, TopBar } from "@/components/shell";
import { useWorkspaceStore } from "@/stores/workspace";
import { useSettingsStore } from "@/stores/settings";
import { InterestWizard } from "@/components/onboarding/InterestWizard";

export default function TerminalPage() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const theme = useSettingsStore((s) => s.theme);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const hasHydrated = useSettingsStore((s) => s._hasHydrated);

  const [isWizardOpen, setIsWizardOpen] = React.useState(false);

  // Apply theme on mount
  React.useEffect(() => {
    if (theme === "modern") {
      document.documentElement.setAttribute("data-theme", "modern");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  // Show onboarding wizard on first visit (only after hydration)
  React.useEffect(() => {
    if (hasHydrated && !hasCompletedOnboarding) {
      setIsWizardOpen(true);
    }
  }, [hasHydrated, hasCompletedOnboarding]);

  // Keyboard shortcuts for workspace switching
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (workspaces[index]) {
          setActiveWorkspace(workspaces[index]!.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [workspaces, setActiveWorkspace]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <TopBar onOpenWizard={() => setIsWizardOpen(true)} />

      {/* Main content - Tile grid */}
      <main className="flex-1 overflow-hidden">
        <TileGrid />
      </main>

      {/* Command bar (modal) */}
      <CommandBar />

      {/* Interest Wizard */}
      <InterestWizard open={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
