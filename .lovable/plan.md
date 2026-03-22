

## Plan: Fill Viewport — Bigger, Bolder Components Across All 3 Tabs

The current components are compact (designed for the old scrollable layout), leaving significant blank space in the fixed `h-full` container (~460px available). The fix: make each component expand to fill the viewport using `flex-1` growth and bigger sizing.

### Tab 1 — Home

**Streak Hero** — Expand from ~100px to ~130px
- Larger flame icon (w-12 h-12), bigger streak text (text-lg), larger weekly dots (max-w-[36px]), add an animated gradient background band

**Quick Actions (Flashcards + Sprint)** — Expand from ~56px to ~80px each
- Taller cards (p-4), larger icons (w-10 h-10), bigger text (text-sm), add a motivational subtitle line, subtle gradient background per card

**Study Buddy** — Expand from ~48px to ~70px
- Taller padding, larger icon, add animated "Find a buddy" shimmer CTA

**Leaderboard** — Use `flex-1` to fill remaining space
- Larger row height (py-2.5), bigger text (text-xs → text-sm), add rank badges with colored backgrounds, add a glowing border on "Your" row, animated entry

### Tab 2 — Practice

**Daily Quiz CTA** — Expand from ~140px to ~180px
- Bigger icon (w-14 h-14), larger heading (text-lg), taller button (h-14), add pulsing glow ring around the icon

**Stat Pills** — Already good, minor size bump

**Progress section** — `flex-1` fills remaining, already has overflow-y-auto (fine)

### Tab 3 — Explore

**Recommended cards** — Expand from w-40 to w-48, taller (p-4), larger text
- Add gradient backgrounds per card instead of plain bg-card
- Bigger icons and bolder taglines

**Explore Grid** — Use `flex-1`, expand tiles
- Taller tiles (py-6), larger icons (h-7 w-7), bigger labels (text-xs)
- Add colored gradient backgrounds matching each tile's accent color
- Add subtle glow/shadow on hover

### Files Changed

1. **`src/components/dashboard/HomeTab.tsx`** — Expand all sections, bigger typography, larger icons, animated streak gradient, leaderboard fills remaining space
2. **`src/components/dashboard/ExploreTab.tsx`** — Wider recommendation cards, taller grid tiles with gradient fills, grid uses flex-1
3. **`src/components/dashboard/PracticeTab.tsx`** — Bigger daily quiz CTA, larger button, pulsing glow on icon

No new files, no backend changes. Pure visual expansion to eliminate blank space.

