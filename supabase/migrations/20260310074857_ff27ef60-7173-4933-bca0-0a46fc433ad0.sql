CREATE OR REPLACE FUNCTION notify_new_lead_webhook()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://percentilers.app.n8n.cloud/webhook/append-lead'::text,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'phone', NEW.phone_number,
      'source', NEW.lead_source,
      'name', '',
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;