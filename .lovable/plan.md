

## Problem: Auth Login Loop After Cache Clear

### Root Cause

The auth logs confirm 6+ logins within 2 minutes for the same user — a clear redirect loop. Here's what happens:

1. User clears cache → visits `/dashboard`
2. `AuthProvider.getSession()` returns null → `loading=false`, `isAuthenticated=false`
3. `ProtectedRoute` sees unauthenticated → immediately fires `signIn()` (or shows sign-in button in PWA)
4. OAuth completes successfully (auth logs confirm status 200)
5. User is redirected back to `/dashboard`
6. **But**: The `signInTriggered` ref resets on page reload. Supabase may still be processing the callback hash/tokens when ProtectedRoute evaluates. So it fires `signIn()` again → loop

The core issue: **ProtectedRoute doesn't know it just returned from an OAuth redirect**, and there's no cooldown between sign-in attempts across page reloads.

### Fix: 3 Changes

#### 1. Add OAuth-return detection in AuthProvider

Before triggering any sign-in, check if the URL contains Supabase auth callback tokens (`access_token`, `refresh_token`, or `code` in hash/query). If so, wait for `onAuthStateChange` to process them instead of immediately declaring "unauthenticated."

#### 2. Add sign-in cooldown via sessionStorage in ProtectedRoute

When `signIn()` is called, write `sessionStorage.setItem("auth_signin_at", Date.now())`. On next mount, if less than 10 seconds have passed, don't auto-trigger sign-in — show a "Sign in" button instead. This breaks the auto-redirect loop while still allowing manual retry.

#### 3. Detect OAuth callback hash in AuthProvider and delay resolution

If `window.location.hash` contains `access_token` or the URL has a `code` param (PKCE flow), set a flag so `getSession()` null result doesn't immediately resolve loading=false. Instead, wait for `onAuthStateChange` to fire (which processes the tokens), with a 5s safety timeout.

### Files to Modify

1. **`src/hooks/useAuth.ts`** — Add OAuth callback detection. If hash contains auth tokens, don't resolve loading until `onAuthStateChange` fires or 5s timeout.

2. **`src/components/ProtectedRoute.tsx`** — Add sessionStorage-based cooldown. If a sign-in was triggered within the last 10 seconds, show a manual sign-in button instead of auto-redirecting. Remove the auto-redirect for non-standalone too (always show button if just returned from OAuth).

### Technical Details

**AuthProvider change:**
```typescript
// Detect if we're returning from an OAuth callback
const hash = window.location.hash;
const isOAuthCallback = hash.includes("access_token") || 
  hash.includes("refresh_token") || 
  new URLSearchParams(window.location.search).has("code");

// If OAuth callback, don't resolve from getSession() alone — 
// wait for onAuthStateChange which processes the tokens
if (isOAuthCallback && !session) {
  // Don't resolve yet, let onAuthStateChange handle it
  return;
}
```

**ProtectedRoute change:**
```typescript
const recentSignIn = sessionStorage.getItem("auth_signin_at");
const isRecentSignIn = recentSignIn && (Date.now() - Number(recentSignIn)) < 10000;

// Don't auto-trigger if we just attempted sign-in (breaks loop)
if (!authLoading && !isAuthenticated && !isRecentSignIn && !isStandalone) {
  sessionStorage.setItem("auth_signin_at", String(Date.now()));
  signInTriggered.current = true;
  void signIn(returnUrl);
}

// If recent sign-in failed, show manual button instead of auto-redirect
if (!isAuthenticated && isRecentSignIn) {
  return <ManualSignInButton />;
}
```

No database changes needed. No new dependencies.

