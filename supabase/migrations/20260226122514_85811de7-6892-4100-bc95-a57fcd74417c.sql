
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function to POST new lead to n8n webhook
CREATE OR REPLACE FUNCTION public.notify_new_lead_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
    body := jsonb_build_object(
      'name', NEW.name,
      'phone', NEW.phone_number,
      'source', 'Website'
    ),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  RETURN NEW;
END;
$$;

-- Attach trigger on INSERT
CREATE TRIGGER trg_notify_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_lead_webhook();
