

# Back-to-Dashboard Navigation for Logged-in Mobile Users

## Problem
When a logged-in user navigates to sub-pages (flashcards, practice lab, study buddy, etc.) and swipes back on mobile, they go through their full browser history instead of returning to the dashboard.

## Approach
Use `history.replaceState` on the Dashboard page to clear the back-stack, so any back gesture from the dashboard goes to `/` (homepage). Then, on all sub-pages accessed from the dashboard, use `navigate("/dashboard")` on back instead of `history.back()`. The key mechanism:

1. **Dashboard replaces history entry** — When Dashboard mounts for an authenticated user, call `window.history.replaceState(null, "", "/dashboard")` to make the dashboard the history root. This means the hardware back button from the dashboard goes to the browser's start (effectively nowhere useful, which is correct).

2. **Sub-pages navigate to /dashboard on back** — Create a small `useBackToDashboard` hook that listens for the `popstate` event. When a logged-in user triggers a back gesture from any protected/dashboard-linked page, it intercepts and redirects to `/dashboard` using `navigate("/dashboard", { replace: true })`.

## Technical Details

**New file**: `src/hooks/useBackToDashboard.ts`
- Custom hook that pushes a sentinel history entry on mount
- Listens for `popstate` — when the sentinel is popped, navigates to `/dashboard`
- Only activates when user is authenticated (checks `useAuth`)
- Cleans up listener on unmount

**Modified file**: `src/pages/Dashboard.tsx`
- On mount (when authenticated), push a duplicate history entry so the first back gesture stays on dashboard
- Call `useBackToDashboard()` hook

**Modified files** (sub-pages that are dashboard-linked):
- `src/pages/Flashcards.tsx`
- `src/pages/PracticeLab.tsx`  
- `src/pages/StudyBuddy.tsx`
- `src/pages/DailySprint.tsx`
- `src/pages/BattleRoom.tsx`
- Each calls `useBackToDashboard()` so back gesture → dashboard

This approach uses the standard `popstate` + sentinel pattern — no library needed, works with iOS swipe-back and Android hardware back button.

