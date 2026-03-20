
Goal: stop the Android login loop (Gmail account picker repeating) and make sign-in complete reliably inside the installed app.

1) Fix OAuth callback route handling (highest priority)
- Update `public/_redirects` to explicitly allow OAuth callback paths before the catch-all redirect:
  - `"/~oauth  /index.html 200"`
  - `"/~oauth/*  /index.html 200"`
- Add explicit route(s) in `src/App.tsx` for `"/~oauth"` (and `"/~oauth/*"` if needed) to render a neutral loading screen instead of falling into `*`.
- Update `src/components/NotFoundRedirect.tsx` so it does NOT redirect `"/~oauth"` (or other auth-system paths) to `old.percentilers.in`.

Why: right now unknown paths go to legacy redirect logic, which can break callback completion and restart auth.

2) Harden auth flow against redirect loops
- In `src/hooks/useAuth.ts`:
  - Add a single-flight guard (`signInInProgressRef`) so multiple `signIn()` calls cannot stack.
  - Persist an auth-attempt marker in `sessionStorage` (`auth_flow_started_at`, `auth_target`) before redirect.
  - On successful `SIGNED_IN`, clear those markers.
  - During OAuth callback detection, keep auth in loading state longer (mobile-safe timeout) before declaring failure.
- Replace current 10s retry window with a longer guarded window (e.g. 45–60s) to avoid immediate re-trigger loops on slower Android callback cycles.

3) Improve protected-route behavior during callback window
- In `src/components/ProtectedRoute.tsx`:
  - If OAuth callback is in progress (URL callback params/hash or recent auth marker), do NOT trigger another `signIn`.
  - Show “Completing sign-in…” state instead of firing redirect again.
  - Only show manual “Sign in again” CTA after callback window expires.

4) Align sign-in strategy for installed mobile app
- Keep one consistent OAuth path in `useAuth.signIn` and avoid fallback paths that can re-open Google unnecessarily while callback is still settling.
- Expand standalone/app-context detection to include Android installed-app context signals (not just iOS `navigator.standalone`).

5) Validate end-to-end (must pass before closing)
- Test matrix:
  - Android installed app: `/dashboard`, `/flashcards`, `/study-buddy` entry points.
  - Mobile browser (non-installed).
  - Desktop browser.
- Expected:
  - One account selection → one successful session.
  - No repeated Gmail chooser loop.
  - Protected route lands on intended target page after login.
- Confirm in auth logs that one login attempt maps to one successful completion (no rapid repeated token cycles).

Technical details (implementation targets)
- Files to modify:
  - `public/_redirects`
  - `src/App.tsx`
  - `src/components/NotFoundRedirect.tsx`
  - `src/hooks/useAuth.ts`
  - `src/components/ProtectedRoute.tsx`
- Key state guards:
  - `signInInProgressRef` (in-memory)
  - `auth_flow_started_at` / `auth_target` (sessionStorage)
  - `isOAuthCallback` + “callback grace period” gate in `ProtectedRoute`
- Non-goals:
  - No backend schema/policy changes required.
