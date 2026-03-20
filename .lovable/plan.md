

## Problem: Two Disconnected Streak Systems

The codebase has **two separate, incompatible streak systems** that don't talk to each other:

### System 1: `daily_streaks` table + `useStreaks` hook
- A dedicated `daily_streaks` table exists with `(user_id, activity_date, activity_type)`.
- `useStreaks` hook reads from it and exposes `recordActivity()` for types: quiz, test, flashcards, practice_lab, sprint.
- **Only used in 2 places:**
  - `FlashcardHero.tsx` — reads `currentStreak` for display
  - `useFlashcardProgress.ts` — writes "flashcards" streak after 5 cards practiced

### System 2: `computeStreaks()` in Dashboard.tsx
- Dashboard computes streaks **entirely from `practice_lab_attempts`** timestamps.
- Ignores the `daily_streaks` table completely.
- This means: flashcard activity, daily sprint completions, planner activity, and battle room completions are **invisible** to the dashboard streak.

### What's NOT recording streaks at all:
| Feature | Writes to `daily_streaks`? | Used by Dashboard? |
|---|---|---|
| Practice Lab quiz completion | **No** | Yes (via `practice_lab_attempts` dates) |
| Battle Room completion | **No** | No |
| Flashcard practice (5+ cards) | **Yes** | **No** (dashboard ignores it) |
| Daily Sprint goal completion | **No** | No |
| Study Planner activity | **No** | No |

**Result**: The dashboard shows a streak based only on Practice Lab quiz dates. A student who practices flashcards and uses the planner daily but skips quizzes sees a **0-day streak**.

---

## Plan: Unify Around `daily_streaks` Table

### Step 1: Wire streak recording into all activity completion points

Add `useStreaks().recordActivity()` calls at these existing save points:

- **Practice Lab** (`ResultsView.tsx`): After the `practice_lab_attempts` insert succeeds, call `recordActivity("practice_lab")`
- **Battle Room** (`BattleRoom.tsx`): After battle results are saved, call `recordActivity("quiz")`
- **Daily Sprint** (`DailySprint.tsx` / `sprint-utils.ts`): When all daily goals are completed, call `recordActivity("sprint")`
- **Study Planner** (`CATDailyStudyPlanner.tsx`): When a day's tasks are marked complete, call `recordActivity("quiz")` (reuse "quiz" type since planner tasks are study tasks)
- **Flashcards**: Already wired — no change needed

### Step 2: Rewrite Dashboard to use `daily_streaks` as the single source of truth

Replace `computeStreaks(attempts)` in `Dashboard.tsx` with `useStreaks()` hook data. The dashboard will:
- Call `useStreaks()` to get `currentStreak`, `todayActivities`, and `loading`
- Compute `weeklyActivity` (7-day boolean array) from `daily_streaks` data
- Compute `longestStreak`, `totalQuizzes`, `avgAccuracy` by combining `daily_streaks` (for streak/activity) with `practice_lab_attempts` (for accuracy stats only)

### Step 3: Enhance `useStreaks` hook to return richer data

Extend the hook to also return:
- `weeklyActivity: boolean[]` — 7-day Mon-Sun array for the streak hero calendar
- `longestStreak: number` — computed from all `daily_streaks` history

This way `DashboardStreakHero`, `DashboardStatPills`, and `DashboardTopBar` all consume one unified source.

### Step 4: Remove the duplicate `computeStreaks` function

Delete the local `computeStreaks()` from `Dashboard.tsx` entirely. Accuracy/quiz stats will still come from `practice_lab_attempts` but streak logic will be solely from `daily_streaks`.

---

## Technical Details

**Files to modify:**
1. `src/hooks/useStreaks.ts` — Add `weeklyActivity` and `longestStreak` to return value
2. `src/pages/Dashboard.tsx` — Replace `computeStreaks` with `useStreaks()`, keep practice stats separate
3. `src/components/practice-lab/ResultsView.tsx` — Add `useStreaks().recordActivity("practice_lab")` after save
4. `src/pages/BattleRoom.tsx` — Add `recordActivity("quiz")` after battle save
5. `src/pages/DailySprint.tsx` — Add `recordActivity("sprint")` when all goals done
6. `src/pages/CATDailyStudyPlanner.tsx` — Add `recordActivity("quiz")` on task completion

**No database changes needed** — `daily_streaks` table already has the right schema and RLS policies.

**No new dependencies** — just wiring existing hook into existing completion handlers.

