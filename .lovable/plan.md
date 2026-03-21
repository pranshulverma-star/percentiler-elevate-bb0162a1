

## Plan: Show Study Buddy Landing Page for All Users First

### Problem
Currently, authenticated users without a buddy pair skip the new premium landing page and go straight to the bare `BuddyInviteCard`. The rich landing experience we just built is only visible to logged-out users.

### Solution
Restructure `StudyBuddy.tsx` so that **all users** (authenticated or not) see the `StudyBuddyLanding` page first. The invite/pair flow becomes a secondary step.

### Changes to `src/pages/StudyBuddy.tsx`

1. **Authenticated users without a pair** — show `StudyBuddyLanding` instead of jumping to `BuddyInviteCard`. The CTA button text changes to "Find Your Study Buddy" (instead of "Sign Up Free") and clicking it scrolls down or opens the invite card inline below the landing sections.

2. **Authenticated users with an active pair** — continue showing `DashboardState` as today (no change).

3. **Invite param flow** — remains unchanged (auto-accept logic).

4. **Unauthenticated users** — see the same landing with "Sign Up Free" CTA (no change).

### Implementation Detail

In the render logic of `StudyBuddy.tsx`:
- When authenticated + no pair + no invite param → render `<StudyBuddyLanding>` with a `<BuddyInviteCard>` appended below the Final CTA section
- Pass a different CTA label/callback to `StudyBuddyLanding` for authenticated users: button says "Get Your Invite Link" and smooth-scrolls to the invite card section below
- Add an `id="invite-section"` anchor div wrapping `BuddyInviteCard` at the bottom of the landing

### Files to edit
1. `src/pages/StudyBuddy.tsx` — adjust render conditions to show landing + invite card for authed users without a pair
2. `src/components/buddy/StudyBuddyLanding.tsx` — accept optional props for custom CTA label and an optional `children` slot or `renderBottom` for the invite card section

