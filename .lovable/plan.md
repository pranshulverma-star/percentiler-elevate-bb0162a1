

## Plan: Scrape Missing Blogs + Fix Content Rendering

### Problem Summary

1. **44 blog posts missing** from the database — the sitemap lists 58 URLs but only 14 are in the DB
2. **Tables are broken** because `remark-gfm` (GitHub Flavored Markdown) plugin is missing — ReactMarkdown ignores table syntax without it
3. **Content has WordPress artifacts** — gravatar images, author bylines, and navigation cruft baked into the scraped markdown

### Phase 1: Scrape the 44 Missing Posts

Use the existing `scrape-blogs` edge function to fetch all missing URLs from the old site.

**Missing slugs to scrape** (extracted from `old.percentilers.in/post-sitemap.xml`):
```text
gmat-analytical-writing-assessment-expert-tips
prepare-for-cat-in-1-month
eligibility-for-cat-exam
quantitative-aptitude-for-cat
advantages-of-cat-exam
purpose-of-cat-exam
cat-negative-marking
is-calculator-allowed-in-cat
cat-application-form
is-cat-exam-compulsory-for-mba
things-to-carry-for-the-cat-exam
how-many-mocks-tests-should-take-cat-exam
why-mba-from-top-b-school
why-cat-exam-is-tough
how-to-crack-cat-in-60-days
things-you-should-know-before-planning-for-mba
admission-in-mba-without-cat
mba-specialization-in-india
how-to-prepare-for-cat-exam
cat-registrations-this-year
balancing-the-grind-cracking-cat-while-working-no-cap
iim-call-criteria-2026-your-real-talk-guide-to-cracking-the-code-no-cap
common-mistakes-to-avoid-on-cat-exam-day
cat-exam-fees-for-obc
reservation-in-cat-exam
cat-exam-fees
snap-prep-its-not-just-a-cat-lite-exam-no-cap
iim-vs-non-iim-placements-the-real-tea-you-need-to-know-no-cap
mba-profile-building-real-talk-no-cap
omet-exams-2024
why-should-you-choose-percentilers-for-cat-preparation
last-3-months-to-cat-real-talk-on-boosting-your-score-no-cap
cat-repeater-strategy-level-up-your-prep-no-cap
cracking-cat-mocks-your-no-bs-strategy-guide-for-2026
cat-score-vs-percentile-the-real-gyaan-for-your-2026-prep-no-cap
cat-2027-prep-is-it-too-early-to-start-real-talk-no-cap
cat-2026-prep-ditch-the-old-playbook-this-is-the-real-gyaan-you-need
cat-2026-prep-your-real-talk-guide-to-slaying-the-exam
xat-decision-making-prep-your-no-bs-guide-to-slaying-this-section-real-talk
cat-score-vs-percentile-why-your-raw-score-is-lowkey-a-trap-for-2026
best-online-cat-coaching-your-no-bs-guide-to-slaying-the-exam
best-books-for-cat-prep-real-talk-its-not-what-you-think-for-2026
online-cat-coaching-is-it-lowkey-the-only-way-to-slay-cat-2026
cat-without-coaching-real-talk-is-it-even-possible
top-10-mba-colleges-in-the-world-a-gateway-to-global-business-excellence
mba-roi-in-india-real-talk-no-cap-for-future-leaders
slaying-cat-quants-your-no-bs-guide-to-cracking-the-code
```

Will invoke the edge function in batches (5-6 at a time to avoid Firecrawl rate limits). After scraping, delete any that come back as "Page not found."

### Phase 2: Fix Table & Content Rendering

**Install `remark-gfm`** — this is the critical missing piece. Without it, ReactMarkdown cannot parse:
- Tables (`| col | col |`)
- Strikethrough (`~~text~~`)
- Task lists (`- [x] done`)

**Update `BlogPost.tsx`**:
- Add `remarkGfm` plugin to both `<ReactMarkdown>` instances
- Add comprehensive table CSS: borders, striped rows, proper padding, responsive horizontal scroll wrapper
- Improve overall prose styling for readability

### Phase 3: Clean WordPress Artifacts from Content

**Update the `scrape-blogs` edge function** to strip common WordPress boilerplate before saving:
- Remove gravatar image lines (`![](https://secure.gravatar.com/...`)
- Remove "Written by" / author byline sections that duplicate the meta strip
- Remove trailing chat widget text ("Hello", "Can we help you?")
- Remove CTA sections that were part of the old site template (not article content)

**Run a one-time cleanup** on existing 14 posts to strip the same artifacts.

### Phase 4: Update Existing Posts + Assign Categories

Run UPDATE queries to assign proper categories to the new posts based on slug patterns:
- `cat-exam-*`, `cat-negative-*`, `cat-application-*` → "CAT Exam Guide"
- `iim-*`, `cat-cut-off-*` → "Scores & Cutoffs"
- `*coaching*`, `*prep*`, `*crack*` → "CAT Strategy"
- `mba-*`, `*b-school*` → "MBA Colleges"
- etc.

### Phase 5: Update Sitemap

Regenerate `public/sitemap.xml` with all valid blog slugs (should be ~58 total).

### Files to Modify
- `package.json` — add `remark-gfm`
- `src/pages/BlogPost.tsx` — add remarkGfm plugin, improve table CSS, add content cleaning
- `supabase/functions/scrape-blogs/index.ts` — add content sanitization logic
- `public/sitemap.xml` — add all new blog slugs

