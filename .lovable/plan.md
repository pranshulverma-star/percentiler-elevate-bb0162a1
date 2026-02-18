

## Google Sign-In for Content, Phone for Calls

### Overview
Replace the name+phone lead capture modal with one-tap Google sign-in for gated content (masterclass, tools, resources). Phone number will only be collected when a user explicitly clicks a high-intent CTA like "Book Strategy Call", "Counseling Call", or "Apply for 95%ile Batch".

This reduces friction significantly -- Google sign-in is 1 tap vs filling 2-3 fields.

---

### How It Works

```text
CONTENT GATES (masterclass, tools, planner, readiness quiz):
  User clicks CTA --> Google Sign-In popup --> Logged in --> Proceed
  (Email + Name captured automatically)

CALL/APPLY CTAs (strategy call, counseling, apply for batch):
  User clicks CTA --> Phone number modal (1 field) --> Submit --> Proceed
  (If already signed in with Google, name is pre-filled)
```

---

### Database Changes

Add an `email` column to the `leads` table so we can store Google sign-in data:

- Add `email` (text, nullable) column to `leads` table
- Add a unique constraint on `email` for upsert support
- Make `phone_number` nullable (some users will only have email initially)

---

### File Changes

#### 1. Enable Google OAuth
Configure Lovable Cloud's managed Google sign-in. This generates the necessary auth integration files automatically.

#### 2. Create `src/hooks/useAuth.ts`
A lightweight hook to manage auth state:
- Listen to `onAuthStateChange` from the auth system
- Expose `user`, `signIn()`, `signOut()`, `isAuthenticated`
- On sign-in, upsert into `leads` table with email + name from Google profile
- Store email in localStorage as `percentilers_email` for quick checks

#### 3. Rewrite `src/components/LeadModalProvider.tsx`
Split into two modal types:

- **Content gate** (`openContentGate`): Triggers Google sign-in. If user is already authenticated, skips and calls `onSuccess` directly. No modal shown -- just the Google OAuth popup.
- **Phone collection** (`openPhoneModal`): Shows a minimal modal with just a phone number field (name pre-filled from Google profile if available). Used only for strategy call / counseling / apply CTAs.

The context interface becomes:
```text
openContentGate(source: string, onSuccess?: () => void)
openPhoneModal(source: string, onSuccess?: () => void)
```

#### 4. Update all content-gated callers to use `openContentGate`
These files currently call `openModal(source, callback)` for content access:
- `src/components/HeroSection.tsx` -- "Watch Free Masterclass" button
- `src/components/WebinarSection.tsx` -- masterclass CTA
- `src/components/FinalCTASection.tsx` -- "Watch Free Masterclass" button
- `src/components/ScrollCTAPanel.tsx` -- "Watch Free Masterclass" and "Generate Free Study Plan"
- `src/components/PreparationPathSection.tsx` -- masterclass, readiness, evaluate CTAs

Change: `openModal("source", cb)` --> `openContentGate("source", cb)`

#### 5. Update all call/apply CTAs to use `openPhoneModal`
These currently call `openModal` for phone collection before strategy calls:
- `src/components/Navbar.tsx` -- "Book Free Strategy Call"
- `src/components/FinalCTASection.tsx` -- "Book Free Strategy Call"
- `src/components/PreparationPathSection.tsx` -- "Counseling Call"
- `src/pages/FreeCourses.tsx` -- strategy call
- `src/pages/CATOMETCourses.tsx` -- "Book Free Counseling Call"
- `src/pages/CATReadinessAssessment.tsx` -- strategy call

Change: `openModal("source", cb)` --> `openPhoneModal("source", cb)`

#### 6. Update `src/pages/Masterclass.tsx`
- Replace the name+phone registration form with a "Sign in with Google" button
- On successful sign-in, upsert lead with email+name, then redirect to `/masterclass/watch`
- The redirect check changes from `localStorage.getItem("percentilers_phone")` to checking auth state (is user signed in?)

#### 7. Update `src/pages/MasterclassWatch.tsx`
- Gate changes from phone-based to auth-based (check if user is signed in via Google)
- The "Apply for 95%ile Batch" CTA triggers `openPhoneModal` to collect phone before marking lead hot
- Remove phone-based cookie fallback logic (no longer needed -- auth session persists natively)

#### 8. Update `src/pages/CATReadinessAssessment.tsx`
- The quiz submission form and results gate overlay: replace name+phone fields with Google sign-in button
- Results gate: check auth state instead of `localStorage.getItem("percentilers_phone")`

#### 9. Update `src/components/PercentilePlannerModal.tsx`
- Results gate: check auth state instead of phone in localStorage
- If not signed in, show Google sign-in button instead of phone form

#### 10. Update `src/pages/CATDailyStudyPlanner.tsx`
- Check auth state for identity instead of phone number
- Phone-based planner data association will need email-based lookup

---

### Technical Details

**Auth approach:**
- Uses Lovable Cloud's managed Google OAuth (no API keys needed)
- `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Auth session persists across browser restarts natively (no localStorage/cookie workarounds needed)
- Solves the Safari ITP issue permanently since auth tokens are managed by the auth system, not localStorage

**Lead identification transition:**
- New leads: identified by email (from Google) + phone added later
- Existing leads (already have phone): remain accessible. The system checks both email and phone
- `leads` table upsert on email for Google sign-ins, upsert on phone for call CTAs
- When a signed-in user provides their phone, the lead record is updated to link email + phone

**Phone modal (for calls only):**
- Single field: phone number (10 digits)
- Name auto-filled from Google profile (read-only display)
- Much less friction than current 3-field form

