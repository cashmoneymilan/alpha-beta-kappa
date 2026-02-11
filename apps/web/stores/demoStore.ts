import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = '2x2' | '1x4' | 'full';

export type ShowcaseCategory =
  | 'buttons'
  | 'forms'
  | 'tables'
  | 'cards'
  | 'badges'
  | 'alerts'
  | 'navigation'
  | 'modals'
  | 'dropdowns'
  | 'command'
  | 'dataviz'
  | 'loading'
  | 'empty'
  | 'tooltips'
  | 'headers'
  | 'sliders'
  | 'checkboxes'
  | 'toasts'
  | 'filters'
  | 'status'
  | 'avatars'
  | 'shortcuts'
  | 'search'
  | 'feedcards'
  | 'feedcardvariants'
  | 'expandedviews'
  | 'charts';

interface DemoState {
  // Selected themes (up to 4 for comparison)
  selectedThemes: string[];

  // Current showcase category
  activeCategory: ShowcaseCategory;

  // View mode for theme panels
  viewMode: ViewMode;

  // Actions
  toggleTheme: (themeName: string) => void;
  setActiveCategory: (category: ShowcaseCategory) => void;
  setViewMode: (mode: ViewMode) => void;
  selectAllThemes: (themeNames: string[]) => void;
  clearThemes: () => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      selectedThemes: ['bloomberg', 'glassmorphism', 'cyberpunk', 'midnight'],
      activeCategory: 'buttons',
      viewMode: '2x2',

      toggleTheme: (themeName) => {
        const { selectedThemes } = get();
        if (selectedThemes.includes(themeName)) {
          // Remove theme (but keep at least one)
          if (selectedThemes.length > 1) {
            set({ selectedThemes: selectedThemes.filter((t) => t !== themeName) });
          }
        } else {
          // Add theme (max 4 for comparison)
          if (selectedThemes.length < 4) {
            set({ selectedThemes: [...selectedThemes, themeName] });
          } else {
            // Replace the oldest selection
            set({ selectedThemes: [...selectedThemes.slice(1), themeName] });
          }
        }
      },

      setActiveCategory: (category) => set({ activeCategory: category }),

      setViewMode: (mode) => set({ viewMode: mode }),

      selectAllThemes: (themeNames) => {
        // Select first 4 themes
        set({ selectedThemes: themeNames.slice(0, 4) });
      },

      clearThemes: () => set({ selectedThemes: [] }),
    }),
    {
      name: 'demo-store',
      partialize: (state) => ({
        selectedThemes: state.selectedThemes,
        activeCategory: state.activeCategory,
        viewMode: state.viewMode,
      }),
    }
  )
);

// Selectors
export const selectSelectedThemes = (state: DemoState) => state.selectedThemes;
export const selectActiveCategory = (state: DemoState) => state.activeCategory;
export const selectViewMode = (state: DemoState) => state.viewMode;
