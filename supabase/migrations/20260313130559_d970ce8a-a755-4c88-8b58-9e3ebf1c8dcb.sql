
CREATE OR REPLACE TRIGGER trg_sync_lead_to_campaign
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_to_campaign_state();
