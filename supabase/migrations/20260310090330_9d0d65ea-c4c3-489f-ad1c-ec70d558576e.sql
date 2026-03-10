
CREATE OR REPLACE FUNCTION public.sync_lead_to_campaign_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' THEN
    INSERT INTO public.campaign_state (phone_number, lead_source, created_at, updated_at)
    VALUES (NEW.phone_number, NEW.source, now(), now())
    ON CONFLICT (phone_number) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_lead_to_campaign
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.sync_lead_to_campaign_state();
