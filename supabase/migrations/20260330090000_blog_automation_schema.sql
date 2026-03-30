-- ============================================================
-- Blog Automation Schema
-- Adds missing columns to blog_posts and creates bschool_snapshots
-- ============================================================

-- ── blog_posts: add missing columns ──────────────────────────────────────────

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS seo_title        text,
  ADD COLUMN IF NOT EXISTS excerpt          text,
  ADD COLUMN IF NOT EXISTS focus_keyword    text,
  ADD COLUMN IF NOT EXISTS tags             text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pillar           text,
  ADD COLUMN IF NOT EXISTS post_type        text     DEFAULT 'blog'
                                              CHECK (post_type IN ('blog','news')),
  ADD COLUMN IF NOT EXISTS source_url       text,
  ADD COLUMN IF NOT EXISTS word_count       int      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published        boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz DEFAULT now();

-- Index for daily limit check (created_at) — blog_posts already has created_at
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at
  ON public.blog_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
  ON public.blog_posts (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON public.blog_posts (slug);

-- ── bschool_snapshots: new table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bschool_snapshots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  url            text UNIQUE NOT NULL,
  hash           text NOT NULL,
  content_snippet text,
  updated_at     timestamptz DEFAULT now(),
  created_at     timestamptz DEFAULT now()
);

-- Only service role should read/write this table
ALTER TABLE public.bschool_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.bschool_snapshots
  USING (false);   -- public reads blocked; service-role bypasses RLS

-- ── blog-images storage bucket ───────────────────────────────────────────────
-- Run this separately in Dashboard → Storage if bucket doesn't exist:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
-- ON CONFLICT DO NOTHING;
