
CREATE OR REPLACE FUNCTION public.sync_lead_to_campaign_state()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' THEN
    BEGIN
      INSERT INTO public.campaign_state (phone_number, lead_source, name, created_at, updated_at)
      VALUES (NEW.phone_number, NEW.source, NEW.name, now(), now())
      ON CONFLICT (phone_number) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, campaign_state.name),
        updated_at = now();
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'sync_lead_to_campaign_state failed: % %', SQLERRM, SQLSTATE;
    END;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_new_lead_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _name text := '';
BEGIN
  BEGIN
    SELECT name INTO _name FROM public.leads WHERE phone_number = NEW.phone_number LIMIT 1;
    _name := COALESCE(_name, NEW.name, '');

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
$function$;
