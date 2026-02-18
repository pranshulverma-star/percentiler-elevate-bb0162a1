

## Fix: Masterclass Pages Not Recognizing Users from Daily Planner

### Problem

The Profile Evaluator checks both `percentilers_phone` AND `planner_phone` in localStorage, so it recognizes returning users from either tool. However, the Masterclass pages only check `percentilers_phone`:

- `MasterclassWatch.tsx` (line 29): `localStorage.getItem("percentilers_phone")` -- if null, redirects to `/masterclass`
- `Masterclass.tsx` (line 131): Same check -- if null, shows the registration form instead of auto-redirecting

So a user who registered via the Daily Study Planner (stored as `planner_phone`) gets recognized by the Profile Evaluator but then gets asked for their details again on the Masterclass page.

### Fix

Update both Masterclass files to check for `planner_phone` as a fallback, matching the pattern used everywhere else in the codebase.

### Technical Details

**File: `src/pages/MasterclassWatch.tsx` (line 29)**
- Change: `const phone = localStorage.getItem("percentilers_phone");`
- To: `const phone = localStorage.getItem("percentilers_phone") || localStorage.getItem("planner_phone");`

**File: `src/pages/Masterclass.tsx` (line 131)**
- Change: `const phone = localStorage.getItem("percentilers_phone");`
- To: `const phone = localStorage.getItem("percentilers_phone") || localStorage.getItem("planner_phone");`

This is a two-line fix that aligns these pages with the rest of the codebase's lead recognition pattern.

