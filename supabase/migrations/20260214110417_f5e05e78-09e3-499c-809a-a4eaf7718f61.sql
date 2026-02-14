
-- Add columns to existing leads table (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='target_year') THEN
    ALTER TABLE public.leads ADD COLUMN target_year text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='prep_level') THEN
    ALTER TABLE public.leads ADD COLUMN prep_level text;
  END IF;
END$$;

-- Create study_plan_days table
CREATE TABLE IF NOT EXISTS public.study_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  day_number INT NOT NULL,
  qa_tasks_json JSONB,
  lrdi_tasks_json JSONB,
  varc_tasks_json JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on phone_number
CREATE INDEX IF NOT EXISTS idx_study_plan_days_phone ON public.study_plan_days (phone_number);

-- Enable RLS
ALTER TABLE public.study_plan_days ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert
CREATE POLICY "Allow anonymous insert study_plan_days"
  ON public.study_plan_days FOR INSERT
  WITH CHECK (true);

-- Allow anonymous update (for marking completed)
CREATE POLICY "Allow anonymous update study_plan_days"
  ON public.study_plan_days FOR UPDATE
  USING (true);

-- Allow anonymous select (needed to fetch plan by phone)
CREATE POLICY "Allow anonymous select study_plan_days"
  ON public.study_plan_days FOR SELECT
  USING (true);
