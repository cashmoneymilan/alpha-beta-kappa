/**
 * Alpha Hybrid Theme
 *
 * Combines structural styles from user preferences:
 *
 * Phase 1 (Core):
 * - Buttons: Retro Terminal (blocky, bold, hard edges)
 * - Forms: Bloomberg (dense, compact, monospace)
 * - Tables: Arctic Light (crisp, sharp, clean)
 * - Cards: Arctic Light (clinical, structured)
 * - Badges: Midnight Pro (subtle, refined)
 * - Alerts: Arctic Light (sharp, clear hierarchy)
 * - Navigation: Sunset Warm (rounded, soft, generous)
 *
 * Phase 2 (Additional):
 * - Modals: Arctic Light (clean, clinical dialogs)
 * - Dropdowns: Bloomberg (dense, compact menus)
 * - Command Palette: Bloomberg (dense, keyboard-friendly)
 * - Data Viz: Bloomberg (dense data presentation)
 * - Loading: Bloomberg (minimal, unobtrusive)
 * - Empty States: Bloomberg (compact, professional)
 * - Tooltips: Arctic Light (clean, readable)
 * - Tile Headers: Arctic Light (sharp, clear hierarchy)
 *
 * Phase 3 (Extended):
 * - Sliders: Bloomberg (dense, functional)
 * - Checkboxes: Midnight Pro (refined, premium feel)
 * - Toasts: Midnight Pro (subtle, refined notifications)
 * - Filter Chips: Arctic Light (clean, crisp selection)
 * - Status Indicators: Arctic Light (clean, readable)
 * - Avatars: Midnight Pro (refined, subtle)
 * - Keyboard Shortcuts: Bloomberg (dense, monospace)
 */

// Structural styles per component type
export const alphaStructure = {
  buttons: {
    source: 'retro',
    borderRadius: '0px',
    fontFamily: "'VT323', 'Courier New', monospace",
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: { sm: '0 16px', md: '0 20px', lg: '0 28px' },
    height: { sm: '32px', md: '40px', lg: '48px' },
    border: '2px solid',
    glow: true,
  },
  forms: {
    source: 'bloomberg',
    borderRadius: '0px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    fontSize: '12px',
    padding: '6px 10px',
    height: '32px',
    labelSize: '10px',
    labelWeight: '600',
    labelSpacing: '0.1em',
    dense: true,
  },
  tables: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    fontSize: '13px',
    headerSize: '11px',
    cellPadding: '10px 14px',
    headerWeight: '600',
    borderWidth: '1px',
    crisp: true,
  },
  cards: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    padding: '16px',
    borderWidth: '1px',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    clean: true,
  },
  badges: {
    source: 'midnight',
    borderRadius: '6px',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '11px',
    fontWeight: '500',
    padding: '3px 10px',
    refined: true,
  },
  alerts: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    padding: '14px 18px',
    borderWidth: '1px',
    iconSize: '18px',
    titleWeight: '600',
    crisp: true,
  },
  navigation: {
    source: 'sunset',
    borderRadius: '12px',
    fontFamily: "'Nunito', system-ui, sans-serif",
    fontWeight: '600',
    padding: '10px 18px',
    gap: '8px',
    soft: true,
  },

  // Phase 2 Components
  modals: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    padding: { header: '16px', body: '20px', footer: '16px' },
    headerBorder: '1px solid',
    shadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
    backdropOpacity: 0.6,
    crisp: true,
  },
  dropdowns: {
    source: 'bloomberg',
    borderRadius: '0px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    fontSize: '12px',
    itemPadding: '6px 12px',
    maxHeight: '200px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    dense: true,
  },
  commandPalette: {
    source: 'bloomberg',
    borderRadius: '0px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    inputHeight: '48px',
    inputFontSize: '14px',
    resultPadding: '8px 12px',
    resultFontSize: '12px',
    kbdBackground: 'muted',
    maxHeight: '400px',
    dense: true,
  },
  dataViz: {
    source: 'bloomberg',
    borderRadius: '0px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    sparklineStroke: '1.5px',
    barGap: '1px',
    progressHeight: '4px',
    labelSize: '10px',
    labelWeight: '600',
    dense: true,
  },
  loading: {
    source: 'bloomberg',
    spinnerSize: { sm: '16px', md: '24px', lg: '32px' },
    spinnerStroke: '2px',
    skeletonRadius: '2px',
    skeletonAnimation: 'pulse',
    dotsSize: '6px',
    minimal: true,
  },
  emptyStates: {
    source: 'bloomberg',
    borderRadius: '0px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    iconSize: '32px',
    padding: '24px',
    titleSize: '14px',
    descriptionSize: '12px',
    compact: true,
  },
  tooltips: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    padding: '8px 12px',
    fontSize: '12px',
    borderWidth: '1px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    maxWidth: '280px',
    crisp: true,
  },
  tileHeaders: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    height: '40px',
    padding: '0 12px',
    iconSize: '16px',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '1px solid',
    crisp: true,
  },

  // Phase 3 Extended Components
  sliders: {
    source: 'bloomberg',
    borderRadius: '0px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    trackHeight: '8px',
    thumbSize: '16px',
    thumbRadius: '2px',
    labelSize: '10px',
    valueSize: '14px',
    dense: true,
  },
  checkboxes: {
    source: 'midnight',
    borderRadius: '4px',
    fontFamily: "'Inter', system-ui, sans-serif",
    size: '18px',
    borderWidth: '1px',
    labelSize: '13px',
    descriptionSize: '12px',
    gap: '12px',
    refined: true,
  },
  toasts: {
    source: 'midnight',
    borderRadius: '6px',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '14px',
    iconSize: '20px',
    titleSize: '13px',
    descriptionSize: '12px',
    borderWidth: '1px',
    shadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    refined: true,
  },
  filterChips: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    fontSize: '11px',
    fontWeight: '500',
    padding: '4px 10px',
    gap: '8px',
    borderWidth: '1px',
    crisp: true,
  },
  statusIndicators: {
    source: 'arctic',
    borderRadius: '4px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    dotSize: '8px',
    labelSize: '12px',
    descriptionSize: '11px',
    padding: '12px',
    borderWidth: '1px',
    crisp: true,
  },
  avatars: {
    source: 'midnight',
    borderRadius: '50%',
    fontFamily: "'Inter', system-ui, sans-serif",
    sizes: { xs: '24px', sm: '32px', md: '40px', lg: '48px', xl: '64px' },
    fontSize: '12px',
    fontWeight: '600',
    borderWidth: '2px',
    refined: true,
  },
  keyboardShortcuts: {
    source: 'bloomberg',
    borderRadius: '4px',
    fontFamily: "'Consolas', 'Monaco', monospace",
    kbdPadding: '2px 6px',
    kbdFontSize: '11px',
    labelSize: '12px',
    descriptionSize: '11px',
    gap: '8px',
    dense: true,
  },
};

// Color palette - uses existing dark terminal colors
export const alphaColors = {
  '--demo-background': '240 15% 8%',
  '--demo-foreground': '0 0% 95%',
  '--demo-card': '240 15% 11%',
  '--demo-card-foreground': '0 0% 95%',
  '--demo-primary': '239 84% 67%',
  '--demo-primary-foreground': '0 0% 100%',
  '--demo-secondary': '240 15% 18%',
  '--demo-secondary-foreground': '0 0% 95%',
  '--demo-accent': '38 92% 50%',
  '--demo-accent-foreground': '0 0% 0%',
  '--demo-muted': '240 15% 14%',
  '--demo-muted-foreground': '240 5% 60%',
  '--demo-border': '240 10% 25%',
  '--demo-input': '240 15% 14%',
  '--demo-ring': '239 84% 67%',
  '--demo-bullish': '142 71% 45%',
  '--demo-bearish': '0 84% 60%',
  '--demo-destructive': '0 84% 60%',
  '--demo-destructive-foreground': '0 0% 100%',
};

export const alphaHybrid = {
  name: 'alpha-hybrid',
  label: 'Alpha (Hybrid)',
  description: 'Full design system combining best styles from all themes',
  colors: alphaColors,
  structure: alphaStructure,
  effects: {
    glow: false,
    blur: false,
    scanlines: false,
    borderRadius: '4px', // Default fallback
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};
