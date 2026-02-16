
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS current_status text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS target_percentile integer DEFAULT 99;
