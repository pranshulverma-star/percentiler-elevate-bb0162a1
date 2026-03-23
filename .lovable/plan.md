

## Plan: Fire Facebook Lead Event on Sign-in (No Dashboard Changes)

### What you get
When a user from a Facebook ad lands on `/flashcards` (or any page) and signs in via Google, Facebook will receive a **Lead** conversion event. This lets FB Ads attribute the sign-in to your campaign. No changes to your leads table or admin dashboard — the `source` field stays as-is.

### Why it works
The Meta Pixel is already installed and `fbq('track', 'PageView')` fires on every page load. Facebook automatically captures `fbclid` from the URL and associates it with the user's browser. So when we fire `fbq('track', 'Lead')` after sign-in, FB matches it to the ad click — no need to store `fbclid` ourselves.

### Changes

**`src/hooks/useAuth.ts`** — Fire pixel event on sign-in
- In the `onAuthStateChange` handler, when `event === "SIGNED_IN"`, call `trackLead()` with the page path (e.g. `"signin_flashcards"`)
- This fires `fbq('track', 'Lead')` which FB Ads picks up as a conversion
- Also fires the Google Ads conversion tag (bonus)
- Use a `sessionStorage` flag to fire only once per sign-in (avoid duplicate events on page refreshes)

**No other files change.** The leads table `source` column remains `"google_signin"` as before. Your admin dashboard is unaffected.

### Technical Detail

```typescript
// In onAuthStateChange, after SIGNED_IN:
const firedKey = "lead_pixel_fired";
if (!sessionStorage.getItem(firedKey)) {
  sessionStorage.setItem(firedKey, "1");
  const page = window.location.pathname.replace("/", "") || "home";
  trackLead(`signin_${page}`);
}
```

Facebook matches the conversion to the ad click via the `fbclid` cookie already stored in the browser — zero extra work needed.

