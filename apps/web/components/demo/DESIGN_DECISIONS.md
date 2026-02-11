# Design System Decisions

This document tracks the design decisions made for the Alpha Trading Terminal UI.

---

## Phase 1: Core Components (Completed)

### Reviewed Themes
| Theme | Aesthetic | Key Characteristics |
|-------|-----------|---------------------|
| Cyberpunk/Neon | Blade Runner | Pure black, cyan/magenta, glowing edges, scanlines |
| Minimal/Clean | Apple | Off-white, single blue accent, no shadows, whitespace |
| Bloomberg Terminal | Professional | Navy, gold/amber, dense monospace, grids |
| Glass Morphism | Modern | Dark purple, soft pastels, frosted blur, transparency |
| Midnight Pro | Dark luxury | Charcoal, emerald green, subtle gradients, premium |
| Sunset Warm | Friendly | Cream, orange/coral, rounded corners, soft |
| Arctic Light | Clinical | Pure white, ice blue, sharp edges, high contrast |
| Retro Terminal | 80s computer | Black, green monochrome, CRT glow, pixelated |

### Decisions Made

| Component | Chosen Style | Rationale |
|-----------|--------------|-----------|
| **Buttons** | Retro Terminal | Blocky, bold presence, hard edges (0px radius), monospace font, glow effect gives clear call-to-action |
| **Forms** | Bloomberg Terminal | Dense, compact layout maximizes screen real estate, monospace for data entry, professional feel |
| **Tables** | Arctic Light | Crisp, clean lines aid readability, sharp edges (4px radius), high contrast for scanning data |
| **Cards** | Arctic Light | Clean, clinical structure, consistent with tables, clear content hierarchy |
| **Badges** | Midnight Pro | Subtle, refined appearance (6px radius), doesn't compete with primary content, premium feel |
| **Alerts** | Arctic Light | Sharp, clear hierarchy, high contrast ensures visibility without being jarring |
| **Navigation** | Sunset Warm | Rounded corners (12px), soft feel provides friendly contrast to dense trading data |

### Structural Specifications

#### Buttons (Retro Terminal)
```
borderRadius: 0px
fontFamily: 'VT323', 'Courier New', monospace
fontWeight: 700
textTransform: uppercase
letterSpacing: 0.05em
heights: sm=32px, md=40px, lg=48px
border: 2px solid
glow: true (box-shadow on primary actions)
```

#### Forms (Bloomberg Terminal)
```
borderRadius: 0px
fontFamily: 'Consolas', 'Monaco', monospace
fontSize: 12px
inputHeight: 32px
padding: 6px 10px
labelSize: 10px
labelWeight: 600
labelSpacing: 0.1em
dense: true
```

#### Tables (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
fontSize: 13px
headerSize: 11px
cellPadding: 10px 14px
headerWeight: 600
borderWidth: 1px
crisp: true
```

#### Cards (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
padding: 16px
borderWidth: 1px
shadow: 0 1px 2px rgba(0, 0, 0, 0.05)
clean: true
```

#### Badges (Midnight Pro)
```
borderRadius: 6px
fontFamily: 'Inter', system-ui, sans-serif
fontSize: 11px
fontWeight: 500
padding: 3px 10px
refined: true
```

#### Alerts (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
padding: 14px 18px
borderWidth: 1px
iconSize: 18px
titleWeight: 600
crisp: true
```

#### Navigation (Sunset Warm)
```
borderRadius: 12px
fontFamily: 'Nunito', system-ui, sans-serif
fontWeight: 600
padding: 10px 18px
gap: 8px
soft: true
```

---

## Phase 2: Additional Components (Completed)

### Decisions Made

| Component | Chosen Style | Rationale |
|-----------|--------------|-----------|
| **Modals** | Arctic Light | Clean, clinical appearance for important dialogs, clear hierarchy |
| **Dropdowns** | Bloomberg Terminal | Dense, compact menus maximize efficiency, professional feel |
| **Command Palette** | Bloomberg Terminal | Dense search results, monospace for symbols, keyboard-friendly |
| **Data Viz** | Bloomberg Terminal | Dense data presentation, clear number formatting, professional |
| **Loading** | Bloomberg Terminal | Minimal, unobtrusive loading indicators, professional |
| **Empty States** | Bloomberg Terminal | Compact empty states, doesn't waste screen space |
| **Tooltips** | Arctic Light | Clean, readable tooltips with clear borders |
| **Tile Headers** | Arctic Light | Sharp, clean headers with clear visual hierarchy |

### Structural Specifications

#### Modals (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
padding: 16px-24px
headerBorder: 1px solid
shadow: strong elevation
backdrop: 60% black
```

#### Dropdowns (Bloomberg Terminal)
```
borderRadius: 0px
fontFamily: 'Consolas', 'Monaco', monospace
fontSize: 12px
itemPadding: 6px 12px
maxHeight: 200px
dense: true
```

#### Command Palette (Bloomberg Terminal)
```
borderRadius: 0px
fontFamily: 'Consolas', 'Monaco', monospace
inputHeight: 48px
resultPadding: 8px 12px
kbdStyle: monospace, muted background
dense: true
```

#### Data Viz (Bloomberg Terminal)
```
borderRadius: 0px
fontFamily: 'Consolas', 'Monaco', monospace
sparklineStroke: 1.5px
barGap: 1px
progressHeight: 4px
labelSize: 10px
dense: true
```

#### Loading (Bloomberg Terminal)
```
spinnerSize: sm=16px, md=24px
spinnerStroke: 2px
skeletonRadius: 2px
skeletonAnimation: pulse
minimal: true
```

#### Empty States (Bloomberg Terminal)
```
borderRadius: 0px
fontFamily: 'Consolas', 'Monaco', monospace
iconSize: 32px
padding: 24px
compact: true
```

#### Tooltips (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
padding: 8px 12px
fontSize: 12px
border: 1px solid
shadow: subtle
```

#### Tile Headers (Arctic Light)
```
borderRadius: 4px (container)
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
height: 40px
padding: 0 12px
iconSize: 16px
fontSize: 13px
borderBottom: 1px solid
```

---

## Phase 3: Extended Components (Completed)

### Decisions Made

| Component | Chosen Style | Rationale |
|-----------|--------------|-----------|
| **Sliders** | Bloomberg Terminal | Dense, functional controls for risk/position sizing, monospace values |
| **Checkboxes** | Midnight Pro | Refined, premium feel, subtle appearance |
| **Toasts** | Midnight Pro | Subtle, refined notifications with premium shadow |
| **Filter Chips** | Arctic Light | Clean, crisp selection chips with sharp edges |
| **Status Indicators** | Arctic Light | Clean, readable status with clear borders |
| **Avatars** | Midnight Pro | Refined, subtle source/analyst indicators, premium feel |
| **Keyboard Shortcuts** | Bloomberg Terminal | Dense, monospace kbd elements, power-user focused |

### Structural Specifications

#### Sliders (Bloomberg Terminal)
```
borderRadius: 0px
fontFamily: 'Consolas', 'Monaco', monospace
trackHeight: 8px
thumbSize: 16px
thumbRadius: 2px
labelSize: 10px
valueSize: 14px
dense: true
```

#### Checkboxes (Midnight Pro)
```
borderRadius: 4px
fontFamily: 'Inter', system-ui, sans-serif
size: 18px
borderWidth: 1px
labelSize: 13px
descriptionSize: 12px
gap: 12px
refined: true
```

#### Toasts (Midnight Pro)
```
borderRadius: 6px
fontFamily: 'Inter', system-ui, sans-serif
padding: 14px
iconSize: 20px
titleSize: 13px
descriptionSize: 12px
borderWidth: 1px
shadow: 0 8px 24px rgba(0, 0, 0, 0.25)
refined: true
```

#### Filter Chips (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
fontSize: 11px
fontWeight: 500
padding: 4px 10px
gap: 8px
borderWidth: 1px
crisp: true
```

#### Status Indicators (Arctic Light)
```
borderRadius: 4px
fontFamily: 'IBM Plex Sans', system-ui, sans-serif
dotSize: 8px
labelSize: 12px
descriptionSize: 11px
padding: 12px
borderWidth: 1px
crisp: true
```

#### Avatars (Midnight Pro)
```
borderRadius: 50%
fontFamily: 'Inter', system-ui, sans-serif
sizes: xs=24px, sm=32px, md=40px, lg=48px, xl=64px
fontSize: 12px
fontWeight: 600
borderWidth: 2px
refined: true
```

#### Keyboard Shortcuts (Bloomberg Terminal)
```
borderRadius: 4px
fontFamily: 'Consolas', 'Monaco', monospace
kbdPadding: 2px 6px
kbdFontSize: 11px
labelSize: 12px
descriptionSize: 11px
gap: 8px
dense: true
```

---

## Phase 4: Application (Ready)

All component decisions have been made. Next steps:
1. [x] Create unified Alpha theme with all structural styles
2. [x] Update AlphaPreview to showcase all components
3. [ ] Apply styles to actual trading terminal components
4. [ ] Test across all tiles and features
5. [ ] Refine based on real usage

### Summary of Style Sources

| Theme | Components Using It |
|-------|---------------------|
| **Retro Terminal** | Buttons |
| **Bloomberg Terminal** | Forms, Dropdowns, Command Palette, Data Viz, Loading, Empty States, Sliders, Keyboard Shortcuts |
| **Arctic Light** | Tables, Cards, Alerts, Modals, Tooltips, Tile Headers, Filter Chips, Status Indicators |
| **Midnight Pro** | Badges, Checkboxes, Toasts, Avatars |
| **Sunset Warm** | Navigation |

---

## Color Palette (Unchanged)

Using existing dark terminal palette:
```css
--background: 240 15% 8%      /* Deep dark */
--foreground: 0 0% 95%        /* Bright text */
--card: 240 15% 11%           /* Elevated panels */
--primary: 239 84% 67%        /* Indigo */
--secondary: 240 15% 18%
--accent: 38 92% 50%          /* Amber */
--muted: 240 15% 14%
--muted-foreground: 240 5% 60%
--border: 240 10% 25%
--bullish: 142 71% 45%        /* Green */
--bearish: 0 84% 60%          /* Red */
```

---

*Last updated: Phase 3 Extended complete - 22 component types defined*
