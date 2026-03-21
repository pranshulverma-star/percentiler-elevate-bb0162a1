

## Plan: Add Scroll-Snap Between Sections Site-Wide

### Important Consideration

Many sections on the site are **taller than the viewport** (especially on mobile at 393×587px) — for example, FAQ accordions, testimonials, course listings, and forms. Using `mandatory` scroll-snap on these would **trap users mid-section**, unable to scroll to see content below the fold within that section.

**Recommended approach**: Use `scroll-snap-type: y proximity` instead of `mandatory`. This gives the "snap to next section" feel when scrolling near section boundaries, but still allows free scrolling through tall sections. It's the industry-standard approach for content-heavy marketing sites.

### Changes

**1. `src/index.css` — Add global snap styles**
- Add `scroll-snap-type: y proximity` to the `html` element
- Add a utility class `.snap-section` with `scroll-snap-align: start`
- Add `scroll-behavior: smooth` for polished transitions

**2. `src/pages/Index.tsx` — Add snap class to each section wrapper**
- Add `snap-section` class to each `SectionErrorBoundary` / `div.content-auto` wrapper and to `HeroSection`, `FeaturedStrip`, `Footer`

**3. All major page components** — Add snap class to top-level section elements across:
- `StudyBuddy.tsx` (each landing section)
- `Flashcards.tsx`, `PracticeLab.tsx`, `Dashboard.tsx`, etc.
- Each page's major `<section>` elements get the `snap-section` class

**4. `src/components/buddy/StudyBuddyLanding.tsx`** — Add `snap-section` to each `<section>`

### Technical Detail

```css
/* index.css */
html {
  scroll-snap-type: y proximity;
  scroll-behavior: smooth;
}

.snap-section {
  scroll-snap-align: start;
}
```

`proximity` means: snap only when the user stops scrolling near a section boundary. Free scrolling within tall sections works normally. This avoids the common pitfall of mandatory snap trapping users in oversized sections.

### Files to edit
1. `src/index.css` — global snap rules
2. `src/pages/Index.tsx` — add snap classes to section wrappers
3. `src/components/buddy/StudyBuddyLanding.tsx` — add snap classes
4. Other page files with distinct sections (StudyBuddy, Flashcards, PracticeLab, Dashboard, etc.)

