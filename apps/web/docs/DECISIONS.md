# Design Decisions Log

> This document tracks all UI/UX and architectural decisions made during the shadcn/ui integration.

---

## Confirmed Decisions

### Tile Consolidation (From User Feedback)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| TradingTile + OptionsTile + OrdersTile | **Merge into TradeTile** | Unified trading interface for stocks and options |
| PositionsTile + PerformanceTile | **Merge into PortfolioTile** | Single view for holdings and P&L analytics |
| FlowTile + HeatTile + ThemeTile | **Merge into MarketPulse** | Consolidated market signal view with treemap |
| TickerTile + OrderBookTile | **Absorb into ChartTile** | Chart header shows ticker info, sidebar shows depth |
| SettingsTile + SourcesTile | **Convert to Settings Sheet** | Slide-out panel instead of tile |

### Component Naming

| Decision | Choice | Rationale |
|----------|--------|-----------|
| FlowTile rename | **MarketPulse** | Conveys real-time market activity better |

### Feature Specifications

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Heat visualization | **Treemap (Finviz-style)** | Rectangles sized by activity, colored by sentiment |
| Mobile support | **Web only** | No responsive optimization needed |
| Tile count | **16 → 8 tiles** | Reduced complexity, better UX |

---

## Pending Decisions

### Aesthetic Direction

**Status**: Awaiting User Input

**Options**:
1. **Terminal** - Bloomberg-inspired, dense, monospace, amber accents
2. **Modern** - Linear/Vercel-inspired, clean, spacious, indigo accents
3. **Hybrid** - Dark mode with modern polish, dense but refined

**Demo**: `/demo/shadcn`

**Impact**: This decision affects all component styling, typography, spacing, and color usage throughout the app.

---

## Decision Template

```markdown
### [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Confirmed | Pending | Revised

**Context**:
[What problem or question prompted this decision?]

**Options Considered**:
1. Option A - [description]
2. Option B - [description]
3. Option C - [description]

**Decision**:
[What was decided?]

**Rationale**:
[Why was this option chosen?]

**Implications**:
- [Impact 1]
- [Impact 2]

**Revisit Conditions**:
[Under what circumstances should this be reconsidered?]
```

---

## Architecture Decisions

### shadcn/ui Component Location

**Date**: 2026-01-27
**Status**: Confirmed

**Context**:
Where should shadcn/ui components be stored in the monorepo?

**Options Considered**:
1. `apps/web/components/ui/` - App-specific UI components
2. `packages/ui/` - Shared monorepo UI package

**Decision**:
Store in `apps/web/components/ui/`

**Rationale**:
- Components are currently only used by the web app
- Simpler import paths (`@/components/ui/...`)
- Can migrate to shared package later if needed

**Implications**:
- All shadcn components live alongside app components
- Easy to customize for trading-specific variants

---

### Trading-Specific Component Variants

**Date**: 2026-01-27
**Status**: Confirmed

**Context**:
How to handle trading-specific UI patterns (buy/sell, bullish/bearish)?

**Decision**:
Add custom variants to shadcn components:

**Button variants**:
- `buy` - green, for buy actions
- `sell` - red, for sell actions

**Badge variants**:
- `bullish` - green tint
- `bearish` - red tint
- `pending` - amber tint
- `filled` - indigo tint

**Rationale**:
- Maintains shadcn patterns while adding domain-specific needs
- Consistent with CVA (class-variance-authority) approach
- Easy to use: `<Button variant="buy">` or `<Badge variant="bullish">`

---

## UI/UX Decisions

### Tile Header Pattern

**Status**: Pending

**Options**:
1. Minimal header with icon + title
2. Header with title + subtitle + actions
3. Collapsible header with details on expand

**Awaiting**: Aesthetic direction decision first

---

### Loading States

**Status**: Pending

**Options**:
1. Skeleton placeholders (shadcn Skeleton)
2. Spinner overlays
3. Progressive loading with stale data

**Recommendation**: Skeleton placeholders for data tiles, progressive loading where possible

---

## Color System Decisions

### CSS Variable Structure

**Date**: 2026-01-27
**Status**: Confirmed (existing system)

**Decision**:
Use existing HSL-based CSS variables, which are shadcn-compatible:

```css
--primary: 239 84% 67%        /* Indigo */
--bullish: 142 71% 45%        /* Green */
--bearish: 0 84% 60%          /* Red */
```

**Rationale**:
- Already in place
- Matches shadcn's expected format
- Supports light/dark theming

---

## Future Considerations

### Potential Additions
- Toast notification system
- Command palette enhancement
- Keyboard navigation improvements
- Accessibility audit

### Known Trade-offs
- Terminal style may be harder to read for new users
- Modern style may feel too sparse for power users
- Hybrid attempts to balance but may not satisfy either preference fully

---

## Change Log

| Date | Decision | Type |
|------|----------|------|
| 2026-01-27 | Component location: `apps/web/components/ui/` | Architecture |
| 2026-01-27 | Add trading variants to Button/Badge | Component |
| 2026-01-27 | Created 24 shadcn/ui components | Implementation |
