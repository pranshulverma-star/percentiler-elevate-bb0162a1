

## Plan: Redesign Study Buddy Landing Page

### Problem
The current Study Buddy page has a minimal landing state for unauthenticated users — just 3 feature cards and a sign-in button. It doesn't sell the concept or match the premium visual identity of the rest of the site.

### What we're building
A visually rich, mobile-first landing page that replaces the current `LandingState` component inside `StudyBuddy.tsx`. The authenticated states (invite card, dashboard) remain untouched.

### New Landing Sections (top to bottom)

1. **Hero** — Bold headline ("Your CAT Prep Partner in Crime"), subtext about accountability, primary CTA ("Get Your Study Buddy — Free"), and a decorative illustration area with two animated avatar silhouettes connected by a dotted line (CSS-only).

2. **How It Works** — 3-step horizontal timeline (mobile: vertical): (1) Share invite link → (2) Buddy joins → (3) Track together. Numbered circles with connecting lines, icon + short copy per step.

3. **Feature Showcase** — 4 glassmorphic cards in a 2×2 grid (mobile: stacked): Shared Progress Tracking, 2x Streak Bonus, Daily Sprint Visibility, Gentle Nudges. Each with a Lucide icon, bold title, and one-line description.

4. **Social Proof / Stats Strip** — Animated counter-style stats: "500+ buddy pairs formed", "2x more consistent", "87% complete daily goals". Adds credibility without real testimonials.

5. **FAQ Accordion** — 4-5 questions (Is it free? Can I change buddies? What does my buddy see? Do I need to share my phone number?) using the existing `accordion` UI component. SEO-friendly with FAQ structured data.

6. **Final CTA** — Repeated sign-in button with urgency copy ("Your future self will thank you").

### SEO Enhancements
- Unique H1 with target keyword "CAT Study Buddy"
- Update SEO component meta title/description for search intent
- Add FAQPage JSON-LD structured data in the component
- Proper heading hierarchy (H1 → H2 → H3)

### Visual Style (matching brand)
- Gradient background sections (primary/10 → transparent)
- Decorative blur blobs (consistent with DashboardCTASection)
- Glassmorphic card borders with `backdrop-blur`
- `framer-motion` fadeUp animations per section
- Mobile-first: single-column stacks, tight padding (py-10), tracking-tight headlines

### Files to change
1. **Edit** `src/pages/StudyBuddy.tsx` — Replace `LandingState` with the new multi-section landing, add JSON-LD FAQ schema
2. No new files needed — everything stays within the existing page component

### What stays the same
- All authenticated states (invite card, buddy dashboard, error handling)
- SEO canonical URL
- Navbar + Footer wrapper
- All buddy utility functions and data flow

