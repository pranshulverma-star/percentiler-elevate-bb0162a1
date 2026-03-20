

# Plan: Flashcard Redesign, Smart Dashboard Promotions, Consistency Bug Fix

## 1. Fix Planner Consistency Score Bug (Critical)

**Root Cause**: `heatScoring.ts` line 119 computes `consistencyScore = (totalActiveDays / daysSinceJoin) * 100` — already a percentage (e.g., 100 for perfect). But `DashboardPlanner.tsx`, `DashboardProgressCompact.tsx`, and `AdminPlannerStats.tsx` all display it as `Math.round(consistency * 100)%`, multiplying by 100 again. A user with 100% consistency shows as **10000%**.

Additionally, `days_since_join` is stored as 1 for many users even after multiple days — the `recalculateHeatScore` function only runs when users actively use the planner page, so the stored value goes stale.

**Fix**: Change the storage format to store consistency as a 0-1 decimal (matching what the display code expects):
- `heatScoring.ts` line 119: change `* 100` to just the raw ratio
- `heatScoring.ts` line 132: remove the rounding that assumes percentage format
- `calculateHeatScore` thresholds on lines 32-36: adjust from 85/70 to 0.85/0.70

**Files**: `src/lib/heatScoring.ts`

---

## 2. Redesign Flashcard Cards & Buttons

**Current issues**: Plain white glassmorphic cards look flat; buttons are basic colored rectangles; no visual depth.

**Changes to `FlashcardDisplay.tsx`**:
- Add a subtle SVG mesh/gradient background pattern inside each card face (category-colored)
- Increase card height to 340px for more breathing room
- Add an animated gradient border that pulses subtly on the category color
- Enhance glassmorphism: increase blur to 24px, add inner glow, stronger border opacity
- Add a subtle radial gradient overlay behind the text area for depth
- Category label gets a small pill/chip background
- "Tap to reveal" gets a bouncing arrow animation

**Changes to `ActionButtons.tsx`**:
- Redesign as 3 pill-shaped buttons in a horizontal row with glassmorphic styling
- "Didn't know" and "I knew it" get gradient backgrounds instead of flat colors
- Add icon-only circular buttons for mobile (< 380px) with text on larger screens
- Flip button becomes a centered circular icon button between the two
- Add subtle scale + shadow transition on hover/active

**Changes to `FlashcardPractice.tsx`**:
- Score tracker gets a cleaner pill-style display integrated below the action buttons

**Files**: `src/components/flashcards/FlashcardDisplay.tsx`, `src/components/flashcards/ActionButtons.tsx`, `src/components/flashcards/FlashcardPractice.tsx`

---

## 3. Smart Dashboard Promotions Based on Progress

**Current state**: `DashboardRecommendations` only shows 1 weak-section workshop + 2 static free tool links. No mentorship or course promotion tied to user progress.

**New `DashboardRecommendations` logic** — build a prioritized recommendation engine:

1. **Low accuracy (< 50% avg)**: Promote mentorship ("Struggling? A mentor can help you crack your weak areas") + relevant workshop
2. **Medium accuracy (50-70%)**: Promote weakest-section workshop + full course if not converted
3. **Good accuracy (> 70%) but low streak (< 3 days)**: Promote mentorship for consistency coaching
4. **No practice attempts**: Promote full course ("Start your CAT journey") + mentorship
5. **Not converted**: Always include a compact course promotion card
6. **Not on mentorship**: Include a mentorship nudge with contextual copy

**Card design**: Each recommendation gets a richer card with:
- Contextual tagline based on user state (e.g., "Your LRDI accuracy is 42% — this workshop can help")
- Category badge + price for paid items, "Free" badge for tools
- Primary CTA button

**Props change**: Pass `converted`, `mentorshipActive`, `practiceAttempts`, and `streakData` to `DashboardRecommendations`

**Files**: `src/components/dashboard/DashboardRecommendations.tsx`, `src/pages/Dashboard.tsx` (pass additional props)

---

## Technical Summary

| Task | Files | Complexity |
|------|-------|-----------|
| Consistency bug | `heatScoring.ts` | Small — change 3 lines |
| Flashcard redesign | `FlashcardDisplay.tsx`, `ActionButtons.tsx`, `FlashcardPractice.tsx` | Medium — visual overhaul |
| Smart promotions | `DashboardRecommendations.tsx`, `Dashboard.tsx` | Medium — new recommendation logic |

