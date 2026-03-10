CREATE OR REPLACE FUNCTION public.notify_new_lead_webhook()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM net.http_post(
      url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'phone', NEW.phone_number,
        'source', NEW.lead_source,
        'name', '',
        'event', 'new_lead',
        'created_at', NEW.created_at
      )::text
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.converted_at IS NULL AND NEW.updated_at != OLD.updated_at THEN
    PERFORM net.http_post(
      url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'phone', NEW.phone_number,
        'source', NEW.lead_source,
        'name', '',
        'event', 'returning_lead',
        'created_at', NEW.updated_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_new_lead_webhook ON campaign_state;

CREATE TRIGGER notify_new_lead_webhook
AFTER INSERT OR UPDATE ON campaign_state
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_lead_webhook();