

## Plan: OG/Twitter Meta Tags, Dynamic Sitemap, robots.txt, llms.txt

### Current State

- **SEO component** already renders `og:title`, `og:description`, `og:url`, `og:image`, `og:type` (hardcoded to "website"), and Twitter card tags. Missing: `og:site_name`, dynamic `og:type` (article vs website).
- **BlogPost** already passes `ogImage={post.featured_image}` to SEO. Good.
- **robots.txt** and **llms.txt** already exist in `/public`.
- **sitemap.xml** is static and hardcoded with 80+ URLs. Blog post slugs are manually listed and will go stale as new posts are added.

### Changes

#### 1. Enhance SEO component — add `og:site_name` and dynamic `og:type`

**File: `src/components/SEO.tsx`**

- Add `ogType` prop (default: `"website"`) to the `SEOProps` interface
- Render `<meta property="og:site_name" content="Percentilers" />`
- Use `ogType` for the `og:type` meta tag instead of hardcoded "website"

#### 2. Pass `ogType="article"` from BlogPost

**File: `src/pages/BlogPost.tsx`**

- Add `ogType="article"` to the `<SEO>` call so blog posts emit `og:type = article`

#### 3. Dynamic sitemap via edge function

Replace the static `public/sitemap.xml` with a backend function that generates the sitemap on-the-fly by querying `blog_posts` slugs from the database.

**File: `supabase/functions/sitemap/index.ts`**

- Query all `blog_posts` for `slug` and `published_at`
- Combine with a hardcoded list of static page URLs (homepage, masterclass, mentorship, etc.)
- Return valid XML sitemap with `Content-Type: application/xml`
- No sitemap-index needed — a single sitemap handles all URLs (well under the 50,000 URL limit)

**File: `public/_redirects`** (add rule)

- Add `/sitemap.xml` rewrite to the edge function URL so `/sitemap.xml` serves the dynamic version

**File: `public/sitemap.xml`**

- Delete this file (replaced by the dynamic edge function)

#### 4. robots.txt — already exists, no changes needed

The current `public/robots.txt` is complete with Googlebot, Bingbot, Twitterbot, facebookexternalhit rules, disallow for /admin and /dashboard, and sitemap reference.

#### 5. llms.txt — already exists, no changes needed

The current `public/llms.txt` is comprehensive with all pages, offerings, pricing, and contact info.

### Summary of file changes

| File | Action |
|---|---|
| `src/components/SEO.tsx` | Add `ogType` prop, add `og:site_name` |
| `src/pages/BlogPost.tsx` | Pass `ogType="article"` |
| `supabase/functions/sitemap/index.ts` | New edge function for dynamic sitemap |
| `public/_redirects` | Add rewrite rule for `/sitemap.xml` |
| `public/sitemap.xml` | Delete (replaced by edge function) |

