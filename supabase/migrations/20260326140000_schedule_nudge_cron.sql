-- ============================================================
-- Phase 4: Schedule daily nudge engine with pg_cron
-- ============================================================
--
-- PREREQUISITE: pg_cron must be enabled in Supabase Dashboard
-- before running this migration.
--   Dashboard → Database → Extensions → search "pg_cron" → Enable
--
-- PREREQUISITE: pg_net must be enabled (it was enabled in an
-- earlier migration: 20260226122514). Verify with:
--   SELECT * FROM pg_extension WHERE extname = 'pg_net';
--
-- PREREQUISITE: Set the two app settings that the cron job reads.
-- Run these in the SQL Editor ONCE (replace values with your project's):
--
--   ALTER DATABASE postgres SET "app.supabase_url"     = 'https://YOUR_PROJECT_REF.supabase.co';
--   ALTER DATABASE postgres SET "app.service_role_key" = 'YOUR_SERVICE_ROLE_KEY';
--
-- These are stored in postgresql.conf — they survive restarts and
-- are readable via current_setting() from any function or cron job.
-- ============================================================

-- Enable pg_cron (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant cron schema usage to postgres role (required in some Supabase versions)
GRANT USAGE ON SCHEMA cron TO postgres;

-- Remove any existing schedule with the same name before (re-)creating
SELECT cron.unschedule('daily-nudge-engine')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-nudge-engine'
);

-- Schedule nudge engine at 14:30 UTC = 8:00 PM IST, every day
SELECT cron.schedule(
  'daily-nudge-engine',
  '30 14 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/nudge-engine',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify the schedule was created
-- (run this SELECT separately to confirm after applying the migration)
-- SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = 'daily-nudge-engine';
