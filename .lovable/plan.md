

## Plan: 3-Tab Non-Scrollable Dashboard with Gamified UI

Restructure the entire dashboard from a single scrollable feed into 3 fixed-height tabs with a bottom nav. Each tab fills exactly the viewport (no scroll). The visual style shifts to a more gamified, premium look with deeper gradients, glowing accents, and bolder typography.

### Tab Layout

```text
┌──────────────────────────┐
│  Top Bar (sticky)        │
├──────────────────────────┤
│                          │
│   TAB CONTENT            │
│   (viewport height,      │
│    no scroll)            │
│                          │
├──────────────────────────┤
│  🏠 Home │ ⚡ Practice │ 🧭 Explore │
└──────────────────────────┘
```

### Tab 1 — Home (default)
Content fits in ~460px available height (587 - 56 top - 56 bottom - ~15 padding):
- **Greeting** (1 line) + **Streak Hero** (compact: flame + streak count + weekly dots — squeezed to ~80px)
- **Daily Flashcards** card (compact ~56px)
- **Set Today's Goals** / Sprint preview (compact ~56px)
- **Study Buddy** widget (compact ~56px)
- **Leaderboard snapshot** (top 3 + your rank, compact ~140px)

All components get condensed "compact" variants to fit without scrolling.

### Tab 2 — Practice
- **Daily Quiz** card with prominent "Start Quiz" CTA (the existing DashboardTodayAction, restyled)
- **Stat Pills** row (streak, best, quizzes, accuracy)
- **Progress section** (Practice/Planner tabs — existing DashboardProgressCompact)

### Tab 3 — Explore
- **Recommended for You** cards (horizontal scroll row)
- **Explore grid** (Courses, Test Series, Mentorship, Workshops, Free Courses, Strategy Call)

### File Changes

**1. `src/pages/Dashboard.tsx`** — Major rewrite
- Replace the scrollable `<main>` with a tab-state system (`useState<"home"|"practice"|"explore">`)
- Render only the active tab's content
- Add `overflow-hidden h-screen` to prevent any scroll
- Pass `activeTab` to `DashboardBottomNav`

**2. `src/components/dashboard/DashboardBottomNav.tsx`** — Change to 3 tabs
- Home (Home icon), Practice (Zap icon), Explore (Compass icon)
- Accept `activeTab` and `onTabChange` props instead of using route-based Links
- Tabs switch content in-page rather than navigating to different routes
- More prominent styling: larger icons, active tab has a glowing pill indicator

**3. `src/components/dashboard/DashboardStreakHero.tsx`** — Compact variant
- Reduce padding, make the weekly dots smaller, inline the streak count
- Target height: ~80px instead of current ~140px

**4. `src/components/dashboard/DashboardLeaderboardCompact.tsx`** — Compact snapshot
- Always show exactly top 3 + "Your" row (no expand button)
- Tighter row spacing, target ~130px total

**5. `src/components/dashboard/DashboardSprintPreview.tsx`** — Compact
- Reduce padding, single-line layout, target ~50px height

**6. `src/components/dashboard/DashboardTodayAction.tsx`** — Premium restyle
- Remove the expand section (flashcards/masterclass extras)
- Make the "Start Quiz" button larger and more prominent with glow effects

**7. `src/components/dashboard/DashboardStatPills.tsx`** — No changes needed (already compact)

**8. Gamified Visual Upgrades** (applied across all tabs)
- Deeper gradient mesh backgrounds with animated subtle glow orbs
- Glassmorphic cards with `backdrop-blur-xl` and neon-ish border accents
- Primary buttons get a pulsing glow shadow
- Streak fire gets animated gradient coloring
- XP/stat numbers use a monospace-like bold weight
- Bottom nav active indicator uses a glowing dot/pill

### Technical Notes
- The 3 tabs are in-page state, not separate routes — `/dashboard` is the only route
- Content uses `flex flex-col` with carefully sized components to fill exactly the available viewport height
- Practice and Sprint pages remain accessible via their own routes (from bottom nav links on those pages), but within the dashboard they're embedded as tab content
- No database or backend changes needed

