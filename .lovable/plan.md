

## Problem

The Dashboard link only appears in the navbar **after** the user is authenticated. A first-time visitor has no idea a dashboard exists — they might use a tool, leave, and never return.

## Plan: Make Dashboard Discoverable for All Visitors

### Changes

**1. Navbar — Always show "My Dashboard" link**
- Show the Dashboard link in the navbar for **all users** (not just authenticated ones)
- Remove the `isAuthenticated &&` guard on both desktop and mobile nav
- Since `/dashboard` is already wrapped in `ProtectedRoute`, clicking it as a guest will trigger Google sign-in and redirect back — no extra logic needed
- Style it slightly differently (e.g., subtle highlight or user icon) to draw attention

**2. Homepage — Add a "My Dashboard" entry point**
- In the `FreeToolsSection` or `HeroSection`, add a small card/link like "Track Your Progress → My Dashboard" so users see the value proposition
- Alternatively, after a user completes any tool (Readiness Assessment, Planner, Practice Lab quiz), show a nudge: "View your progress on your Dashboard →"

**3. Post-quiz nudge in Practice Lab results**
- In `ResultsView.tsx`, add a "View Dashboard" link/card after results so users who just completed a quiz discover their personalized dashboard

### Recommendation

The simplest high-impact change is **#1** — always showing the Dashboard link. The `ProtectedRoute` already handles the auth gate, so no new logic is needed. Options #2 and #3 add discovery but are secondary.

### Technical details

- **Navbar.tsx**: Remove `{isAuthenticated && (...)}` wrapper around the Dashboard `<Link>` on lines 80-84 (desktop) and 114-118 (mobile)
- **ResultsView.tsx**: Add a small "📊 View Your Dashboard" link card near the bottom of the results page, linking to `/dashboard`

