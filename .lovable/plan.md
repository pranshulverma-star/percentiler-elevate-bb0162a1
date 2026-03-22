

## Diagnosis: Sign-In Stuck on Dashboard

### Root Causes

1. **`signInInProgressRef` guard blocks retries silently.** When `signIn()` is called, it sets `signInInProgressRef.current = true`. If the OAuth popup/redirect fails silently (e.g., popup blocked, user cancels, network glitch), the ref may not get cleared in all code paths. Subsequent button clicks are silently ignored (line 131-133 returns immediately with no user feedback).

2. **Unhandled promise rejection in `handleSignIn`.** In `ProtectedRoute`, `handleSignIn` calls `await signIn(...)` which can throw (line 202). The `handleSignIn` function has no `catch` block — only a `finally`. The thrown error becomes an unhandled rejection, potentially leaving the UI in an inconsistent state.

3. **`finally` block resets `signingIn` immediately after redirect starts.** When `signIn()` initiates a redirect via `window.location.assign()`, the promise resolves, `finally` runs and resets `signingIn` to `false`. For a brief window before navigation completes, the sign-in screen re-appears, making it look "stuck."

### Fix

**File 1: `src/hooks/useAuth.ts`**
- Wrap the entire `signIn` function body in a try/finally that always clears `signInInProgressRef` — prevents the ref from permanently blocking future sign-in attempts
- Add a timeout safety net: if `signInInProgressRef` has been true for >30s, automatically reset it

**File 2: `src/components/ProtectedRoute.tsx`**
- Add a `catch` block in `handleSignIn` to gracefully handle errors (show a toast or reset state cleanly) instead of letting them become unhandled rejections
- After calling `signIn()` for a redirect flow, keep `signingIn = true` briefly (don't immediately reset in `finally`) to avoid the flash of sign-in screen before navigation
- Reset `signInInProgressRef` guard check: at mount time, if the ref has been active too long (stale from a previous failed attempt), clear it so buttons work again

**File 3: `src/components/AuthButtons.tsx`** (minor)
- No changes needed, component is correct

### Summary of Changes
- Make `signIn` more resilient by ensuring `signInInProgressRef` is always cleared on any exit path
- Add proper error handling in `handleSignIn` so failures don't silently brick the buttons
- Add a staleness check so that if a previous sign-in attempt left the guard active, it auto-clears on next render

