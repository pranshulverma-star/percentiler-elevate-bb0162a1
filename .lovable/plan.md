

## Implementation Plan

### Overview
Two fixes: (1) Cookie-based fallback so Safari iOS users aren't asked to register again, and (2) Safari-specific video player improvements so the masterclass video actually plays.

---

### 1. New file: `src/lib/cookieUtils.ts`
Create a small utility with two functions:
- `setCookie(name, value, days)` -- sets a cookie with a given expiry
- `getCookie(name)` -- reads a cookie by name

About 15 lines total.

---

### 2. Update `src/pages/Masterclass.tsx`
- Import `setCookie` and `getCookie` from the new utility
- In the redirect `useEffect` (line 131-134): also check `getCookie("percentilers_phone")` as a fallback. If the cookie has a valid phone but localStorage doesn't, restore localStorage from the cookie before redirecting
- In `handleSubmit` (line 76-77): after setting localStorage, also call `setCookie("percentilers_phone", phone, 365)` and `setCookie("percentilers_name", name, 365)`

---

### 3. Update `src/components/LeadModalProvider.tsx`
- Import `getCookie` and `setCookie`
- In `openModal` (around line 42): if `storedPhone` from localStorage is empty, check `getCookie("percentilers_phone")` as fallback. If found, restore it to localStorage and use it
- Same for `storedName` with `getCookie("percentilers_name")`
- In `handleSubmit` (around line 95): after setting localStorage, also set cookies with 365-day expiry

---

### 4. Update `src/pages/MasterclassWatch.tsx`
**Cookie fallback:**
- Import `getCookie` and `setCookie`
- At the top of the component (line 29): if `localStorage.getItem("percentilers_phone")` is empty, check `getCookie("percentilers_phone")` and restore to localStorage if found
- Also ensure the cookie is set if localStorage has the phone but the cookie doesn't

**Safari video fixes:**
- Add new state: `videoError` (boolean) and `showTapToPlay` (boolean, default true)
- Change `preload="metadata"` to `preload="auto"` (line 213)
- Add `poster` attribute with a simple data URI showing a play icon on dark background
- Add `x-webkit-airplay="allow"` attribute
- Add `onError` handler that sets `videoError = true` and shows a "Video failed to load -- tap to retry" message
- Add a "Tap to Play" overlay button that appears on top of the video. On tap, it calls `videoRef.current.play()` and hides itself. This satisfies iOS Safari's user-gesture requirement for autoplay
- The overlay disappears once the video starts playing (listen to `onPlay` event)

---

### Technical Details

**Cookie utility:**
```text
src/lib/cookieUtils.ts
  setCookie(name: string, value: string, days: number): void
  getCookie(name: string): string | null
```

**Files changed:**
1. `src/lib/cookieUtils.ts` -- NEW (~15 lines)
2. `src/pages/Masterclass.tsx` -- Cookie set on submit + cookie check on load (~8 lines added)
3. `src/components/LeadModalProvider.tsx` -- Cookie fallback in openModal + cookie set in handleSubmit (~10 lines added)
4. `src/pages/MasterclassWatch.tsx` -- Cookie sync + video: preload change, poster, tap-to-play overlay, error handler (~30 lines added)
