-- Welcome-sent idempotency guard
-- Fixes the bug where SIGNED_IN fires on every page load (Supabase session
-- restore) causing duplicate welcome emails and notifications.
--
-- Three-layer defence:
--   1. profiles.welcome_sent — atomic UPDATE claim (only the first caller wins)
--   2. Partial unique index  — DB-level hard stop on duplicate welcome notifications
--   3. Module-level Set in useAuth.ts — prevents same-tab rapid-fire duplicates

-- ── 1. Add welcome_sent column ─────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_sent boolean NOT NULL DEFAULT false;

-- ── 2. Backfill: mark users who already received a welcome notification ────
--    (so their welcome_sent becomes true and no duplicate is ever sent)
UPDATE public.profiles p
SET    welcome_sent = true
WHERE  EXISTS (
  SELECT 1 FROM public.notifications n
  WHERE  n.user_id = p.id
    AND  n.type = 'welcome'
);

-- ── 3. Clean up duplicate welcome notifications before adding the index ────
--    (keeps only the oldest welcome per user; removes extras caused by the bug)
DELETE FROM public.notifications
WHERE  type = 'welcome'
  AND  id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM   public.notifications
    WHERE  type = 'welcome'
    ORDER  BY user_id, created_at ASC NULLS LAST
  );

-- ── 4. Partial unique index — one welcome notification per user, ever ──────
CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_welcome_per_user
  ON public.notifications (user_id)
  WHERE (type = 'welcome');
