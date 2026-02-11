'use client';

import { Palette, Grid2X2, LayoutGrid, Maximize2 } from 'lucide-react';
import { useDemoStore, type ShowcaseCategory, type ViewMode } from '@/stores/demoStore';
import { ThemePanel } from './ThemePanel';
import { ThemeSelector } from './ThemeSelector';
import {
  ButtonsShowcase,
  FormsShowcase,
  TablesShowcase,
  CardsShowcase,
  BadgesShowcase,
  AlertsShowcase,
  NavigationShowcase,
  ModalsShowcase,
  DropdownsShowcase,
  CommandPaletteShowcase,
  DataVizShowcase,
  LoadingShowcase,
  EmptyStatesShowcase,
  TooltipsShowcase,
  TileHeadersShowcase,
  SlidersShowcase,
  CheckboxesShowcase,
  ToastsShowcase,
  FilterChipsShowcase,
  StatusIndicatorsShowcase,
  AvatarsShowcase,
  KeyboardShortcutsShowcase,
  SearchShowcase,
  FeedCardsShowcase,
  FeedCardVariantsShowcase,
  ExpandedViewsShowcase,
  ChartsShowcase,
} from './showcase';

const categories: { id: ShowcaseCategory; label: string; group?: string }[] = [
  // Phase 1 - Core (Decisions Made)
  { id: 'buttons', label: 'Buttons', group: 'Core' },
  { id: 'forms', label: 'Forms', group: 'Core' },
  { id: 'tables', label: 'Tables', group: 'Core' },
  { id: 'cards', label: 'Cards', group: 'Core' },
  { id: 'badges', label: 'Badges', group: 'Core' },
  { id: 'alerts', label: 'Alerts', group: 'Core' },
  { id: 'navigation', label: 'Navigation', group: 'Core' },
  // Phase 2 - Additional
  { id: 'modals', label: 'Modals', group: 'Additional' },
  { id: 'dropdowns', label: 'Dropdowns', group: 'Additional' },
  { id: 'command', label: 'Command Palette', group: 'Additional' },
  { id: 'dataviz', label: 'Data Viz', group: 'Additional' },
  { id: 'loading', label: 'Loading', group: 'Additional' },
  { id: 'empty', label: 'Empty States', group: 'Additional' },
  { id: 'tooltips', label: 'Tooltips', group: 'Additional' },
  { id: 'headers', label: 'Tile Headers', group: 'Additional' },
  // Phase 3 - Extended
  { id: 'sliders', label: 'Sliders', group: 'Extended' },
  { id: 'checkboxes', label: 'Checkboxes', group: 'Extended' },
  { id: 'toasts', label: 'Toasts', group: 'Extended' },
  { id: 'filters', label: 'Filter Chips', group: 'Extended' },
  { id: 'status', label: 'Status', group: 'Extended' },
  { id: 'avatars', label: 'Avatars', group: 'Extended' },
  { id: 'shortcuts', label: 'Shortcuts', group: 'Extended' },
  // Phase 4 - Domain-Specific
  { id: 'search', label: 'Search', group: 'Domain' },
  { id: 'feedcards', label: 'Feed Cards', group: 'Domain' },
  { id: 'feedcardvariants', label: 'Feed Card Variants', group: 'Domain' },
  { id: 'expandedviews', label: 'Expanded Views', group: 'Domain' },
  { id: 'charts', label: 'Charts', group: 'Domain' },
];

const viewModes: { id: ViewMode; icon: typeof Grid2X2; label: string }[] = [
  { id: '2x2', icon: Grid2X2, label: '2x2 Grid' },
  { id: '1x4', icon: LayoutGrid, label: '1x4 Stack' },
  { id: 'full', icon: Maximize2, label: 'Full Width' },
];

function getShowcaseComponent(category: ShowcaseCategory, themeName: string) {
  switch (category) {
    case 'buttons':
      return <ButtonsShowcase themeName={themeName} />;
    case 'forms':
      return <FormsShowcase themeName={themeName} />;
    case 'tables':
      return <TablesShowcase themeName={themeName} />;
    case 'cards':
      return <CardsShowcase themeName={themeName} />;
    case 'badges':
      return <BadgesShowcase themeName={themeName} />;
    case 'alerts':
      return <AlertsShowcase themeName={themeName} />;
    case 'navigation':
      return <NavigationShowcase themeName={themeName} />;
    case 'modals':
      return <ModalsShowcase themeName={themeName} />;
    case 'dropdowns':
      return <DropdownsShowcase themeName={themeName} />;
    case 'command':
      return <CommandPaletteShowcase themeName={themeName} />;
    case 'dataviz':
      return <DataVizShowcase themeName={themeName} />;
    case 'loading':
      return <LoadingShowcase themeName={themeName} />;
    case 'empty':
      return <EmptyStatesShowcase themeName={themeName} />;
    case 'tooltips':
      return <TooltipsShowcase themeName={themeName} />;
    case 'headers':
      return <TileHeadersShowcase themeName={themeName} />;
    case 'sliders':
      return <SlidersShowcase themeName={themeName} />;
    case 'checkboxes':
      return <CheckboxesShowcase themeName={themeName} />;
    case 'toasts':
      return <ToastsShowcase themeName={themeName} />;
    case 'filters':
      return <FilterChipsShowcase themeName={themeName} />;
    case 'status':
      return <StatusIndicatorsShowcase themeName={themeName} />;
    case 'avatars':
      return <AvatarsShowcase themeName={themeName} />;
    case 'shortcuts':
      return <KeyboardShortcutsShowcase themeName={themeName} />;
    case 'search':
      return <SearchShowcase themeName={themeName} />;
    case 'feedcards':
      return <FeedCardsShowcase themeName={themeName} />;
    case 'feedcardvariants':
      return <FeedCardVariantsShowcase themeName={themeName} />;
    case 'expandedviews':
      return <ExpandedViewsShowcase themeName={themeName} />;
    case 'charts':
      return <ChartsShowcase themeName={themeName} />;
    default:
      return <ButtonsShowcase themeName={themeName} />;
  }
}

export function DemoPage() {
  const selectedThemes = useDemoStore((s) => s.selectedThemes);
  const activeCategory = useDemoStore((s) => s.activeCategory);
  const viewMode = useDemoStore((s) => s.viewMode);
  const setActiveCategory = useDemoStore((s) => s.setActiveCategory);
  const setViewMode = useDemoStore((s) => s.setViewMode);

  const getGridClass = () => {
    switch (viewMode) {
      case '2x2':
        return 'grid grid-cols-2 gap-4';
      case '1x4':
        return 'grid grid-cols-4 gap-4';
      case 'full':
        return 'flex flex-col gap-4';
      default:
        return 'grid grid-cols-2 gap-4';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Palette className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Design System Demo</h1>
                <p className="text-xs text-zinc-500">
                  Compare UI themes for the trading terminal
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-lg">
              {viewModes.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === id
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Theme Selector */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <ThemeSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <aside className="w-48 flex-shrink-0">
            <div className="sticky top-32">
              {/* Core Components - Decisions Made */}
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
                Core (Decided)
              </h3>
              <nav className="space-y-1 mb-6">
                {categories.filter(c => c.group === 'Core').map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        activeCategory === id
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {/* Additional Components - Need Review */}
              <h3 className="text-xs font-medium uppercase tracking-wider text-amber-500 mb-3">
                Additional (Review)
              </h3>
              <nav className="space-y-1 mb-6">
                {categories.filter(c => c.group === 'Additional').map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        activeCategory === id
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {/* Extended Components - New */}
              <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-500 mb-3">
                Extended (New)
              </h3>
              <nav className="space-y-1 mb-6">
                {categories.filter(c => c.group === 'Extended').map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        activeCategory === id
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {/* Domain-Specific Components */}
              <h3 className="text-xs font-medium uppercase tracking-wider text-purple-500 mb-3">
                Domain-Specific
              </h3>
              <nav className="space-y-1">
                {categories.filter(c => c.group === 'Domain').map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        activeCategory === id
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Theme Panels Grid */}
          <main className="flex-1 min-w-0">
            {selectedThemes.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-zinc-500">
                <div className="text-center">
                  <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No themes selected</p>
                  <p className="text-sm mt-1">
                    Click on themes above to start comparing
                  </p>
                </div>
              </div>
            ) : (
              <div className={getGridClass()}>
                {selectedThemes.map((themeName) => (
                  <ThemePanel
                    key={themeName}
                    themeName={themeName}
                    className="border border-zinc-800"
                  >
                    {getShowcaseComponent(activeCategory, themeName)}
                  </ThemePanel>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
