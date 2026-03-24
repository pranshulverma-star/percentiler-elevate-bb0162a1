

## Plan: Redesign Blog Listing + Post Pages

### Overview
Full visual redesign of both blog pages to match the warm, approachable brand aesthetic. Fix HTML content rendering and add FAQ accordion support.

### Files to Modify

1. **`src/pages/BlogListing.tsx`** — Complete rewrite
   - Centered header: "CAT Prep Insights 🎯" with warm subheading, orange underline accent
   - Remove hero card pattern — uniform 3-col grid (2 tablet, 1 mobile)
   - Each card: white bg, 12px radius, subtle shadow, 16:9 image top, orange category pill, bold title (2-line clamp), gray excerpt (2-line clamp), date left + "Read more →" orange right
   - Hover: translateY(-4px), deeper shadow, 0.2s ease transition
   - Max-width 1200px, no sidebar
   - Keep category filter chips but restyle with orange active state

2. **`src/pages/BlogPost.tsx`** — Major rewrite
   - Single column, max-width 740px, padding 2rem desktop / 1rem mobile
   - "← All Articles" back link top-left in orange
   - Category pill, then H1 (2.25rem, weight 800, line-height 1.3, #1a1a1a)
   - Meta row: date + read time (wordCount / 200)
   - Featured image: full width, 12px radius, below meta
   - **Content rendering fix**: Prefer `content_html` rendered via `dangerouslySetInnerHTML`. Fall back to markdown only if no HTML. Remove the split-in-half mid-article CTA approach — place CTA banner at bottom only
   - FAQ section: Parse `.faq-section` from HTML content, extract Q&A pairs, render as accordion with orange chevron, #fff8f5 open bg, #ffe0cc border
   - Bottom CTA banner: orange bg, white text, "Ready to crack CAT?" with white button linking to percentilers.in

3. **`src/index.css`** — Add blog-specific content styles
   - `.blog-content p`: font-size 1.05rem, line-height 1.85, mb 1.4rem, color #2d2d2d
   - `.blog-content h2`: 1.6rem, weight 700, 3px orange left border, 12px left padding
   - `.blog-content h3`: 1.25rem, weight 600
   - `.blog-content blockquote`: 4px orange left border, #fff8f5 bg, rounded right
   - `.blog-content a`: color #FF6B35, underline on hover, weight 500
   - `.blog-content ul/ol`: proper padding and spacing
   - `.blog-content table`: keep existing responsive styles
   - `.blog-faq` accordion styles

4. **`src/components/blog/BlogCTABanner.tsx`** — Redesign bottom CTA
   - Orange background banner, white text: "Ready to crack CAT? Get expert guidance at Percentilers →"
   - White button with orange text, 12px radius, 1.5rem padding
   - Remove the 3-card grid pattern, replace with single impactful banner

5. **`src/components/blog/RelatedPosts.tsx`** — Restyle cards to match new listing card design (white bg, shadow, orange accents, "Read more →")

### Technical Details
- Use `dangerouslySetInnerHTML` for HTML content (already partially done)
- FAQ accordion: parse the HTML string for `.faq-section` using regex or DOMParser, extract heading/content pairs, render with Radix Accordion component (already installed)
- Read time: change divisor from 220 to 200 per spec
- All transitions: 0.2s ease
- No new fonts — DM Sans already in use

