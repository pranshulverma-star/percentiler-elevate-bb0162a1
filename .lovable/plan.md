

## Plan: Today's Battle Card + Daily Leaderboard

### What we're building

1. **"Today's Battle" card** on the Practice Lab sections page — a prominent card that randomly picks a section and generates a quiz with section-specific rules.
2. **Rename "Arena Leaderboard"** to **"Daily Leaderboard"** on the Practice Lab page.
3. **"Today's Battle" card** on the User Dashboard page.

### Quiz generation rules for Today's Battle

| Section | Questions | Time |
|---------|-----------|------|
| QA | 10 random Qs, mixed topics | 15 min |
| LRDI | 1 set from any topic | 12 min |
| VARC | 1 RC passage + 1 PJ/OSO question (from Para Jumbles chapter) | 15 min |

For VARC: combine questions from the RC chapter (1 full set via `pickOneSet`) plus 1 random PJ/OSO question from the Para Jumbles chapter. Total time 15 min.

### Changes

**1. `src/pages/PracticeLab.tsx`**
- Add a `generateTodaysBattle()` function that:
  - Uses today's date as a seed to deterministically pick the same section for all users on a given day
  - QA: picks 10 mixed-topic questions across all QA chapters using `pickGroupedRandom`
  - LRDI: picks 1 set using `pickOneSet` from the LRDI chapter
  - VARC: picks 1 RC set via `pickOneSet` from RC chapter + 1 random PJ question from Para Jumbles chapter
  - Returns `{ section, chapter (virtual), questions, duration }`
- Add a **"Today's Battle"** card in `SectionsView` above the section grid — styled with a gradient border and a daily challenge theme
- Clicking it triggers the quiz directly (same auth/phone gate flow)
- Rename leaderboard heading from "Arena Leaderboard" to "Daily Leaderboard"

**2. `src/components/dashboard/DashboardTodaysBattle.tsx`** (new file)
- A compact card with a "Today's Battle" theme, showing the section picked for today
- "Start Battle" button links to `/practice-lab` with a query param `?daily=true`

**3. `src/pages/Dashboard.tsx`**
- Import and render `DashboardTodaysBattle` as a new stage between "Today's Mission" and "Progress"

### Technical details

- The daily section selection uses `new Date().toDateString()` hashed to pick a consistent section per day
- The virtual chapter created for "Today's Battle" has slug `"todays-battle"` and a combined name like "Today's Battle — VARC"
- For results saving, `section_id` and `chapter_slug` will use the actual section and `"todays-battle"` slug
- VARC special case: merges RC set questions + 1 PJ question into a single quiz array

