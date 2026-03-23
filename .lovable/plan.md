

## Plan: Fix Study Buddy Pairing Visibility + Remove Duplicate Buddy UI

### Issue 1: Buddy pair not showing on your (inviter's) phone

**Root cause**: When your friend accepts your invite link, the `buddy_invites` table is updated to `status = 'accepted'`. The `BuddyInviteCard` has a Supabase Realtime listener that watches for this update. However, the `buddy_invites` table likely lacks `REPLICA IDENTITY FULL`, which means filtered Realtime subscriptions (filtering by `invite_code`) don't receive the full row payload. The update event is silently dropped, so the inviter's page never auto-refreshes.

Additionally, `getActiveBuddy()` uses `.or()` syntax which should work for both users. The pair IS being created in the database (your friend sees it), so the data is correct — it's just that the inviter's page never re-fetches.

**Fix**:
- Add a migration to set `REPLICA IDENTITY FULL` on `buddy_invites` table (required for filtered Realtime to work)
- As a safety net, also add a periodic polling fallback in `BuddyInviteCard` — every 5 seconds, call `getActiveBuddy()` to check if a pair was created while the invite is pending

**Files**: 
- New migration SQL: `ALTER TABLE public.buddy_invites REPLICA IDENTITY FULL;`
- `src/components/buddy/BuddyInviteCard.tsx` — add polling fallback

### Issue 2: Two Study Buddy sections on the Plan tab

**Root cause**: `PlanTab.tsx` renders THREE buddy-related components:
1. A hardcoded "Study Buddy" CTA card (lines 166-179)
2. `BuddyMiniWidget` (line 183)
3. `SprintBuddyView` (line 185)

This means users see a static "Find a Buddy" CTA card PLUS the `BuddyMiniWidget` which also shows buddy status — creating duplicate buddy UI.

**Fix**:
- Remove the hardcoded Study Buddy CTA card from `PlanTab.tsx`
- Keep only `BuddyMiniWidget` (which already handles both paired/unpaired states) and `SprintBuddyView`
- If the user has no buddy, `BuddyMiniWidget` returns null and `SprintBuddyView` shows its own "Find a Buddy" CTA — so one CTA is sufficient

**Files**: `src/components/dashboard/PlanTab.tsx`

