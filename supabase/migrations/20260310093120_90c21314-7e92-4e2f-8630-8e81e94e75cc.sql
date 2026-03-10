
CREATE OR REPLACE FUNCTION public.notify_new_lead_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _name text := '';
BEGIN
  BEGIN
    -- Look up lead name from the leads table
    SELECT name INTO _name FROM public.leads WHERE phone_number = NEW.phone_number LIMIT 1;
    _name := COALESCE(_name, '');

    IF TG_OP = 'INSERT' THEN
      PERFORM net.http_post(
        url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'phone', NEW.phone_number,
          'source', NEW.lead_source,
          'name', _name,
          'event', 'new_lead',
          'created_at', NEW.created_at
        )
      );
    ELSIF TG_OP = 'UPDATE' AND OLD.converted_at IS NULL AND NEW.updated_at != OLD.updated_at THEN
      PERFORM net.http_post(
        url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'phone', NEW.phone_number,
          'source', NEW.lead_source,
          'name', _name,
          'event', 'returning_lead',
          'created_at', NEW.updated_at
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'notify_new_lead_webhook failed: % %', SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$;
