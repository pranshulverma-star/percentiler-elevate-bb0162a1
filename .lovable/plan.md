

## Plan: Fix Leaderboard Gap & Show 5 Entries

### Problem
1. The leaderboard only fetches top 3 users (line 94: `Math.min(3, sorted.length)`), creating empty space
2. The container uses `flex-col justify-center` which vertically centers the few rows, causing the visible gap in the screenshot
3. No "See more" expandable option exists

### Changes — `src/components/dashboard/HomeTab.tsx`

**1. Show top 5 instead of top 3**
- Change the loop from `Math.min(3, sorted.length)` to `Math.min(5, sorted.length)` 
- Update the "add current user if not in top" check from `myIdx >= 3` to `myIdx >= 5`

**2. Remove vertical centering gap**
- Change the rows container from `flex-1 flex flex-col justify-center` to just a plain `div` so rows stack from the top without centering

**3. Add "See Full Leaderboard" expandable**
- Default: show top 5 + your rank row
- Add a "See more" toggle button at the bottom (like in `DashboardLeaderboardCompact.tsx`) that expands to show all ranked users
- Fetch top 10 from sorted data, show 5 by default, expand to 10 on click

**4. Remove flex-1 from leaderboard container**
- The leaderboard card currently stretches to fill all remaining space (`flex-1 min-h-0`), causing the gap. Remove `flex-1 min-h-0` so it only takes the height it needs.

