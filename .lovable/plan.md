

## Fix: OG Image Not Showing When Sharing Links

### Root Cause
Three compounding issues:
1. The `og:image` in `index.html` points to an **expired** Google Cloud Storage signed URL
2. The `SEO.tsx` default references `https://percentilers.in/og-image.jpg` which **does not exist** in `public/`
3. Social crawlers (WhatsApp, LinkedIn, Facebook, Twitter) **do not execute JavaScript** — they only read raw HTML from `index.html`, never seeing react-helmet's injected tags

### Fix

**Step 1: Create a permanent OG image**
- Place an `og-image.jpg` (recommended 1200×630px) in `public/` — this could be a branded Percentilers card with the logo, tagline, and key visual
- You'll need to provide or approve the image; alternatively I can use one of the existing assets (e.g. the Percentilers logo composited on a branded background)

**Step 2: Update `index.html`**
- Replace the expired signed URL on line 60 with a permanent, self-hosted path:
  ```
  <meta property="og:image" content="https://percentilers.in/og-image.jpg" />
  ```

**Step 3: Update `SEO.tsx` default**
- Keep `DEFAULT_OG_IMAGE = "https://percentilers.in/og-image.jpg"` — this is already correct, it just needs the actual file to exist

**Step 4: Add cache header**
- Add to `public/_headers`:
  ```
  /og-image.jpg
    Cache-Control: public, max-age=604800
  ```

### Important Note
For **per-page OG images** (e.g. Masterclass page, Mentorship page), social crawlers will still only see the `index.html` fallback since this is a client-rendered SPA. All pages will share the same OG image unless you add a pre-rendering service (like Cloudflare Workers or a meta-tag injection proxy). For now, having one good branded OG image is the practical fix.

