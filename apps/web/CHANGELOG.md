# Alpha Beta Kappa - Development Changelog

This document tracks all UI/UX changes, bug fixes, and feature implementations across development sessions.

---

## Session: January 27, 2026 - shadcn/ui Integration Phase 1

### Summary
Phase 1 of the shadcn/ui integration plan. Set up component library foundation, created aesthetic demo page for user review.

---

### Phase 1: Demo Setup

**Goal:** Initialize shadcn/ui, create aesthetic comparison demo for user to select visual direction.

#### Radix UI Packages Installed
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-select`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-popover`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-switch`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-avatar`
- `@radix-ui/react-progress`
- `@radix-ui/react-label`
- `@radix-ui/react-slider`

#### shadcn/ui Components Created
All components in `components/ui/`:

| Component | File | Notes |
|-----------|------|-------|
| Button | `button.tsx` | Includes buy/sell variants |
| Input | `input.tsx` | Standard input |
| Badge | `badge.tsx` | Includes bullish/bearish/pending/filled variants |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| Label | `label.tsx` | Form labels |
| Card | `card.tsx` | Card container |
| Tabs | `tabs.tsx` | Tabbed interface |
| Table | `table.tsx` | Data table |
| ScrollArea | `scroll-area.tsx` | Custom scrollbar |
| Dialog | `dialog.tsx` | Modal dialogs |
| Select | `select.tsx` | Dropdown select |
| Switch | `switch.tsx` | Toggle switch |
| Checkbox | `checkbox.tsx` | Checkbox input |
| Separator | `separator.tsx` | Visual divider |
| AlertDialog | `alert-dialog.tsx` | Confirmation dialogs |
| DropdownMenu | `dropdown-menu.tsx` | Context menus |
| Tooltip | `tooltip.tsx` | Hover hints |
| Avatar | `avatar.tsx` | User/source images |
| Progress | `progress.tsx` | Progress bar |
| Toggle | `toggle.tsx` | Toggle button |
| ToggleGroup | `toggle-group.tsx` | Toggle button group |
| Popover | `popover.tsx` | Floating content |
| Textarea | `textarea.tsx` | Multi-line input |
| Slider | `slider.tsx` | Range slider |

#### Aesthetic Demo Page
- **File:** `app/demo/shadcn/page.tsx` (NEW)
- **Route:** `/demo/shadcn`
- Side-by-side comparison of 3 aesthetic styles:
  1. **Terminal** - Bloomberg-inspired, dense, monospace, amber accents
  2. **Modern** - Linear/Vercel-inspired, clean, spacious, indigo accents
  3. **Hybrid** - Dark mode with modern polish, dense but refined
- Shows: Buttons, Order Forms, Tables, Cards, Badges, Feed Cards
- Toggle visibility of each style for comparison

#### Documentation Created
- **File:** `docs/SHADCN_INTEGRATION_STATUS.md` (NEW)
  - Progress tracker for the integration
  - Session logs
  - Component checklist

- **File:** `docs/DECISIONS.md` (NEW)
  - Decision log with rationale
  - Pending decisions (aesthetic direction)
  - Architecture decisions

---

### Next Steps
1. **User reviews `/demo/shadcn`** and selects aesthetic direction
2. Apply chosen theme to component CSS variables
3. Begin Wave 1 integration (Button replacement across tiles)
4. Create TradeTile prototype with merged functionality

---

## Session: January 22, 2026 - Elevation Plan Sprints 1-5

### Summary
Implementation of the "Narrative Terminal Elevation Plan" - transforming the terminal from prototype to production-ready trading platform. Focus on capital protection, real data, sentiment intelligence, source tracking, and test coverage.

---

### Sprint 1: Protect Your Capital ✅

**Goal:** Make it safe to trade real money.

#### Order Confirmation Modal
- **File:** `components/tiles/OrderConfirmModal.tsx` (NEW)
- Shows cost preview, quantity, % of equity, buying power remaining
- Validates insufficient funds with error state
- Warnings for positions > 25% of equity
- Requires explicit confirmation before execution

#### Position Size Calculator
- **File:** `components/tiles/TradingTile.tsx` (MODIFIED)
- Quick presets: 5%, 10%, 25%, 50% of buying power
- Shows existing position if already holding ticker
- "Review Order" button opens confirmation modal

#### Buying Power Validation
- Integrated into order flow
- Prevents orders exceeding available buying power

---

### Sprint 2: Real Data Everywhere ✅

**Goal:** Remove all mock data, show live information.

#### HeatTile Real Mentions
- **File:** `app/api/heat/route.ts` (NEW)
- Aggregates ticker mentions from feed_items
- Calculates delta vs baseline, velocity, narrative detection
- Returns ticker heat with source attribution

- **File:** `components/tiles/HeatTile.tsx` (MODIFIED)
- Removed all mock data
- Fetches from /api/heat with SWR (60s refresh)
- Added loading, error, empty states

#### OrderBook Live Data
- **File:** `app/api/alpaca/orderbook/route.ts` (NEW)
- Fetches quotes/trades from Alpaca
- Generates synthetic depth from NBBO

- **File:** `components/tiles/OrderBookTile.tsx` (MODIFIED)
- Fetches from API with 5-second refresh
- Proper loading/error states

#### FlowTile Reliable Population
- **File:** `components/tiles/FlowTile.tsx` (MODIFIED)
- Removed `getMockItems()` function entirely
- Added proper empty state with Inbox icon
- Added SentimentBadge component

---

### Sprint 3: Sentiment Intelligence ✅

**Goal:** Know if a signal is bullish or bearish before trading.

#### FinBERT Integration
- **File:** `lib/services/sentiment-analyzer.ts` (NEW)
- Uses Hugging Face Inference API with ProsusAI/finbert
- Functions: `analyzeSentiment()`, `analyzeSentimentBatch()`
- Helper functions: `getSentimentEmoji()`, `getSentimentColor()`, `calculateContrarianBonus()`

#### Sentiment in Scoring
- **File:** `lib/scoring.ts` (MODIFIED)
- New formula components:
  - Sentiment confidence (0-20 points): `sentimentScore * 20`
  - Source accuracy (0-15 points): `historicalHitRate * 15`
  - Contrarian bonus (+10%): if sentiment opposes recent price move

#### Database Schema Updates
- **File:** `supabase/schema.sql` (MODIFIED)
- Added to feed_items: `sentiment_label`, `sentiment_score`, `sentiment_analyzed_at`

#### Sentiment API
- **File:** `app/api/sentiment/route.ts` (NEW)
- POST: Analyze sentiment of feed items
- GET: Check pending analysis count

---

### Sprint 4: Source Leaderboard ✅

**Goal:** Know which sources actually generate alpha.

#### Leaderboard Tile
- **File:** `components/tiles/LeaderboardTile.tsx` (NEW)
- Displays source rankings by alpha score, hit rate, avg return
- Expandable rows with detailed stats (best/worst picks)
- Medal icons for top 3, external link to Twitter
- Sortable by: Alpha Score, Hit Rate, Avg Return, Activity

#### Leaderboard API
- **File:** `app/api/leaderboard/route.ts` (NEW)
- Returns source performance data
- Sorts by alpha_score, hit_rate_1d, avg_return_1d, total_predictions
- Falls back to source weights if no prediction data

#### Smart Money Alerts
- **File:** `stores/alertsStore.ts` (MODIFIED)
- Added `SmartMoneyRule` interface with configurable thresholds
- Added watchlist management (`addToWatchlist`, `removeFromWatchlist`)
- Added `triggerSmartMoneyAlert()` for notifications

- **File:** `app/api/smart-money/route.ts` (NEW)
- Fetches recent activity from high-accuracy sources
- Filters by min hit rate, alpha score, watchlist, sentiment

#### AlertsTile Smart Money Tab
- **File:** `components/tiles/AlertsTile.tsx` (MODIFIED)
- New "Smart" tab with Crown icon
- Configure: min hit rate, min alpha score, watchlist only, sentiment filter
- Shows recent smart money activity feed

#### Prediction Tracking
- **File:** `lib/services/return-attribution.ts` (MODIFIED)
- Added `createPrediction()` function
- Added `processPendingPredictions()` for exit price/outcome calculation
- Added `calculateSourcePerformanceFromPredictions()`

#### Type Updates
- **File:** `lib/supabase/types.ts` (MODIFIED)
- Added `source_predictions` table type
- Updated `source_performance` with new fields
- Added sentiment columns to `feed_items`

---

### Sprint 5: Critical Path Tests ✅

**Goal:** Sleep at night knowing trading logic won't break.

#### Test Setup
- **File:** `vitest.config.ts` (NEW)
- **File:** `lib/__tests__/setup.ts` (NEW)
- Configured vitest with happy-dom
- Mocked environment variables and fetch

#### Scoring Tests (26 tests)
- **File:** `lib/__tests__/scoring.test.ts` (NEW)
- `calculateScore` - weight, velocity, recency, ticker count
- `calculateScoreWithBreakdown` - detailed component breakdown
- Sentiment scoring and contrarian bonus
- Multipliers (multi-source, breaking news)
- `calculateVelocity`, `getScoreTier`, `getScoreColor`

#### Sentiment Tests (25 tests)
- **File:** `lib/__tests__/sentiment-analyzer.test.ts` (NEW)
- `getSentimentEmoji`, `getSentimentColor`, `getSentimentBgColor`
- `calculateContrarianBonus` - scaling, thresholds
- `analyzeSentiment` - API calls, error handling, rate limiting
- `analyzeSentimentBatch` - batch processing

#### Trading Store Tests (19 tests)
- **File:** `stores/__tests__/tradingStore.test.ts` (NEW)
- `fetchAccount`, `fetchPositions` - loading states, error handling
- `submitOrder` - success, error, validation
- `cancelOrder`, `cancelAllOrders`
- Local state updates, selectors

#### Package.json Updates
- Added scripts: `test`, `test:watch`, `test:coverage`

---

### Files Changed This Session (Sprints 1-5)

| Category | Files |
|----------|-------|
| **New Components** | `OrderConfirmModal.tsx`, `LeaderboardTile.tsx` |
| **New APIs** | `heat/route.ts`, `orderbook/route.ts`, `sentiment/route.ts`, `leaderboard/route.ts`, `smart-money/route.ts` |
| **New Services** | `sentiment-analyzer.ts` |
| **New Tests** | `scoring.test.ts`, `sentiment-analyzer.test.ts`, `tradingStore.test.ts`, `setup.ts` |
| **Modified Tiles** | `TradingTile.tsx`, `HeatTile.tsx`, `FlowTile.tsx`, `OrderBookTile.tsx`, `AlertsTile.tsx` |
| **Modified Stores** | `alertsStore.ts`, `workspace.ts` |
| **Modified Lib** | `scoring.ts`, `return-attribution.ts`, `supabase/types.ts` |
| **Config** | `vitest.config.ts`, `package.json` |

### Files Changed (Sprints 6-7)

| Category | Files |
|----------|-------|
| **Auth System** | `middleware.ts`, `lib/auth-context.tsx`, `lib/crypto.ts` |
| **Auth Pages** | `app/auth/login/page.tsx`, `app/auth/callback/route.ts`, `app/auth/logout/route.ts` |
| **User APIs** | `app/api/user/credentials/route.ts`, `app/api/user/settings/route.ts`, `app/api/notifications/email/route.ts` |
| **Components** | `components/shell/UserMenu.tsx` |
| **Modified** | `AlertsTile.tsx`, `alertsStore.ts`, `lib/supabase/server.ts`, `lib/supabase/types.ts`, `app/layout.tsx` |
| **Database** | `supabase/migrations/003_auth_and_rls.sql` |
| **Config** | `package.json` (added resend) |

---

### Test Commands

```bash
npm run test          # Run all 70 tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

---

---

### Sprint 6: Alert Builder ✅

**Goal:** Don't miss signals while away from computer.

#### Compound Conditions System
- **File:** `stores/alertsStore.ts` (MODIFIED)
- New types: `AlertCondition`, `CompoundAlertRule`, `AlertTemplate`
- Condition types: ticker, sentiment, price, score, source_accuracy, mention_velocity
- Operators: equals, above, below, contains
- Logic: AND (all conditions) or OR (any condition)
- `checkCompoundRules()` - evaluates all enabled rules against incoming data
- `createRuleFromTemplate()` - quick start from pre-built templates

#### Pre-Built Templates
1. **High Accuracy Source + Bullish** - Alert when 60%+ accuracy source posts bullish
2. **Ticker Mention Spike** - Alert when specific ticker has high velocity
3. **High Score Signal** - Alert when any signal scores above 80
4. **Contrarian Setup** - High accuracy source with bearish sentiment

#### Email Notifications
- **File:** `app/api/notifications/email/route.ts` (NEW)
- Resend integration for email delivery
- Styled HTML email templates
- Configurable per-rule email addresses

#### AlertsTile Builder Tab
- **File:** `components/tiles/AlertsTile.tsx` (MODIFIED)
- New "Builder" tab with purple accent
- Template quick-start cards
- Custom rule creation
- Expandable rule cards with:
  - Logic toggle (AND/OR)
  - Condition list with add/remove
  - Notification settings (browser + email)
  - Trigger count and last triggered time

---

### Sprint 7: Simple Auth ✅

**Goal:** Let others try it without exposing your API keys.

#### Supabase Auth (Magic Link)
- **File:** `lib/supabase/server.ts` (MODIFIED)
- Added `createServerClient()` with cookie handling
- Added `getUser()` and `getSession()` helpers

- **File:** `middleware.ts` (NEW)
- Session refresh on every request
- Protected routes: `/dashboard`, `/settings`, `/trading`
- Automatic redirect to login for unauthenticated users
- Redirect authenticated users away from auth pages

- **File:** `app/auth/login/page.tsx` (NEW)
- Magic link email input
- Loading, success, and error states
- Gradient styling matching app theme

- **File:** `app/auth/callback/route.ts` (NEW)
- Exchanges auth code for session
- Handles redirect after successful login

- **File:** `app/auth/logout/route.ts` (NEW)
- Signs out user and clears session

#### Auth Context
- **File:** `lib/auth-context.tsx` (NEW)
- `AuthProvider` component for client-side auth state
- `useAuth()` hook - user, session, signOut, refreshSession
- `useRequireAuth()` hook - redirect if not authenticated

- **File:** `components/shell/UserMenu.tsx` (NEW)
- User avatar with dropdown menu
- Links to settings and credentials
- Sign out button

#### Per-User Encrypted Credentials
- **File:** `lib/crypto.ts` (NEW)
- AES-256-GCM encryption for sensitive data
- `encrypt()` / `decrypt()` for strings
- `encryptCredentials()` / `decryptCredentials()` for objects

- **File:** `app/api/user/credentials/route.ts` (NEW)
- GET: List user's credentials (without secrets)
- POST: Create new encrypted credentials
- DELETE: Remove credentials
- `getUserCredentials()` - internal function for decrypted access

- **File:** `app/api/user/settings/route.ts` (NEW)
- GET: Fetch user settings with defaults
- PUT: Upsert user settings

#### Database Schema & RLS
- **File:** `supabase/migrations/003_auth_and_rls.sql` (NEW)
- `user_credentials` table - encrypted API keys per provider
- `user_settings` table - preferences and notification settings
- `user_alert_rules` table - persistent compound rules
- Added `user_id` columns to existing tables
- Row-Level Security policies for all user tables
- `handle_new_user()` trigger for auto-creating settings

#### Type Updates
- **File:** `lib/supabase/types.ts` (MODIFIED)
- Added `UserCredential`, `UserSettings`, `UserAlertRule` types

---

## TODO: Remaining Features

## Deferred Features (Build When Needed)

| Feature | When to Build | Notes |
|---------|---------------|-------|
| Mobile PWA | When you travel and need to check positions | Service worker, manifest.json |
| Multi-broker (IBKR) | When Alpaca limits become a problem | Abstract broker interface |
| Backtesting | When you want to validate strategies historically | Historical data + replay |
| Full auth + billing | When you have paying customers | Stripe integration |

---

## Priority Matrix

| # | Feature | Impact on Trading | Effort | Status |
|---|---------|-------------------|--------|--------|
| 1 | Order safety | Critical | Low | ✅ Done |
| 2 | Real data | Critical | Medium | ✅ Done |
| 3 | Sentiment scoring | High | Medium | ✅ Done |
| 4 | Source leaderboard | High | Medium | ✅ Done |
| 5 | Tests | High | Low | ✅ Done |
| 6 | Alert builder | High | Medium | ✅ Done |
| 7 | Auth | Medium | Medium | ✅ Done |

---

## Session: January 13, 2026

### Summary
Major UI/UX overhaul addressing user feedback on visual hierarchy, component consistency, and functionality issues.

---

### 1. Z-Index Hierarchy Fix
**Problem:** Tiles were appearing OVER modals (Interest Wizard, CommandBar), breaking the expected overlay behavior.

**Solution:**
- Interest Wizard: Changed from `z-50` to `z-[200]`
- CommandBar: Changed from `z-50` to `z-[100]`
- Tiles remain at default z-index (1-50)

**Files Modified:**
- `components/onboarding/InterestWizard.tsx`
- `components/shell/CommandBar.tsx`

**Status:** ✅ Implemented

---

### 2. Interest Wizard Visual Fix
**Problem:** Modal had dark background making sector cards invisible. The modal was using CSS variables that weren't inheriting light theme in fixed position context.

**Solution:**
- Replaced all CSS variable classes (`bg-card`, `border-border`) with explicit Tailwind colors (`bg-white`, `border-gray-200`, `bg-indigo-500`)
- Changed backdrop from solid black to `bg-black/70 backdrop-blur-sm` for transparency

**Files Modified:**
- `components/onboarding/InterestWizard.tsx`

**Status:** ✅ Implemented

---

### 3. Redundant Section Headers Removed
**Problem:** Every tile had BOTH a TileGrid panel header AND an internal section header (e.g., "SETTINGS" panel + "Settings" with icon inside).

**Solution:**
- Removed internal header sections from all tiles
- TileGrid now provides the only header
- Cleaned up unused icon imports

**Files Modified:**
- `components/tiles/SettingsTile.tsx` - Removed Settings icon header
- `components/tiles/AlertsTile.tsx` - Removed Bell icon header
- `components/tiles/NotesTile.tsx` - Removed StickyNote header, replaced with toolbar showing note count
- `components/tiles/TickerTile.tsx` - Removed LineChart header
- `components/tiles/ThemeTile.tsx` - Removed Hash icon header

**Status:** ✅ Implemented

---

### 4. Settings Tile Cleanup
**Problem:** UI Style toggles (Terminal/Modern) were confusing and unnecessary.

**Solution:**
- Removed the "UI Style" section entirely
- Kept only Color Mode (Dark/Light) toggle
- Removed unused `uiTheme` and `setUiTheme` state variables

**Files Modified:**
- `components/tiles/SettingsTile.tsx`

**Status:** ✅ Implemented

---

### 5. Flow Tile Filter Labels
**Problem:** Filter toggle labels were cryptic abbreviations ("Eq", "Cr", "Ma") - unclear what they meant.

**Solution:**
- Changed labels to clear full words:
  - "Eq" → "Stocks"
  - "Cr" → "Crypto"
  - "Ma" → "Macro"
  - "Mt" → "Metals"

**Files Modified:**
- `components/tiles/FlowTile.tsx`

**Status:** ✅ Implemented

---

### 6. Flow Tile Data Fix (Previous Session)
**Problem:** Flow tile showed 0 items because mock data had static timestamps calculated at module load time, becoming stale.

**Solution:**
- Converted `const mockItems` to `function getMockItems()` that generates fresh timestamps on each call

**Files Modified:**
- `components/tiles/FlowTile.tsx`

**Status:** ✅ Implemented

---

### 7. Blue Focus Rings Removed
**Problem:** Bright blue outline appeared on quick actions, search inputs, and interactive elements - looked unprofessional.

**Solution:**
- Updated global CSS to remove default focus rings
- Added subtle focus indicators only for buttons/links when needed
- Removed all focus rings from inputs (rely on border changes instead)

**Files Modified:**
- `app/globals.css`

**CSS Added:**
```css
:focus-visible {
  outline: none;
}

button:focus-visible,
a:focus-visible,
[role="button"]:focus-visible {
  outline: 1px solid hsl(var(--muted-foreground) / 0.3);
  outline-offset: 1px;
}

input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  box-shadow: none;
}
```

**Status:** ✅ Implemented

---

### 8. Notes Tile - Custom Delete Modal
**Problem:** Deleting notes triggered browser's native `confirm()` dialog - inconsistent with app design.

**Solution:**
- Added state for tracking delete confirmation (`deleteConfirmId`, `isDeleting`)
- Created custom styled delete confirmation modal
- Modal includes icon, title, description, Cancel and Delete buttons

**Files Modified:**
- `components/tiles/NotesTile.tsx`

**Status:** ✅ Implemented

---

### 9. Link Group Circle Tooltip
**Problem:** User didn't understand what the colored circle near resize handles was for.

**Solution:**
- Updated tooltip from `Link: ${color}` to `Sync group: ${color} - Click to cycle colors and link tiles together`
- Added code comments explaining the feature

**Files Modified:**
- `components/shell/TileGrid.tsx` (two locations)

**Status:** ✅ Implemented

---

### 10. Heat Tile Fixes
**Problem:**
- Only showed one ticker (filter was stuck on "macro")
- Used global assetFocus filter instead of local control

**Solution:**
- Added local filter state defaulting to "all"
- Created dropdown filter with clear labels (All, Stocks, Crypto, Macro, Metals)
- Shows ticker count in tab button: "Tickers (20)"
- Removed dependency on global assetFocus

**Files Modified:**
- `components/tiles/HeatTile.tsx`

**Status:** ✅ Implemented

---

### 11. Options Tile Fixes
**Problem:**
- Only showed 6 expirations (limited by `.slice(0, 6)`)
- Only showed 15 strikes (limited by `.slice(0, 15)`)
- Calendar/expiration selector was just buttons, hard to see all options

**Solution:**
- Changed expiration selector from button row to dropdown showing ALL expirations
- Dropdown shows strike count per expiration: "Jan 17, 25 (45 strikes)"
- Removed strike limit - now shows all available strikes
- Note: Puts were already implemented, just needed visibility improvements

**Files Modified:**
- `components/tiles/OptionsTile.tsx`

**Status:** ✅ Implemented

---

## Known Issues / Future Work

### Not Yet Addressed
1. **Import/Export in Settings** - Mentioned but not fixed in this session
2. **Options tile lag** - May need virtualization for very large strike lists
3. **Chart/Ticker tile** - User mentioned wanting more trading-style candlestick charts
4. **Command bar** - Quick actions at bottom should be at top, "Clustered" action doesn't work

### Deferred
- Font consistency between Interest Wizard and main app
- Smart ordering in dropdowns (most-clicked first)

---

## Files Changed This Session

| File | Changes |
|------|---------|
| `components/onboarding/InterestWizard.tsx` | Z-index, explicit colors, transparent backdrop |
| `components/shell/CommandBar.tsx` | Z-index to z-[100] |
| `components/shell/TileGrid.tsx` | Link group tooltip improvements |
| `components/tiles/SettingsTile.tsx` | Removed header, removed UI style toggles |
| `components/tiles/AlertsTile.tsx` | Removed header |
| `components/tiles/NotesTile.tsx` | Removed header, custom delete modal |
| `components/tiles/TickerTile.tsx` | Removed header |
| `components/tiles/ThemeTile.tsx` | Removed header |
| `components/tiles/FlowTile.tsx` | Clear filter labels |
| `components/tiles/HeatTile.tsx` | Local filter, show all tickers |
| `components/tiles/OptionsTile.tsx` | Dropdown expiration, show all strikes |
| `app/globals.css` | Focus ring removal |

---

## Testing Notes

After implementing these changes, verify:
- [ ] Interest Wizard appears above all tiles
- [ ] CommandBar appears above tiles but below Interest Wizard
- [ ] All tiles have single header (from TileGrid only)
- [ ] Heat tile shows 20 tickers by default
- [ ] Options tile dropdown shows all expirations
- [ ] No blue focus rings on any element
- [ ] Notes delete shows custom modal, not browser dialog
- [ ] Flow tile labels read "Stocks", "Crypto", "Macro"
