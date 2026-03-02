CREATE OR REPLACE FUNCTION public.notify_new_lead_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Existing call: append lead to n8n
  PERFORM net.http_post(
    url := 'https://percentilers.app.n8n.cloud/webhook/append-lead',
    body := jsonb_build_object(
      'name', NEW.name,
      'phone', NEW.phone_number,
      'source', 'Website'
    ),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );

  -- New call: upsert campaign_state via edge function
  PERFORM net.http_post(
    url := 'https://kknunfavfvaqrphgcrku.supabase.co/functions/v1/upsert-campaign-state',
    body := jsonb_build_object(
      'phone_number', NEW.phone_number,
      'workflow_status', 'behavioural_active',
      'lead_source', 'website',
      'sequence_entry_msg', 6,
      'name', NEW.name
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'k8ne.cLdNDKAyfF'
    )
  );

  RETURN NEW;
END;
$function$;