

## Problem Analysis

I identified **4 distinct issues** with the buddy system:

### Issue 1: Inviter stuck on "Waiting for buddy to join"
The `BuddyInviteCard` shows a spinner and "Waiting for your buddy to join…" but has **no realtime subscription**. When the buddy accepts the invite and the pair is created, the inviter's page never knows. They must manually refresh.

### Issue 2: Sprint goals not visible to buddy
The RLS policy on `daily_sprint_goals` correctly allows buddies to read each other's goals. However, the `/study-buddy` dashboard (`DashboardState`) only shows **planner activity and quiz data** from `buddy_activity_log` — it does **not** display sprint goals at all. The buddy's sprint goals are only visible on `/daily-sprint` via `SprintBuddyView`, but there's no link or navigation to get there from the buddy dashboard.

### Issue 3: No cross-navigation between Study Buddy and Daily Sprint
After pairing, neither page links to the other in a prominent way. The buddy has no way to discover that sprint goals exist on `/daily-sprint`.

### Issue 4: Realtime toast depends on buddy resolution that may not exist yet
In `DailySprint.tsx`, the buddy resolution happens in a useEffect but a freshly paired user who navigates to `/daily-sprint` may hit a race where the pair isn't loaded yet.

---

## Plan

### Step 1: Add realtime listener for invite acceptance
In `BuddyInviteCard`, subscribe to Supabase Realtime on `buddy_invites` table filtered by the inviter's invite code. When the status changes to `accepted`, automatically call `onPaired()` to reload the page into the paired dashboard state. This eliminates the need for manual refresh.

### Step 2: Add Sprint Goals section to Study Buddy dashboard
In `DashboardState` (inside `StudyBuddy.tsx`), add a section below the existing progress card that shows:
- The buddy's today's sprint goals (using `getBuddyGoals` from sprint-utils)
- A prominent link to `/daily-sprint` ("Go to Daily Sprint")

This way the buddy can immediately see the inviter's tasks right from the buddy dashboard.

### Step 3: Add link from Daily Sprint buddy section to Study Buddy page
In `SprintBuddyView`, add a small "View full buddy dashboard" link to `/study-buddy` for easy cross-navigation.

### Step 4: Enable realtime on buddy_invites table
Create a migration to add `buddy_invites` to `supabase_realtime` publication so the realtime subscription works.

---

### Technical Details

**Files to modify:**
- `src/components/buddy/BuddyInviteCard.tsx` — Add `useEffect` with Supabase realtime channel on `buddy_invites` for `UPDATE` events where `invite_code` matches, triggering `onPaired()` when status becomes `accepted`
- `src/pages/StudyBuddy.tsx` — In `DashboardState`, fetch buddy's sprint goals via `getBuddyGoals(buddyId)` and render them with `SprintGoalList` (read-only). Add a "Go to Daily Sprint" button.
- `src/components/sprint/SprintBuddyView.tsx` — Add a small link to `/study-buddy`
- New migration — `ALTER PUBLICATION supabase_realtime ADD TABLE public.buddy_invites;`

