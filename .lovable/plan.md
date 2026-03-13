

## Dashboard Redesign: Clean, Premium, Journey-Based

### Problem
The current dashboard is a flat 2-column grid of 8+ cards all competing for attention. No visual hierarchy, no narrative flow, no sense of progression. It feels like a settings page, not a journey.

### Design Concept: "Your Journey" Vertical Flow
Restructure from a cluttered grid into a **single-column vertical journey** with clear stages, using subtle connectors and progressive disclosure. Mobile-first, premium aesthetic.

```text
┌─────────────────────────────────┐
│  Hero Banner (greeting + streak │
│  flame + trend badge)           │
├─────────────────────────────────┤
│  ── STAGE 1: YOUR STATS ──     │
│  Compact horizontal stat pills  │
│  (streak, quizzes, accuracy)    │
│  + Weekly heatmap inline        │
├─────── journey connector ───────┤
│  ── STAGE 2: TODAY'S MISSION ── │
│  Single prominent action card   │
│  (Practice / Planner / Watch)   │
├─────── journey connector ───────┤
│  ── STAGE 3: PROGRESS ──       │
│  Tabs: Practice | Planner      │
│  (condensed, one visible)       │
├─────── journey connector ───────┤
│  ── STAGE 4: LEVEL UP ──       │
│  Strategy Call CTA (if needed)  │
│  + Workshop recommendation      │
├─────── journey connector ───────┤
│  ── STAGE 5: EXPLORE ──        │
│  Compact icon-row links:        │
│  Course | Mentorship | Tests    │
│  | Workshops | Free Courses     │
└─────────────────────────────────┘
```

### Files to Change

**1. `src/pages/Dashboard.tsx`** — Complete layout restructure
- Replace grid with vertical flow sections
- Add journey stage labels with numbered indicators
- Merge profile info into the hero greeting (avatar + name + sign out)
- Keep all data fetching logic unchanged

**2. `src/components/dashboard/DashboardStreaks.tsx`** — Compact inline version
- Convert from full-width card to a compact horizontal strip of stat pills
- Weekly heatmap becomes small inline dots instead of tall bars
- Remove card wrapper, integrate directly into hero area

**3. `src/components/dashboard/DashboardProfile.tsx`** — Merge into hero
- Remove as standalone card; phone edit becomes an inline element in hero section
- Profile details (email, phone) shown as subtle secondary text under greeting

**4. `src/components/dashboard/DashboardCallCTA.tsx`** — Slimmer design
- Remove card chrome, make it a gradient banner with single CTA button
- Only show if not yet converted

**5. `src/components/dashboard/DashboardPracticeLab.tsx`** — Condensed
- Remove workshop recommendation from here (moved to dedicated section)
- Show only top 3 recent quizzes instead of 5
- Tighter spacing

**6. `src/components/dashboard/DashboardMasterclass.tsx`** — Merge into "Today's Mission"
- If masterclass not started, show as the primary mission card
- If started, show progress as secondary element

**7. `src/components/dashboard/DashboardCourses.tsx`** — Compact explore row
- Convert 3 separate cards into a horizontal scrollable row of compact icon+label tiles
- Each tile links out, no expanded content

### Visual Details
- Journey connectors: thin vertical line with small circle nodes between sections (CSS only)
- Stage labels: "STAGE 1", "STAGE 2" in small caps with subtle primary color
- Hero: larger greeting with avatar initial circle, streak flame animation
- Stats: pill-shaped with glassmorphic bg (backdrop-blur)
- Mission card: gradient border with subtle glow
- Single column max-w-lg on mobile, centered
- Framer-motion staggered fade-in for each stage

### What stays the same
- All data fetching logic in Dashboard.tsx
- All Supabase queries
- computeStreaks and getWeekStart functions
- WorkshopRecommendation component (relocated, not rebuilt)

