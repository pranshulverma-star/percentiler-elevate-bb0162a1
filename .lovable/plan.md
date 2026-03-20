

# Dashboard Premium Redesign + Missing Features

## Changes Overview

### 1. Fix Bottom Nav Profile Icon
Replace the non-functional `?tab=profile` link with a redirect to `/daily-sprint` (renamed "Sprint") since there's no profile page. This gives the 4th nav item a real destination.

**File**: `src/components/dashboard/DashboardBottomNav.tsx`
- Change Profile nav item to Daily Sprint (icon: `CalendarCheck`, label: "Sprint", to: `/daily-sprint`)

### 2. Add Study Buddy Widget to Dashboard
The `BuddyMiniWidget` exists but is never rendered on the dashboard. Add it prominently after the streak hero, plus a "Find a Study Buddy" CTA card for users without a buddy.

**File**: `src/pages/Dashboard.tsx`
- Import `BuddyMiniWidget` and render it after the streak hero section (Section 1.5)
- Add a new `DashboardBuddyCTA` component for users without an active buddy — a compact card with "Invite a Study Buddy" CTA linking to `/study-buddy`

**New file**: `src/components/dashboard/DashboardBuddyCTA.tsx`
- Glassmorphic card with `Users2` icon, tagline "Pair up for mutual accountability", and "Invite Buddy" + "Enter Code" buttons
- Links to `/study-buddy`

### 3. Make Flashcards Prominent — Move Above Tabs
Currently flashcards are hidden inside the expandable "Today's Action" section. Add a dedicated flashcard quick-access card right after Today's Action (visible without expanding).

**File**: `src/pages/Dashboard.tsx`
- Add a new section between Today's Action and Stat Pills: a compact flashcard banner card with "📚 Daily Flashcards — Review 5 cards in 2 min" and a CTA button to `/flashcards`

### 4. Premium Dashboard Visual Overhaul
Apply the project's premium glassmorphic aesthetic to the dashboard.

**File**: `src/pages/Dashboard.tsx`
- Add a subtle gradient mesh background (soft warm gradient orbs like the flashcard practice mode but lighter, respecting light/dark theme)
- Wrap main content area with a subtle noise texture overlay

**File**: `src/components/dashboard/DashboardStreakHero.tsx`
- Upgrade to glassmorphic card with backdrop-blur, subtle border glow, and animated gradient background
- Add a pulsing ring around the flame icon when streak > 0

**File**: `src/components/dashboard/DashboardTodayAction.tsx`
- Add gradient accent border on the left side
- Upgrade CTA button with shimmer animation matching navbar CTAs

**File**: `src/components/dashboard/DashboardRecommendations.tsx`
- Make recommendation cards taller with gradient accent tops (category-colored)
- Add subtle glow effect on hover
- Increase card width and add a proper CTA button instead of just an arrow

**File**: `src/components/dashboard/DashboardStatPills.tsx`
- Add glassmorphic backgrounds with subtle colored borders matching each stat's icon color

**File**: `src/components/dashboard/DashboardQuickAccess.tsx`
- Upgrade grid tiles with glassmorphic hover effects and subtle icon color accents

### 5. Add Daily Sprint / Todo List Visibility
Add a compact "Today's Goals" section on the dashboard showing sprint goals summary with a link to the full sprint page.

**New file**: `src/components/dashboard/DashboardSprintPreview.tsx`
- Shows today's sprint goal count (e.g., "2/5 goals done") with a progress ring
- "Set Today's Goals →" CTA if no goals set
- Links to `/daily-sprint`

**File**: `src/pages/Dashboard.tsx`
- Render `DashboardSprintPreview` after the flashcard card

## Final Dashboard Section Order
1. Greeting + Streak Hero (glassmorphic upgrade)
2. **Study Buddy widget** (new — shows buddy status or invite CTA)
3. Today's Action (visual upgrade)
4. **Flashcard Quick Card** (new — prominent daily flashcards CTA)
5. **Sprint Preview** (new — today's goals summary)
6. Stat Pills (glassmorphic upgrade)
7. Progress tabs (Practice/Planner)
8. Recommendations (visual upgrade, highlighted)
9. Leaderboard
10. Quick Access grid

## Technical Details

**Files to modify**: `Dashboard.tsx`, `DashboardBottomNav.tsx`, `DashboardStreakHero.tsx`, `DashboardTodayAction.tsx`, `DashboardRecommendations.tsx`, `DashboardStatPills.tsx`, `DashboardQuickAccess.tsx`

**New files**: `DashboardBuddyCTA.tsx`, `DashboardSprintPreview.tsx`

**No database changes needed.** All data sources already exist — buddy status from `buddy_pairs`, sprint goals from `sprint_goals`, flashcard progress from localStorage.

