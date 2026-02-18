

## Two Issues to Fix

### Issue 1: Lead Form Still Appearing for Returning Users

**Root cause:** Safari on iOS aggressively manages localStorage. When you close Safari or haven't visited the site in a while, localStorage data can be cleared (Intelligent Tracking Prevention). Since the entire "returning user" logic depends on localStorage alone, returning visitors lose their identity.

**Fix:** Add a cookie-based fallback alongside localStorage. Cookies with an explicit expiry (e.g., 365 days) survive Safari's ITP cleanup, unlike localStorage which can be purged after ~7 days of inactivity.

Changes in `src/pages/Masterclass.tsx`:
- On form submit, set a cookie `percentilers_phone` (365-day expiry) in addition to localStorage
- On page load, check both localStorage AND the cookie; if the cookie has the phone but localStorage doesn't, restore localStorage from the cookie before the redirect check

Changes in `src/components/LeadModalProvider.tsx`:
- In `openModal`, also check the cookie as a fallback if localStorage is empty
- If the cookie has a valid phone, restore localStorage and proceed without showing the modal

Create a small utility (`src/lib/cookieUtils.ts`):
- `setCookie(name, value, days)` and `getCookie(name)` helper functions

Changes in `src/pages/MasterclassWatch.tsx`:
- Also set the cookie when phone is read, ensuring consistency

---

### Issue 2: Video Not Playing on Safari iOS

**Root cause:** Safari iOS requires specific conditions for HTML5 video playback:
1. The video must be encoded with H.264 (baseline profile) + AAC audio -- this is a server-side/encoding concern we cannot fix in code, but the current MP4 likely meets this.
2. The server must support HTTP Range Requests (byte-range serving). CloudFront supports this by default, so this should be fine.
3. Safari iOS often shows a blank/frozen player if `preload="metadata"` fails silently or if the video element isn't set up optimally.

**Fix:** Multiple Safari-specific improvements to the video player:

Changes in `src/pages/MasterclassWatch.tsx`:
- Change `preload="metadata"` to `preload="auto"` -- Safari iOS handles `metadata` poorly in some cases and doesn't show the play button or first frame.
- Add a `poster` attribute with a fallback image (or a data URI of a play-button graphic) so Safari shows something instead of a black box.
- Add `x-webkit-airplay="allow"` attribute for better Safari compatibility.
- Add an explicit error handler (`onError`) on the video element to detect and surface playback failures to the user, with a fallback message like "Tap to play" or "If video doesn't load, try refreshing."
- Add a manual "Tap to Play" overlay button that calls `videoRef.current.play()` on tap -- this ensures the user-gesture requirement is met on iOS Safari, since some iOS versions require a direct user tap on a play control.

---

### Technical Details

**Cookie utility (new file):**
```text
src/lib/cookieUtils.ts
  - setCookie(name: string, value: string, days: number)
  - getCookie(name: string): string | null
```

**Files modified:**
1. `src/lib/cookieUtils.ts` -- NEW, ~15 lines
2. `src/pages/Masterclass.tsx` -- Add cookie set on submit + cookie check on load (~5 lines)
3. `src/components/LeadModalProvider.tsx` -- Add cookie fallback in openModal (~5 lines)
4. `src/pages/MasterclassWatch.tsx` -- Video player Safari fixes (preload, poster, tap-to-play overlay, error handling) (~25 lines)

