SELECT cron.schedule(
  'daily-nudge-engine',
  '30 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kknunfavfvaqrphgcrku.supabase.co/functions/v1/nudge-engine',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);