-- Welcome-sent idempotency guard

-- 1. Add welcome_sent column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_sent boolean NOT NULL DEFAULT false;

-- 2. Backfill: mark users who already received a welcome notification
UPDATE public.profiles p
SET    welcome_sent = true
WHERE  EXISTS (
  SELECT 1 FROM public.notifications n
  WHERE  n.user_id = p.id
    AND  n.type = 'welcome'
);

-- 3. Clean up duplicate welcome notifications
DELETE FROM public.notifications
WHERE  type = 'welcome'
  AND  id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM   public.notifications
    WHERE  type = 'welcome'
    ORDER  BY user_id, created_at ASC NULLS LAST
  );

-- 4. Partial unique index — one welcome notification per user, ever
CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_welcome_per_user
  ON public.notifications (user_id)
  WHERE (type = 'welcome');