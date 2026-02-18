

## Update "Book Free CAT Strategy Call" CTA on Readiness Assessment Results Page

### What Changes

The CTA button on the readiness assessment results page will be updated to follow the same lead capture and call confirmation flow used across the site (header, Free Courses page, CAT Journey section), with a custom message and an additional "Mentorship Plans" option.

### User-Facing Behavior

1. User clicks "Book Free CAT Strategy Call" on the results page
2. If the user already has a phone number stored (returning user): the lead is marked as "very_hot" via the backend function, and a confirmation popup appears
3. If the user is new: the lead capture modal opens first, then on success the confirmation popup appears
4. The confirmation popup will show:
   - Custom heading: **"You just unlocked your Free Nudge call"**
   - Three options:
     - **Call Now** — direct dial link to +91 99119 28071
     - **Mentorship Plans** — navigates to /mentorship
     - **I'll wait for the call** — closes the dialog

### Technical Details

**File: `src/pages/CATReadinessAssessment.tsx`**

1. Add imports for `useLeadModal`, `Dialog`/`DialogContent`/`DialogTitle`, and the `supabase` client
2. Inside the `ResultsSection` component:
   - Add `showCallDialog` state
   - Add `markLeadHot` helper (invokes `mark-lead-hot` edge function with source `"readiness_strategy_call"`)
   - Add `handleStrategyCall` function with the same localStorage check pattern used elsewhere
   - Replace the current `onClick={() => navigate("/masterclass")}` on the CTA button with `onClick={handleStrategyCall}`
3. Add the confirmation `Dialog` after the results section markup with:
   - Custom message: "You just unlocked your Free Nudge call"
   - "Call Now" button (tel link)
   - "Mentorship Plans" button linking to `/mentorship`
   - "I'll wait for the call" dismiss button

