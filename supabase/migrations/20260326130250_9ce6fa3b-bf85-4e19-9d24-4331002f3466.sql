DROP POLICY IF EXISTS "Allow all access campaign_state" ON public.campaign_state;
ALTER TABLE public.campaign_state ENABLE ROW LEVEL SECURITY;