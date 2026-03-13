

## Problem

When the app is installed as a PWA (standalone mode), Google Sign-In fails with **"Authorization failed — State verification failed"**. This happens because standalone PWA windows cannot maintain OAuth state cookies across the redirect to `oauth.lovable.app` and back — the session context is lost mid-flow, causing the state mismatch.

Additionally, the Google sign-in prompt doesn't show the account picker (pre-select existing ID), making it harder for users.

## Plan

### 1. Fix OAuth in standalone PWA mode

In `src/hooks/useAuth.ts`, detect standalone mode and open the sign-in URL in the system browser instead of navigating within the PWA window. The system browser has full cookie support and will complete OAuth correctly, then redirect back to the app.

```text
signIn() flow:
  ├─ In-app browser? → alert + bail (existing)
  ├─ Standalone PWA? → window.open(currentUrl, "_blank")
  │   Opens system browser which handles OAuth normally
  └─ Normal browser? → lovable.auth.signInWithOAuth (existing)
```

When in standalone mode, we'll use `window.open()` with `_blank` to break out of the PWA shell into the real browser, where OAuth state is preserved. The redirect URI will bring the user back to the site, and the PWA can be re-opened from there.

### 2. Force account picker

Add `prompt: "select_account"` to the `extraParams` in the Google OAuth call so users always see their existing accounts instead of having to type credentials manually.

### Files to change

- **`src/hooks/useAuth.ts`** — Add standalone detection + `prompt: "select_account"` extra param

