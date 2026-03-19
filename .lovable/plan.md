

## Study Buddy — Accountability Partner Feature

### Existing Table Mapping (from codebase analysis)
The user-referenced tables map to these actual tables:
- `planner_entries` → `planner_entries` (exists, daily planner goals)
- `planner_activity` → `planner_activity` (exists, tracks daily subject completions; **note: `phone_number` column stores the user's email, not phone**)
- `practice_lab_attempts` → `practice_lab_attempts` (exists, quiz/topic test data, keyed by `user_id` UUID)
- `tracker_entries` / `mock_test_attempts` → **do not exist**

Phone identifier pattern: `localStorage.getItem("percentilers_phone")` is the standard across the app. Auth uses Google OAuth via `useAuth()` hook + `useLeadPhone()` for phone state.

### Important Design Decision
The planner uses **email** (stored in `phone_number` column of `planner_activity`) while practice lab uses **user_id** (UUID). The buddy system will use `user_id` as the primary key for buddy pairs (since users are authenticated via Google OAuth), with phone used only for the invite/pairing flow and display.

---

### Step 1: Database Migration (3 new tables)

**buddy_invites** — stores generated invite codes
- `id`, `invite_code` (8-char unique), `inviter_id` (uuid, references auth.users), `inviter_name`, `status` (pending/accepted/expired), `created_at`, `expires_at`

**buddy_pairs** — active partnerships
- `id`, `student_a_id` (uuid), `student_a_name`, `student_b_id` (uuid), `student_b_name`, `status` (active/dissolved), `created_at`, `dissolved_at`, `invite_id` (references buddy_invites)

**buddy_activity_log** — daily snapshot of both buddies' progress
- `id`, `pair_id` (references buddy_pairs), `user_id` (uuid), `activity_date`, `planner_completed` (bool), `quiz_attempted` (bool), `streak_count`, `bonus_earned` (bool), `created_at`
- Unique constraint on `(pair_id, user_id, activity_date)`

RLS policies: All tables require authentication. Users can only read/write rows where their `auth.uid()` matches `inviter_id`, `student_a_id`, `student_b_id`, or `user_id` respectively. Uses validation triggers instead of CHECK constraints for status/expiry.

Indexes on invite_code, inviter_id, student_a_id, student_b_id, pair_id+activity_date.

### Step 2: Utility Module — `src/lib/buddy-utils.ts`
- `generateInviteCode()` — 8-char alphanumeric (no ambiguous chars)
- `getActiveBuddy(userId)` — query buddy_pairs where user is student_a or student_b and status=active
- `createInvite(userId, name)` — insert into buddy_invites, return code
- `acceptInvite(code, userId, name)` — validate invite, create buddy_pair, mark invite accepted
- `dissolvePair(pairId, userId)` — set status=dissolved
- `getBuddyProgress(pairId, date)` — fetch buddy_activity_log for both users
- `syncDailyActivity(pairId, userId)` — read from `planner_activity` (by email) and `practice_lab_attempts` (by user_id) for today, upsert into buddy_activity_log
- `calculateBuddyStreak(pairId)` — count consecutive days where both users have activity

### Step 3: New Page — `src/pages/StudyBuddy.tsx`
Four conditional states based on auth + buddy status:

**State 1 (Not logged in):** Hero section with feature explanation, 3 benefit cards, Google sign-in CTA (uses existing `useAuth().signIn()`)

**State 2 (Logged in, no buddy):** Invite generation card with WhatsApp share + copy link buttons. "Have a code?" input. Waiting animation if invite is pending.

**State 3 (Logged in, buddy paired):** Split-view progress dashboard showing both users' daily stats (planner goals, quiz attempts, streaks, bonus). Nudge button + dissolve link. Soft course CTA at bottom.

**State 4 (Arriving via `?invite=CODE`):** Auto-accept if logged in; prompt sign-in if not. Error handling for expired/invalid codes.

### Step 4: Components
- `src/components/buddy/BuddyProgressCard.tsx` — the split-view card (side-by-side desktop, stacked mobile)
- `src/components/buddy/BuddyInviteCard.tsx` — invite generation, sharing, code input
- `src/components/buddy/BuddyNudgeButton.tsx` — sends nudge (MVP: toast only, logs to activity)
- `src/components/buddy/BuddyMiniWidget.tsx` — small card showing buddy's status, embeddable on planner/practice-lab pages

### Step 5: Route + Navigation
- Add `/study-buddy` route in `src/App.tsx` (lazy loaded)
- Add "Study Buddy" link to `navLinks` array in `src/components/Navbar.tsx`

### Step 6: Embed Mini Widget
- Add `<BuddyMiniWidget />` to top of `CATDailyStudyPlanner.tsx` (shows only if user has active buddy)
- Add `<BuddyMiniWidget />` to `PracticeLab.tsx` sections/chapters phase (shows only if user has active buddy)
- Widget reads buddy's planner_activity and practice_lab_attempts for today

### Step 7: Nudge + Dissolve
- Nudge: toast confirmation + log entry in buddy_activity_log (future: n8n webhook)
- Dissolve: confirmation dialog → sets buddy_pairs.status='dissolved', dissolved_at=now()
- Self-invite prevention, one-active-buddy-at-a-time enforcement

### Design
- White bg, #141414 text, #FF6600 orange accents
- DM Sans font, shadcn/ui components throughout
- Mobile-first responsive, subtle fade-in animations
- Progress card uses green for completed, muted gray for pending, subtle red for missed

### Files Created
- `src/pages/StudyBuddy.tsx`
- `src/components/buddy/BuddyProgressCard.tsx`
- `src/components/buddy/BuddyInviteCard.tsx`
- `src/components/buddy/BuddyNudgeButton.tsx`
- `src/components/buddy/BuddyMiniWidget.tsx`
- `src/lib/buddy-utils.ts`
- DB migration for 3 tables + RLS + indexes

### Files Modified
- `src/App.tsx` — add route
- `src/components/Navbar.tsx` — add nav link
- `src/pages/CATDailyStudyPlanner.tsx` — embed mini widget
- `src/pages/PracticeLab.tsx` — embed mini widget

### No Changes To
- Existing Supabase tables (planner_entries, planner_activity, practice_lab_attempts, leads, etc.)
- Auth/session handling
- Existing page layouts beyond adding the mini widget

