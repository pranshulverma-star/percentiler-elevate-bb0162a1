-- Step 1: Recreate the webhook function pointing to n8n
CREATE OR REPLACE FUNCTION notify_new_lead_webhook()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'phone', NEW.phone_number,
      'source', NEW.lead_source,
      'name', '',
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Recreate the trigger on campaign_state
DROP TRIGGER IF EXISTS notify_new_lead_webhook ON campaign_state;

CREATE TRIGGER notify_new_lead_webhook
AFTER INSERT ON campaign_state
FOR EACH ROW
EXECUTE FUNCTION notify_new_lead_webhook();