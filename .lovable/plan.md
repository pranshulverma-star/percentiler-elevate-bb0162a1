

## Optimize App Navigation Speed — Lazy-Load Question Data

### Problem
A ~500KB+ JSON question bank is eagerly imported on every route (including Dashboard) due to a shared import chain. This blocks rendering even when no questions are needed.

### Key Clarification
Dynamic imports load the question data **once when the user clicks "Start Quiz"**. After that, all questions are in memory — zero delay between questions.

### Changes

**1. New file: `src/lib/todaySectionIndex.ts`**
- Extract `getTodaysSectionIndex()`, `todayLocal()`, and `hashString()` from `todaysBattle.ts` into this tiny standalone module (pure date math, zero dependencies on question data).

**2. `src/components/dashboard/DashboardTodaysBattle.tsx`**
- Import `getTodaysSectionIndex` from the new lightweight module instead of `todaysBattle.ts`.

**3. `src/lib/todaysBattle.ts`**
- Make `generateTodaysBattle()` async — dynamically import `practiceLabQuestions` and `pickGroupedQuestions` inside the function body.
- Remove top-level imports of question data.

**4. `src/pages/PracticeLab.tsx`**
- Replace top-level `import { practiceLabSections }` with a dynamic import triggered when user selects a section/starts a quiz.
- Use static section metadata (id, name, icon) for the initial section listing UI — no question data needed.

**5. `src/components/practice-lab/ResultsView.tsx`**
- Pass section name as a prop from the parent instead of importing the full question bank just for a name lookup, OR use a dynamic import.

### User Experience
- **Dashboard**: Loads instantly — no question data downloaded.
- **Practice Lab landing**: Section cards appear immediately — questions load on "Start" click (~200ms on 4G).
- **During quiz**: Zero impact — all questions already in memory after initial load.
- **Between questions**: No change — instant as before.

