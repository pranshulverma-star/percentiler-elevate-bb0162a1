

## Plan: Add a "Dashboard Sign-Up" CTA Section to the Homepage

### What we're building
A new, visually distinct CTA banner placed after the Testimonials section (and before Courses) that encourages visitors to sign up with Google and access their personalized dashboard. It highlights free features like streaks, flashcards, study plans, and practice labs — things they get immediately upon signing in.

### Placement
Between **TestimonialsSection** and **WebinarSection** in `Index.tsx`. This is the ideal spot: social proof has just built trust, and the visitor hasn't yet seen the paid course offerings — making it the highest-intent moment for a free sign-up nudge.

### New component: `DashboardCTASection.tsx`
- Gradient/primary-tinted background to stand out from surrounding sections
- Headline: something like *"Your Free CAT Command Center Awaits"*
- 3-4 icon pills showing what they get: Daily Streaks, Flashcards, Practice Lab, Personalized Plan
- Single prominent CTA button: **"Sign Up Free & Start Learning"** → navigates to `/dashboard` (which triggers Google sign-in for unauthenticated users via existing `ProtectedRoute`)
- If user is already authenticated, button text changes to **"Go to Dashboard"**
- Subtle animation on scroll-in (framer-motion, consistent with other sections)

### Files to change
1. **New file** `src/components/DashboardCTASection.tsx` — the section component
2. **Edit** `src/pages/Index.tsx` — lazy-import and place the new section after Testimonials

### No backend changes
Uses existing auth flow and `/dashboard` route. No database, edge function, or RLS changes needed.

