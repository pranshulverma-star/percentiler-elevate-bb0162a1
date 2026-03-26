-- Rate limits table for Edge Function cross-instance rate limiting
-- Replaces the in-memory Map in mark-lead-hot (which resets on cold starts)

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key        text        PRIMARY KEY,
  count      integer     NOT NULL DEFAULT 1,
  reset_at   timestamptz NOT NULL
);

-- Service-role-only access (Edge Functions use service role key)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Periodic cleanup: delete expired entries older than 5 minutes past their window
-- (runs via pg_cron or can be triggered manually)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.rate_limits WHERE reset_at < now() - interval '5 minutes';
$$;
