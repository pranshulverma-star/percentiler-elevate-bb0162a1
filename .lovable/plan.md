

## Performance Optimization Plan

Based on the PageSpeed Insights screenshot, here are the issues and fixes mapped to the codebase:

### 1. Image Delivery — Save ~1,555 KiB

**Problem**: HeroSection imports `.jpeg` and `.png` files (student photos, college logos) instead of `.webp`. FeaturedStrip uses 5 `.png` logos. Navbar and Footer use `.png` logo.

**Fix**:
- Convert all remaining `.jpeg` and `.png` images used in components to `.webp` format (most student photos already have `.webp` variants in `src/assets/`)
- Update imports in `HeroSection.tsx`: switch `student-aayushi-jha.jpeg`, `student-aayushi-rana.jpeg`, `student-vishwajeet.jpeg` to their `.webp` equivalents (create if missing)
- Convert and replace all 8 `college-*.png` files with `.webp` versions
- Convert `logo-*.png` files (FeaturedStrip, Navbar, Footer) to `.webp`
- Add `loading="lazy"` to all below-fold images that don't have it
- Add explicit `width` and `height` attributes to all `<img>` tags to prevent layout shifts

### 2. Cache Lifetimes — Save ~5,493 KiB

**Problem**: The `_headers` file only caches `/assets/*` (Vite-hashed). External resources (Google Fonts CSS, GTM script) and any non-hashed static files (favicon, PWA icons, sitemap, robots.txt) have no cache headers.

**Fix**:
- Add cache headers for static files in `public/`:
  ```
  /favicon.ico
    Cache-Control: public, max-age=86400
  /pwa-icon-*.png
    Cache-Control: public, max-age=604800
  /sitemap.xml
    Cache-Control: public, max-age=86400
  /robots.txt
    Cache-Control: public, max-age=86400
  ```
- Note: Google Fonts/GTM caching is controlled by those third parties — limited control here. The workbox runtime caching already handles Google Fonts.

### 3. Render-Blocking Requests — Save ~160 ms

**Problem**: The Google Fonts `<link rel="preload" as="style">` followed by `<link rel="stylesheet" media="print" onload="this.media='all'">` pattern is already in place, which is good. However, Lighthouse may flag the `preload` itself as render-blocking since it's high-priority.

**Fix**:
- Remove the `<link rel="preload" as="style" ...>` for Google Fonts — the `media="print" onload` pattern handles async loading on its own. The preload counteracts the async loading by making it blocking again.
- Consider self-hosting the DM Sans font (download `.woff2` files to `public/fonts/`) to eliminate the external request chain entirely. This eliminates two network hops (fonts.googleapis.com + fonts.gstatic.com).

### 4. Reduce Unused JavaScript — Save ~239 KiB

**Problem**: framer-motion is imported in 36+ files. Even with tree-shaking, it's a large library. Recharts is also bundled.

**Fix**:
- For lightweight sections (WhyDifferentSection, FacultySection, TestimonialsSection, etc.), replace `motion.div` with CSS animations or Intersection Observer patterns already used in HeroSection. Most uses are simple fade-up/slide-in on viewport entry.
- Add `framer-motion` to `manualChunks` in vite config so it's a separate lazy-loaded chunk (already done as `vendor-motion`)
- For sections that only use `initial`/`whileInView` with simple transforms, replace with a small `useFadeIn` hook using IntersectionObserver + CSS transitions (~50 lines vs 30KB+ of framer-motion in the main chunk)

### 5. Reduce Unused CSS — Save ~15 KiB

**Fix**:
- Audit Tailwind's `content` paths — currently includes `./pages/**/*` and `./components/**/*` alongside `./src/**/*` which is redundant. Clean to just `./src/**/*.{ts,tsx}`.
- This is a minor issue; Tailwind's purge already handles most of it.

### 6. Non-Composited Animations — 8 Elements

**Problem**: `animate-scroll-x` marquee (FeaturedStrip, HeroCollegeMarquee) uses `transform: translateX()` which should be composited, but the `animate-shimmer` on the hero badge uses `background-position` which forces paint.

**Fix**:
- Replace `animate-shimmer` (background-position animation) with a CSS `::after` pseudo-element using `transform: translateX()` for the shimmer effect
- Ensure all scroll-x animations use `will-change: transform` hint
- Check `animate-pulse-glow` (box-shadow animation) — box-shadow changes trigger paint. Consider replacing with a pseudo-element opacity animation.

### 7. Network Dependency Tree & Payload Size (5,591 KiB)

**Fix**:
- The heavy payload is primarily images. Converting to WebP (item #1) addresses most of this.
- Compress WebP images to ~80% quality
- For WhatsApp screenshot images (6 files loaded in TestimonialsSection), add `decoding="async"` and consider showing only 3 on mobile with a "show more" button (already partially done in ResultsSection pattern)

### Implementation Priority

| Priority | Task | Impact |
|----------|------|--------|
| 1 | Remove font preload + consider self-hosting | 160ms render-blocking fix |
| 2 | Convert all images to WebP | ~1.5MB savings |
| 3 | Replace framer-motion with CSS in simple sections | ~239KiB JS savings |
| 4 | Add cache headers for public static files | ~5.5MB cache savings |
| 5 | Fix non-composited animations | Smoother scrolling |
| 6 | Clean Tailwind content paths | Minor CSS savings |

### Technical Details

**Self-hosting DM Sans**: Download 4 weight variants (400, 500, 600, 700) as `.woff2`, add `@font-face` declarations to `index.css`, remove Google Fonts links from `index.html`.

**CSS fade-in replacement**: Create a `useInViewAnimation` hook with IntersectionObserver that adds a CSS class. Replace framer-motion in at least WhyDifferentSection, FacultySection, FounderSection, TestimonialsSection (simplest animation patterns).

**WebP conversion**: For images that already have `.webp` variants in `src/assets/`, just update the imports. For college logos and media logos that only exist as `.png`, create `.webp` versions.

