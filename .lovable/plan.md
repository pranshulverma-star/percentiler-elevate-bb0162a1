

## Plan: Premium Sign-In Screen

The current `SignInScreen` in `ProtectedRoute.tsx` is bare — a plain icon, text, and two buttons on a flat background. It needs to feel like a branded, polished gate.

### Changes

**1. `src/components/ProtectedRoute.tsx` — Redesign `SignInScreen`**
- Add the "Percentilers" brand name/logo at the top
- Wrap the sign-in content in a glassmorphic card (`bg-card/80 backdrop-blur border rounded-2xl shadow-lg`) centered on screen
- Add a subtle gradient mesh background (matching dashboard style)
- Improve spacing: logo → headline → subtext → auth buttons → footer note
- Add a small "secure sign-in" trust line at the bottom (lock icon + text)
- Context-aware headline: "Welcome to your Dashboard" for dashboard source, "Watch the Masterclass" for masterclass, etc.

**2. `src/components/AuthButtons.tsx` — Minor polish**
- Increase button height from `h-12` to `h-13` (52px) for better tap targets on mobile
- Add subtle left-aligned icon with a thin separator line before the label for a more professional look
- Slightly larger border-radius consistency

### No backend changes needed.

