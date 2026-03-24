

## Plan: Comprehensive SEO & GEO Optimization

### What's Already Done
- Homepage, Masterclass, Mentorship, BlogPost, BlogListing, Workshops, CATCoachingComparison, FreeCourses, CATDailyStudyPlanner, CATReadinessAssessment, PracticeLab, DailySprint, StudyBuddy, Flashcards, CATOMETCourses all have SEO tags
- JSON-LD for EducationalOrganization + FAQPage in index.html
- sitemap.xml, robots.txt, llms.txt all present

### Issues to Fix

**1. Pages missing SEO component entirely (no title/description/canonical):**
- `Terms.tsx`
- `PrivacyPolicy.tsx`
- `RefundPolicy.tsx`
- `Contact.tsx`
- `TestSeries.tsx`

**2. Wrong canonical domains** — some pages use `percentiler-elevate.lovable.app` instead of `percentilers.in`:
- `BattleRoom.tsx` — canonical points to lovable.app
- `PracticeLab.tsx` — canonical points to lovable.app

**3. Missing JSON-LD structured data** on key pages:
- **Masterclass** — add `Event` schema (free online event)
- **Mentorship** — add `Course` schema
- **CATOMETCourses** — add `Course` schema
- **TestSeries** — add `Product` or `Course` schema
- **Workshops** — add `Course` schema
- **BlogListing** — add `CollectionPage` schema
- **Flashcards** — already has `LearningResource` (good)
- **CATDailyStudyPlanner** — add `WebApplication` schema
- **CATReadinessAssessment** — add `WebApplication` schema
- **FreeCourses** — add `ItemList` schema

**4. Missing `<meta name="robots">` for noindex pages** — Dashboard, Admin, BattleRoom should be noindexed

**5. Sitemap gaps:**
- Missing: `/flashcards`, `/workshops`, `/study-buddy`, `/daily-sprint`, `/practice-lab`
- Add `lastmod` dates to sitemap entries

**6. GEO (Generative Engine Optimization):**
- Update `llms.txt` to include all pages (flashcards, workshops, blog, study-buddy, daily-sprint, practice-lab, test-series)
- Add structured "what we offer" descriptions for AI crawlers

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Terms.tsx` | Add `<SEO>` with title/desc/canonical |
| `src/pages/PrivacyPolicy.tsx` | Add `<SEO>` with title/desc/canonical |
| `src/pages/RefundPolicy.tsx` | Add `<SEO>` with title/desc/canonical |
| `src/pages/Contact.tsx` | Add `<SEO>` with title/desc/canonical |
| `src/pages/TestSeries.tsx` | Add `<SEO>` + `Course` JSON-LD |
| `src/pages/BattleRoom.tsx` | Fix canonical to percentilers.in |
| `src/pages/PracticeLab.tsx` | Fix canonical to percentilers.in |
| `src/pages/Masterclass.tsx` | Add `Event` JSON-LD |
| `src/pages/Mentorship.tsx` | Add `Course` JSON-LD |
| `src/pages/CATOMETCourses.tsx` | Add `Course` JSON-LD |
| `src/pages/Workshops.tsx` | Add `Course` JSON-LD |
| `src/pages/BlogListing.tsx` | Add `CollectionPage` JSON-LD |
| `src/pages/FreeCourses.tsx` | Add `ItemList` JSON-LD |
| `src/pages/CATDailyStudyPlanner.tsx` | Add `WebApplication` JSON-LD |
| `src/pages/CATReadinessAssessment.tsx` | Add `WebApplication` JSON-LD |
| `src/pages/Dashboard.tsx` | Add `noindex` meta via Helmet |
| `src/pages/AdminDashboard.tsx` | Add `noindex` meta via Helmet |
| `src/components/SEO.tsx` | Add optional `noindex` prop |
| `public/sitemap.xml` | Add missing pages + `lastmod` |
| `public/llms.txt` | Expand with all tools/pages |
| `public/robots.txt` | Add `Disallow: /admin` and `Disallow: /dashboard` |

### Technical Approach

- Add an optional `noindex?: boolean` prop to `SEO.tsx` that renders `<meta name="robots" content="noindex, nofollow" />`
- JSON-LD added via `<Helmet><script type="application/ld+json">` inside each page — keeps schema co-located with the page
- All canonicals use `https://percentilers.in/...`
- Existing visible copy is not changed per project memory constraints

