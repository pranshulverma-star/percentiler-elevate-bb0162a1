

## Diagnosis: Why Scroll Snap Is Not Working on Homepage

### Root Causes Identified

1. **`content-visibility: auto` conflicts with scroll snap.** The `.content-auto` class uses `content-visibility: auto` with `contain-intrinsic-size: auto 600px`. This tells the browser to skip rendering off-screen sections and estimate their height at 600px. Scroll snap requires knowing the exact position of snap points — with estimated heights, snap targets are wrong and the browser can't snap correctly.

2. **Multiple components grouped in one snap target.** Several snap-section divs contain 2-3 components (e.g., TrustStrip + ResultsSection, WebinarSection + CoursesSection + FacultySection). These create very tall snap targets that don't produce a "one scroll = one section" feel.

3. **Fixed navbar offset.** The 64px fixed navbar means snap-align `start` puts content behind the navbar. Needs `scroll-padding-top: 4rem` on `html`.

### Fix

**1. `src/index.css`**
- Add `scroll-padding-top: 4rem` to `html` (accounts for fixed navbar)
- Remove `content-visibility: auto` from `.content-auto`, OR create a new class that doesn't use it for snap sections. The performance benefit of `content-visibility` is incompatible with scroll snap.

**2. `src/pages/Index.tsx`**
- Remove `content-auto` class from all snap-section divs (scroll snap needs real layout sizes)
- Split grouped sections so each major component gets its own snap-section wrapper (e.g., TrustStrip and ResultsSection become separate snap targets)

### Changes

**File 1: `src/index.css`** — Add `scroll-padding-top: 4rem` to the `html` rule. Remove `content-visibility` from snap sections (keep the `.content-auto` class for non-snap uses but don't combine it with `.snap-section`).

**File 2: `src/pages/Index.tsx`** — Remove `content-auto` from all snap-section wrappers. Split multi-component snap divs into individual snap-section wrappers per component:
- `TrustStrip` and `ResultsSection` → two separate snap-sections
- `FreeToolsSection` and `PercentilePlannerSection` → two separate snap-sections  
- `WebinarSection`, `CoursesSection`, `FacultySection` → three separate snap-sections
- `WhyDifferentSection`, `FAQSection`, `FinalCTASection` → three separate snap-sections
- Each wrapped in its own `SectionErrorBoundary` + `Suspense`

