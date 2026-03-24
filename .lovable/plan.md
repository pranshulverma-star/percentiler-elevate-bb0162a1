

## Plan: Migrate Blog Posts from Old Site to New Site

### What I Found

58 blog posts on old.percentilers.in. Here are some examples:
- `cat-exam`, `cat-syllabus`, `cat-exam-books`
- `how-to-crack-cat-exam`, `score-99-percentile-in-cat`
- `cat-coaching-real-talk-is-it-a-game-changer-or-just-hype`
- `top-mba-colleges-in-india-beyond-the-iim-hype-real-talk-no-cap`
- `iim-kozhikode-cutoff`, `cat-cut-off-for-iim`
- ...and 50+ more

All will be served at `percentilers.in/{slug}` directly (no `/blog/` prefix).

### Approach (3 phases)

**Phase 1: Database Setup**
- Create a `blog_posts` table with columns: `id`, `slug` (unique), `title`, `content_html`, `content_markdown`, `meta_description`, `featured_image`, `published_at`, `created_at`
- Public SELECT RLS policy (blogs are public content, no auth needed to read)
- No INSERT/UPDATE/DELETE for public users

**Phase 2: Scrape and Store**
- Create an edge function `scrape-blogs` that:
  1. Takes a list of blog URLs
  2. Uses Firecrawl to scrape each one (markdown + html format)
  3. Extracts title, meta description, featured image from metadata
  4. Inserts into `blog_posts` table
- Run the scraper to populate the database
- Show you the results before proceeding

**Phase 3: Frontend**
- Create a `BlogPost.tsx` page component that:
  - Fetches blog content by slug from the database
  - Renders markdown/HTML content with proper styling
  - Includes SEO meta tags (title, description, og:image)
- Create a `BlogListing.tsx` page for `/blog` that lists all posts
- Add dynamic route in `App.tsx`: `/:slug` BEFORE the `*` catch-all
  - This route checks if the slug exists in `blog_posts` table
  - If yes, renders the blog post
  - If no, falls through to `NotFoundRedirect` (old site redirect)
- Update `_redirects` to include all blog slugs pointing to `/index.html`

### Routing Strategy

Since blog slugs live at the root level (`/cat-exam`, `/cat-syllabus`), the `BlogPost` component will first query the database for the slug. If not found, it redirects to `old.percentilers.in/{slug}` just like the current 404 behavior. This way existing app routes are unaffected.

### Technical Details

**Table schema:**
```sql
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content_html text,
  content_markdown text,
  meta_description text,
  featured_image text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog posts"
  ON public.blog_posts FOR SELECT
  TO public
  USING (true);
```

**Edge function** (`scrape-blogs`): Uses Firecrawl API to scrape each URL, extract content, and insert into the table via Supabase service role.

**Route in App.tsx:**
```tsx
<Route path="/:slug" element={<BlogPost />} />
// placed before the * catch-all
```

**Files to create/modify:**
- New migration for `blog_posts` table
- `supabase/functions/scrape-blogs/index.ts` — scraper edge function
- `src/pages/BlogPost.tsx` — single blog post page
- `src/pages/BlogListing.tsx` — blog listing page
- `src/App.tsx` — add routes
- `public/_redirects` — add blog slug entries

