

## Plan: Add Apple Sign-In Option

The Lovable Cloud integration already supports Apple as a provider (the auto-generated `lovable/index.ts` accepts `"google" | "apple"`). The work is purely UI — adding an Apple sign-in button alongside the existing Google button in all sign-in touchpoints.

### Approach

Modify `useAuth.signIn` to accept a `provider` parameter (`"google" | "apple"`) defaulting to `"google"`, then update every UI surface that shows a sign-in button to offer both options.

### Changes

**1. `src/hooks/useAuth.ts`** — Update `signIn` signature
- Add `provider?: "google" | "apple"` parameter (default `"google"`)
- Pass it to `lovable.auth.signInWithOAuth(provider, ...)` instead of hardcoded `"google"`
- Update the standalone fallback (`startDirectRedirect`) to also accept the provider
- Adjust the in-app browser warning message to be provider-agnostic

**2. `src/components/ProtectedRoute.tsx`** — Update `SignInScreen`
- Add a second "Sign in with Apple" button below the Google button
- Both call `signIn(returnUrl)` but with their respective provider
- Update the auto-trigger in `useEffect` to NOT auto-trigger any provider (show the sign-in screen with both buttons instead, so the user can choose)

**3. `src/pages/StudyBuddy.tsx`** — Add Apple button next to Google button in the unauthenticated CTA

**4. `src/pages/DailySprint.tsx`** — Add Apple button alongside Google

**5. `src/pages/AdminDashboard.tsx`** — Add Apple button (or keep Google-only for admin — your call)

**6. `src/pages/Masterclass.tsx`** — Update `GoogleSignInButton` to include Apple option

**7. `src/pages/CATDailyStudyPlanner.tsx`** — Add Apple sign-in button

**8. `src/components/DashboardCTASection.tsx`** — Update copy from "Sign in with Google" to be provider-agnostic

### UI Detail

Each sign-in surface will show two stacked buttons:
- **Sign in with Google** — existing orange/primary gradient style
- **Sign in with Apple** — black background, white text, Apple logo (using an inline SVG icon since lucide doesn't have an Apple icon)

### Technical Notes
- The `AuthState` interface `signIn` signature changes to `(redirectPath?: string, provider?: "google" | "apple") => Promise<void>`
- The `ProtectedRoute` auto-sign-in effect will be changed to show the sign-in screen with both options rather than auto-redirecting to Google, so users can choose their provider
- No database or backend changes needed — Apple users get the same `auth.users` entry and the existing `handle_new_user` trigger creates their profile

