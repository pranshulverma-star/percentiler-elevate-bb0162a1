## Completed: Blog Migration from Old Site

✅ Created `blog_posts` table with public SELECT RLS
✅ Scraped 61 blog posts from old.percentilers.in via Firecrawl
✅ Created `BlogPost.tsx` (dynamic page fetching by slug)
✅ Created `BlogListing.tsx` (listing page at /blog)
✅ Updated App.tsx routing: `/:slug` before catch-all
✅ Updated `_redirects`: catch-all now serves SPA instead of redirecting to old site
✅ BlogPost component redirects to old site if slug not found in DB
